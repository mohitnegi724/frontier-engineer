// Each run gets a fresh worker. The parent terminates it on timeout or navigation.
let outputCount=0;
function printable(value) {try{return typeof value==='string'?value:JSON.stringify(value)??String(value);}catch{return String(value);}}
for(const level of ['log','info','warn','error','debug']) console[level]=(...args)=>{if(outputCount++<150)postMessage({type:'log',text:args.map(printable).join(' ').slice(0,12000)});};
function equal(a,b) {if(typeof a==='number'&&typeof b==='number')return Number.isFinite(a)&&Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));if(a===b)return true;if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((x,i)=>equal(x,b[i]));if(a&&b&&typeof a==='object'&&typeof b==='object'){const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return JSON.stringify(ak)===JSON.stringify(bk)&&ak.every(k=>equal(a[k],b[k]));}return false;}
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
self.onmessage=async ({data})=>{
 try {
   const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
   const fn=await new AsyncFunction(data.code+ (data.check ? `\nreturn typeof ${data.functionName} === 'function' ? ${data.functionName} : null;` : ''))();
   let passed=0;const results=[];
   if(data.check){
     if(!fn) throw new Error(`Define function ${data.functionName} before checking your solution.`);
     for(const test of data.tests){try{const actual=await fn(...freeze(structuredClone(test.args)));const ok=equal(actual,test.expected);if(ok)passed++;results.push({label:test.label,pass:ok,actual:printable(actual),expected:printable(test.expected)});}catch(error){results.push({label:test.label,pass:false,error:String(error.message||error)});}}
   }
   postMessage({type:'done',passed,total:results.length,results});
 } catch(error){postMessage({type:'error',text:String(error.stack||error)});}
};
