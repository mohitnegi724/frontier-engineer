import {emptyState,normalizeState} from './state.js';

export const accountCacheKey=uid=>`frontier-account-v2:${uid}`;
const safeKey=k=>typeof k==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(k)&&!['__proto__','constructor','prototype'].includes(k);
const copy=value=>JSON.parse(JSON.stringify(value));
export function stateToRecords(state){
 const records={settings:{version:1,lastLesson:state.lastLesson??null}};
 for(const [id,data] of Object.entries(state.lessons))if(safeKey(id))records[`lesson-${id}`]=copy(data);
 for(const [id,code] of Object.entries(state.drafts))if(safeKey(id))records[`draft-${id}`]={code};
 for(const [date,count] of Object.entries(state.activity))if(/^\d{4}-\d{2}-\d{2}$/.test(date))records[`activity-${date}`]={count};
 for(const [id,complete] of Object.entries(state.capstones))if(['search','retrieval','workspace'].includes(id))records[`capstone-${id}`]={complete};
 return records;
}
export function recordsToState(records,ids){
 const state=emptyState();
 for(const [key,value] of Object.entries(records)){
  if(!value||typeof value!=='object')continue;
  if(key==='settings')state.lastLesson=value.lastLesson;
  else if(key.startsWith('lesson-')&&ids.includes(key.slice(7)))state.lessons[key.slice(7)]=value;
  else if(key.startsWith('draft-')&&safeKey(key.slice(6)))state.drafts[key.slice(6)]=value.code;
  else if(key.startsWith('activity-'))state.activity[key.slice(9)]=value.count;
  else if(key.startsWith('capstone-'))state.capstones[key.slice(9)]=value.complete;
 }
 return normalizeState(state,ids);
}

// The injected transport only accesses users/{uid}/workspace. Nothing is shared
// between instances/accounts. Pending records survive refresh in a UID-scoped cache.
export class CloudWorkspace{
 constructor({uid,ids,remote,storage,onState=()=>{},onStatus=()=>{},delay=1200}){
  this.uid=uid;this.ids=ids;this.remote=remote;this.storage=storage;this.onState=onState;this.onStatus=onStatus;this.delay=delay;
  this.pending=new Map();this.records={};this.closed=false;this.ready=false;this.serial=0;this.retryDelay=3000;this.hasLocalCache=false;
  try{
   const cache=JSON.parse(storage.getItem(accountCacheKey(uid))||'null');
   if(cache?.version===2){this.records=stateToRecords(normalizeState(cache.state,ids));this.hasLocalCache=true;
    for(const key of cache.pending||[])if(Object.hasOwn(this.records,key))this.pending.set(key,{data:copy(this.records[key]),version:++this.serial});}
  }catch{this.onStatus('error','The local recovery copy could not be read. Your cloud data will still load.');}
 }
 get state(){return recordsToState(this.records,this.ids);}
 status(kind,message){if(!this.closed)this.onStatus(kind,message);}
 persist(){try{this.storage.setItem(accountCacheKey(this.uid),JSON.stringify({version:2,state:this.state,pending:[...this.pending.keys()]}));return true;}catch{this.status('error','Browser storage is full. Keep this tab open until cloud saving finishes.');return false;}}
 start(){
  return new Promise((resolve,reject)=>{
   let settled=false;
   this.startTimer=setTimeout(()=>{if(!settled){settled=true;reject(new Error('Your cloud workspace could not be reached. Check your connection and retry.'));}},15000);
   this.unsubscribe=this.remote.subscribe(snapshot=>{
    if(this.closed)return;
    if(snapshot.pending)return;
    if(snapshot.fromCache){if(this.ready)this.status('offline','Offline — changes will sync when you reconnect.');return;}
    const before=JSON.stringify(this.state),records=copy(snapshot.records);
    for(const [key,pending]of this.pending)records[key]=copy(pending.data);
    this.records=records;this.ready=true;this.persist();
    if(!settled){settled=true;clearTimeout(this.startTimer);resolve(this.state);}
    else if(before!==JSON.stringify(this.state))this.onState(this.state);
    this.status(this.pending.size?'pending':'synced',this.pending.size?'Saving to your account…':'Saved to your account');
    if(this.pending.size)this.schedule();
   },error=>{if(this.closed)return;this.status('error','Cloud sync needs attention. Your changes remain on this device.');if(!settled){settled=true;clearTimeout(this.startTimer);reject(error);}});
  });
 }
 update(next){
  if(this.closed||!this.ready)return;
  const nextRecords=stateToRecords(normalizeState(next,this.ids));
  for(const [key,data]of Object.entries(nextRecords))if(JSON.stringify(this.records[key])!==JSON.stringify(data))this.pending.set(key,{data:copy(data),version:++this.serial});
  this.records=nextRecords;this.persist();
  if(this.pending.size){this.status('pending','Saving to your account…');this.schedule();}
 }
 schedule(){clearTimeout(this.timer);if(!this.closed)this.timer=setTimeout(()=>{this.flush().catch(()=>{});},this.delay);}
 async flush(){
  clearTimeout(this.timer);if(this.closed||!this.ready||!this.pending.size)return;
  if(this.inFlight)return this.inFlight;
  const batch=[...this.pending.entries()].slice(0,400);
  this.status('pending','Saving to your account…');
  this.inFlight=(async()=>{
   try{
    await this.remote.write(batch.map(([id,entry])=>({id,data:copy(entry.data)})));
    if(this.closed)return;
    for(const [id,entry]of batch)if(this.pending.get(id)?.version===entry.version)this.pending.delete(id);
    this.persist();this.retryDelay=3000;
    this.status(this.pending.size?'pending':'synced',this.pending.size?'Saving to your account…':'Saved to your account');
   }catch(error){
    if(!this.closed){this.persist();this.status('error','Cloud save failed — changes are kept on this device. Retry when connected.');clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush().catch(()=>{}),this.retryDelay);this.retryDelay=Math.min(30000,this.retryDelay*2);}throw error;
   }finally{this.inFlight=null;if(!this.closed&&this.pending.size&&this.retryDelay===3000)this.schedule();}
  })();
  return this.inFlight;
 }
 close(){this.closed=true;clearTimeout(this.timer);clearTimeout(this.startTimer);this.unsubscribe?.();}
}

export function mergeLegacyState(cloud,legacy,ids){
 const result=normalizeState(cloud,ids),old=normalizeState(legacy,ids);
 for(const [id,entry]of Object.entries(old.lessons)){
  const current=result.lessons[id];
  if(!current){result.lessons[id]=entry;continue;}
  for(const key of ['read','watched','practised'])current[key]=current[key]||entry[key];
  if(!current.notes)current.notes=entry.notes;
  else if(entry.notes&&entry.notes!==current.notes)current.notes=(current.notes+'\n\nImported browser notes:\n'+entry.notes).slice(0,50000);
 }
 result.drafts={...old.drafts,...result.drafts};
 for(const [day,count]of Object.entries(old.activity))result.activity[day]=Math.max(count,result.activity[day]||0);
 for(const key of ['search','retrieval','workspace'])result.capstones[key]=!!(result.capstones[key]||old.capstones[key]);
 result.lastLesson??=old.lastLesson;
 return result;
}
