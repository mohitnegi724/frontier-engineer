import test from 'node:test';
import assert from 'node:assert/strict';
import {GeminiConversation,selectionContext,MAX_EXCERPT,MAX_TURNS,geminiErrorMessage} from '../site/gemini-conversation.js';
import {answerMarkup} from '../site/gemini.js';

test('selection carries lesson context and bounds the passage without sending a request',()=>{
 let requests=0;const chat=new GeminiConversation({isAuthorized:()=>true,generate:()=>{requests++;}});
 chat.reset(selectionContext('x'.repeat(5000),'Vectors'));
 assert.equal(chat.context.text.length,MAX_EXCERPT);assert.equal(chat.context.truncated,true);assert.equal(requests,0);
});
test('follow-ups include the original excerpt and previous successful turns',async()=>{
 const requests=[];const chat=new GeminiConversation({isAuthorized:()=>true,generate:async contents=>{requests.push(structuredClone(contents));return 'A worked example.';}});
 chat.reset(selectionContext('A norm measures magnitude.','Vectors'));
 await chat.send('Explain this.');await chat.send('What about zero?');
 assert.match(requests[0][0].parts[0].text,/Vectors[\s\S]*A norm measures magnitude/);
 assert.deepEqual(requests[1].map(m=>m.role),['user','model','user']);assert.equal(requests[1].at(-1).parts[0].text,'What about zero?');
});
test('a failed response does not pollute history or duplicate a retried question',async()=>{
 let attempts=0;const chat=new GeminiConversation({isAuthorized:()=>true,generate:async()=>{if(++attempts===1)throw new Error('offline');return 'Answer';}});
 await assert.rejects(chat.send('Explain'));assert.equal(chat.messages.length,0);assert.equal(chat.pending,false);
 await chat.send('Explain');assert.equal(chat.messages.length,2);
});
test('overlapping requests are rejected, and old replies cannot leak into a new chat',async()=>{
 let finish;const chat=new GeminiConversation({isAuthorized:()=>true,generate:()=>new Promise(resolve=>finish=resolve)});
 const old=chat.send('First');await assert.rejects(chat.send('Second'),/wait/);
 chat.reset(selectionContext('A different passage.'));finish('An old answer');assert.equal(await old,null);assert.deepEqual(chat.messages,[]);assert.equal(chat.pending,false);
});
test('sign-out rejects new requests and discards any reply still in flight',async()=>{
 let authorized=true,finish;const chat=new GeminiConversation({isAuthorized:()=>authorized,generate:()=>new Promise(resolve=>finish=resolve)});
 const request=chat.send('Explain');authorized=false;finish('Private answer');assert.equal(await request,null);assert.deepEqual(chat.messages,[]);
 await assert.rejects(chat.send('Again'),/Sign in/);
});
test('empty, overlong, and exhausted conversations never call Gemini',async()=>{
 let calls=0;const chat=new GeminiConversation({isAuthorized:()=>true,generate:async()=>{calls++;return 'Answer';}});
 await assert.rejects(chat.send('  '),/question/);await assert.rejects(chat.send('a'.repeat(2001)),/under/);
 for(let i=0;i<MAX_TURNS;i++)await chat.send('Question '+i);
 await assert.rejects(chat.send('Too many'),/new chat/);assert.equal(calls,MAX_TURNS);
});
test('generated HTML and code remain inert, including malicious markup',()=>{
 const rendered=answerMarkup('<img src=x onerror=alert(1)>\n```html\n<script>alert(1)</script>\n```');
 assert.ok(!rendered.includes('<img'));assert.ok(!rendered.includes('<script'));assert.match(rendered,/<pre><code>&lt;script&gt;/);
});
test('quota, attestation, and network errors offer useful recovery without exposing provider details',()=>{
 assert.match(geminiErrorMessage({message:'429 API quota exceeded'}),/limit/);
 assert.match(geminiErrorMessage({message:'App Check token invalid'}),/verify/);
 assert.match(geminiErrorMessage({message:'Failed to fetch'}),/connection/);
 assert.ok(!geminiErrorMessage({message:'private request payload'}).includes('private request payload'));
});
