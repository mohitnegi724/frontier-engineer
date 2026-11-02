export const STORAGE_KEY = 'frontier-workspace-v1';
export function emptyState() { return {version:1,lessons:{},drafts:{},activity:{},capstones:{},lastLesson:null}; }
const safeKey = key => typeof key === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(key) && !['__proto__','constructor','prototype'].includes(key);
export function normalizeState(value, ids) {
  if (!value || value.version !== 1 || typeof value !== 'object') throw new Error('This is not a Frontier v1 backup.');
  const result=emptyState();
  for (const id of ids) {
    const row=value.lessons?.[id];
    if (row && typeof row==='object') result.lessons[id]={read:row.read===true,watched:row.watched===true,practised:row.practised===true,notes:typeof row.notes==='string'?row.notes.slice(0,50000):'',updatedAt:typeof row.updatedAt==='string'?row.updatedAt.slice(0,40):null};
  }
  if (value.drafts && typeof value.drafts==='object') for (const [key,code] of Object.entries(value.drafts)) if(safeKey(key)&&typeof code==='string') result.drafts[key]=code.slice(0,150000);
  if(value.activity&&typeof value.activity==='object') for(const [date,count] of Object.entries(value.activity)) if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isInteger(count)&&count>=0) result.activity[date]=Math.min(count,1000);
  for(const id of ['search','retrieval','workspace']) result.capstones[id]=value.capstones?.[id]===true;
  if(ids.includes(value.lastLesson)) result.lastLesson=value.lastLesson;
  return result;
}
export function getStats(state, lessons) {
  let read=0,watched=0,practised=0,complete=0;
  for(const lesson of lessons) {const r=state.lessons[lesson.id]||{};read+=!!r.read;watched+=!!r.watched;practised+=!!r.practised;complete+=!!(r.read&&r.watched&&r.practised);}
  return {read,watched,practised,complete,percent:Math.round((read+watched+practised)/(lessons.length*3)*100)};
}
export function localDate(date=new Date()) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function closeEnough(a,b) {
  if(typeof a==='number'&&typeof b==='number') return Number.isFinite(a)&&Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
  if(a===b)return true;
  if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((x,i)=>closeEnough(x,b[i]));
  if(a&&b&&typeof a==='object'&&typeof b==='object') {const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return JSON.stringify(ak)===JSON.stringify(bk)&&ak.every(k=>closeEnough(a[k],b[k]));}
  return false;
}
