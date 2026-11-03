import test from 'node:test';
import assert from 'node:assert/strict';
import {enterpriseTokenProvider} from '../site/app-attestation.js';
const config={projectId:'test-project',appId:'1:123:web:test',apiKey:'public-test-key'};
test('score tokens are verified by Firebase before being supplied to the AI SDK',async()=>{
 let request;
 const provider=enterpriseTokenProvider(config,'public-site-key',{execute:async key=>{assert.equal(key,'public-site-key');return 'test-recaptcha-token';},fetchImpl:async(url,options)=>{request={url,options};return {ok:true,json:async()=>({token:'test-firebase-appcheck-token',ttl:'3600s'})};},now:()=>1000});
 const result=await provider();assert.equal(result.token,'test-firebase-appcheck-token');assert.equal(result.expireTimeMillis,3601000);
 assert.match(request.url,/^https:\/\/firebaseappcheck.googleapis.com\/v1\/projects\/test-project\/apps\/1%3A123%3Aweb%3Atest:exchangeRecaptchaEnterpriseToken/);
 assert.deepEqual(JSON.parse(request.options.body),{recaptchaEnterpriseToken:'test-recaptcha-token'});assert.equal(request.options.credentials,'omit');
});
test('failed browser verification never supplies a fallback or debug token',async()=>{
 const rejected=enterpriseTokenProvider(config,'key',{execute:async()=>'score-token',fetchImpl:async()=>({ok:false,status:403})});
 await assert.rejects(rejected(),/rejected browser verification/);
 const empty=enterpriseTokenProvider(config,'key',{execute:async()=>'',fetchImpl:async()=>{throw new Error('Must not call backend');}});await assert.rejects(empty(),/no token/);
});
test('missing tokens and invalid lifetimes from the verification service are rejected',async()=>{
 for(const data of [{token:'x',ttl:'0s'},{token:'x',ttl:'bad'},{ttl:'3600s'}]){const provider=enterpriseTokenProvider(config,'key',{execute:async()=>'score-token',fetchImpl:async()=>({ok:true,json:async()=>data})});await assert.rejects(provider(),/invalid verification result/);}
});
