// Pyodide is downloaded only when Python is first run, inside this worker.
self.onmessage=async ({data})=>{
 try{
  postMessage({type:'log',text:'Loading Python (first run downloads the browser runtime)…'});
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
  const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
  let count=0;
  py.setStdout({batched:text=>{if(count++<150)postMessage({type:'log',text:text.slice(0,12000)});}});
  py.setStderr({batched:text=>{if(count++<150)postMessage({type:'log',text:text.slice(0,12000)});}});
  postMessage({type:'ready'});
  await py.runPythonAsync(data.code);
  postMessage({type:'done',results:[],total:0,passed:0});
 }catch(error){postMessage({type:'error',text:String(error.message||error)});}
};
