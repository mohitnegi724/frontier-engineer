// Code runs in a worker owned by an opaque-origin iframe, so playground code
// cannot read the app's Firebase Auth persistence (including IndexedDB).
const sourcePromises=new Map();
function sourceFor(language){const file=language==='python'?'python-runner.js':'runner.js';if(!sourcePromises.has(file))sourcePromises.set(file,fetch(new URL(file,import.meta.url)).then(response=>{if(!response.ok)throw new Error('The code runner could not load.');return response.text();}).catch(error=>{sourcePromises.delete(file);throw error;}));return sourcePromises.get(file);}
export class IsolatedRunner{
 constructor(language){
  this.closed=false;this.frame=document.createElement('iframe');this.frame.hidden=true;this.frame.setAttribute('sandbox','allow-scripts');this.frame.title='Isolated code execution';
  this.nonce=crypto.randomUUID();
  const cdn=language==='python'?' https://cdn.jsdelivr.net':'';
  const policy=`default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:${cdn}; worker-src blob:; connect-src ${language==='python'?'https://cdn.jsdelivr.net':"'none'"};`;
  const bootstrap=`let worker;addEventListener('message',event=>{if(event.source!==parent||!event.data||event.data.type!=='start')return;const {nonce,source,payload}=event.data;try{worker=new Worker(URL.createObjectURL(new Blob([source],{type:'text/javascript'})));worker.onmessage=e=>parent.postMessage({nonce,data:e.data},'*');worker.onerror=e=>parent.postMessage({nonce,error:e.message||'Runner error'},'*');worker.postMessage(payload);}catch(error){parent.postMessage({nonce,error:error.message},'*');}});parent.postMessage({ready:true},'*');`;
  this.ready=new Promise(resolve=>{this.resolveReady=resolve;});
  this.listener=event=>{if(this.closed||event.source!==this.frame.contentWindow)return;if(event.data?.ready){this.resolveReady();return;}if(event.data?.nonce!==this.nonce)return;if(event.data.error)this.onerror?.({message:event.data.error});else this.onmessage?.({data:event.data.data});};
  window.addEventListener('message',this.listener);this.frame.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="${policy}"><script>${bootstrap}<\/script>`;document.body.append(this.frame);
  this.source=sourceFor(language);
 }
 postMessage(payload){Promise.all([this.ready,this.source]).then(([,source])=>{if(!this.closed)this.frame.contentWindow.postMessage({type:'start',nonce:this.nonce,source,payload},'*');}).catch(error=>{if(!this.closed)this.onerror?.({message:error.message});});}
 terminate(){this.closed=true;window.removeEventListener('message',this.listener);this.frame.remove();}
}
