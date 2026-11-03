import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {emptyState,normalizeState,getStats,closeEnough,localDate} from '../site/state.js';
const lessons=JSON.parse(await readFile(new URL('../site/curriculum.json',import.meta.url)));
const ids=lessons.map(l=>l.id);
test('curriculum covers three paths with unique lessons and executable checks',()=>{
 assert.equal(lessons.length,24);assert.equal(new Set(ids).size,24);
 for(const track of ['dsa','ai','frontend'])assert.equal(lessons.filter(l=>l.track===track).length,8);
 for(const l of lessons){assert.match(l.id,/^[a-z0-9-]+$/);assert.ok(l.videos.length>=2&&l.videos.length<=4);for(const v of l.videos)assert.match(v.id,/^[\w-]{11}$/);assert.equal(new URL(l.source).protocol,'https:');assert.equal(l.sections.length,3);assert.equal(l.tests.length,4);assert.ok(l.sections.every(s=>s.body.length>200));}
});
for(const l of lessons)test(`reference solution: ${l.title}`,()=>{
 const ctx=vm.createContext({});vm.runInContext(l.solution,ctx,{timeout:200});
 for(const t of l.tests){ctx.input=structuredClone(t.args);vm.runInContext('function freeze(v){if(v&&typeof v==="object"){Object.freeze(v);Object.values(v).forEach(freeze);}return v;} freeze(input);',ctx,{timeout:200});const actual=vm.runInContext(`${l.functionName}(...input)`,ctx,{timeout:200});assert.ok(closeEnough(actual,t.expected),`${t.label}: ${JSON.stringify(actual)} !== ${JSON.stringify(t.expected)}`);}
});
test('progress tracks activities separately from complete topics',()=>{const s=emptyState();s.lessons[ids[0]]={read:true};assert.deepEqual(getStats(s,lessons),{read:1,watched:0,practised:0,complete:0,percent:1});s.lessons[ids[0]]={read:true,watched:true,practised:true};assert.equal(getStats(s,lessons).complete,1);assert.equal(getStats(s,lessons).percent,4);});
test('backup round trip preserves notes, code, last lesson and progress',()=>{
 const s=emptyState();s.lessons[ids[0]]={read:true,watched:false,practised:true,notes:'<script>literal note</script>',updatedAt:'2026-11-02'};s.drafts[ids[0]]='console.log("hello")';s.activity['2026-11-02']=3;s.lastLesson=ids[0];s.capstones.search=true;
 const restored=normalizeState(JSON.parse(JSON.stringify(s)),ids);assert.equal(restored.lessons[ids[0]].notes,s.lessons[ids[0]].notes);assert.equal(restored.drafts[ids[0]],s.drafts[ids[0]]);assert.equal(restored.activity['2026-11-02'],3);assert.equal(restored.lastLesson,ids[0]);assert.equal(restored.capstones.search,true);
});
test('backup validation rejects bad versions and strips unsafe or unknown data',()=>{
 assert.throws(()=>normalizeState({version:2},ids));assert.throws(()=>normalizeState(null,ids));const data=JSON.parse('{"version":1,"lessons":{"unknown":{"read":true},"complexity":{"read":"yes","notes":42}},"drafts":{"__proto__":"bad","constructor":"bad","javascript-free":"ok"},"activity":{"junk":5,"2026-11-02":-1}}');const s=normalizeState(data,ids);assert.equal(s.lessons.unknown,undefined);assert.equal(s.lessons.complexity.read,false);assert.equal(s.lessons.complexity.notes,'');assert.deepEqual(Object.keys(s.drafts),['javascript-free']);assert.deepEqual(s.activity,{});
});
test('numeric comparison handles tolerance and nested unordered objects',()=>{assert.equal(closeEnough([0.1+0.2],[0.3]),true);assert.equal(closeEnough(NaN,0),false);assert.equal(closeEnough(Infinity,Infinity),false);assert.equal(closeEnough({a:1,b:2},{b:2,a:1}),true);assert.equal(closeEnough({a:1},{a:1,b:2}),false);});
test('activity dates follow the local calendar',()=>{assert.equal(localDate(new Date(2026,10,2,0,1)),'2026-11-02');});
test('the worker reports logs, passing checks, and execution errors',async()=>{const source=await readFile(new URL('../site/runner.js',import.meta.url),'utf8'),messages=[];const context=vm.createContext({postMessage:m=>messages.push(m),console:{},self:{},structuredClone});vm.runInContext(source,context);await context.self.onmessage({data:{code:'console.log("hello");function sum(a,b){return a+b}',check:true,functionName:'sum',tests:[{args:[1,2],expected:3,label:'adds'}]}});assert.ok(messages.some(m=>m.type==='log'&&m.text==='hello'));assert.ok(messages.some(m=>m.type==='done'&&m.passed===1));messages.length=0;await context.self.onmessage({data:{code:'throw new Error("intentional")',check:false}});assert.equal(messages[0].type,'error');assert.match(messages[0].text,/intentional/);});
