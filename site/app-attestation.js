// Use Google's score-based execute API, then let Firebase verify the result.
// Only Firebase's returned App Check token is handed to the AI SDK.
let enterpriseScript;
function verificationError(message){const error=new Error(message);error.code='appCheck/verification-failed';return error;}
async function executeEnterprise(siteKey){
 if(!enterpriseScript)enterpriseScript=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://www.google.com/recaptcha/enterprise.js?render='+encodeURIComponent(siteKey);script.async=true;
  const timer=setTimeout(()=>reject(verificationError('App Check browser verification timed out.')),20000);
  script.onload=()=>{if(!window.grecaptcha?.enterprise){clearTimeout(timer);reject(verificationError('App Check browser script did not initialize.'));return;}window.grecaptcha.enterprise.ready(()=>{clearTimeout(timer);resolve(window.grecaptcha.enterprise);});};
  script.onerror=()=>{clearTimeout(timer);script.remove();reject(verificationError('App Check browser script could not load.'));};document.head.append(script);
 }).catch(error=>{enterpriseScript=null;throw error;});
 const enterprise=await enterpriseScript;
 return enterprise.execute(siteKey,{action:'fire_app_check'});
}
export function enterpriseTokenProvider(config,siteKey,{execute=executeEnterprise,fetchImpl=fetch,now=Date.now}={}){
 return async()=>{
  const recaptchaEnterpriseToken=await execute(siteKey);
  if(typeof recaptchaEnterpriseToken!=='string'||!recaptchaEnterpriseToken)throw verificationError('App Check browser verification returned no token.');
  const url=`https://firebaseappcheck.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/apps/${encodeURIComponent(config.appId)}:exchangeRecaptchaEnterpriseToken?key=${encodeURIComponent(config.apiKey)}`;
  const response=await fetchImpl(url,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({recaptchaEnterpriseToken}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw verificationError(`App Check rejected browser verification (HTTP ${response.status}).`);
  const data=await response.json(),ttl=Number(String(data.ttl).replace(/s$/,''));
  if(typeof data.token!=='string'||!data.token||!Number.isFinite(ttl)||ttl<=0)throw verificationError('App Check returned an invalid verification result.');
  return {token:data.token,expireTimeMillis:now()+ttl*1000};
 };
}
