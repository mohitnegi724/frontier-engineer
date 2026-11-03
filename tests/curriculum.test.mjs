import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareCurriculum,videoEmbedUrl,formatTimestamp,lessonVideo,TRACK_ORDER,LEVEL_ORDER} from '../site/curriculum.js';
const original=JSON.parse(await readFile(new URL('../site/curriculum.json',import.meta.url)));
test('every learning path has consecutive steps and progresses from Foundation through Core to Advanced',()=>{
 const ls=prepareCurriculum([...original].reverse());
 for(const track of TRACK_ORDER){const path=ls.filter(l=>l.track===track);assert.equal(path.length,8);assert.deepEqual(path.map(l=>l.order),[1,2,3,4,5,6,7,8]);assert.equal(path[0].level,'Foundation');assert.equal(path.at(-1).level,'Advanced');for(let i=1;i<path.length;i++)assert.ok(LEVEL_ORDER.indexOf(path[i].level)>=LEVEL_ORDER.indexOf(path[i-1].level));}
 assert.ok(ls.findIndex(l=>l.id==='neural-networks')<ls.findIndex(l=>l.id==='gradient-descent'));
 assert.ok(ls.findIndex(l=>l.id==='evaluation')<ls.findIndex(l=>l.id==='retrieval'));
 assert.ok(ls.findIndex(l=>l.id==='frontend-architecture')<ls.findIndex(l=>l.id==='react-state'));
});
test('every lesson offers 2–4 distinct explanations and every video matches its Read/Practise topic',()=>{const ls=prepareCurriculum(original),videos=ls.flatMap(l=>l.videos);assert.equal(videos.length,49);assert.equal(new Set(videos.map(v=>v.id)).size,49);for(const l of ls){assert.ok(l.videos.length>=2&&l.videos.length<=4);assert.equal(l.topicId,l.id);assert.deepEqual(Object.values(l.alignment),[l.id,l.id,l.id]);for(const v of l.videos){assert.equal(v.topicId,l.id);assert.ok(v.note.length>50);assert.ok(v.reviewedAt);assert.ok(v.label);}}});
test('curriculum validation rejects a swapped activity or any mismatched video in the list',()=>{const ls=structuredClone(original);ls[0].videos[1]=ls[1].videos[0];assert.throws(()=>prepareCurriculum(ls),/share one topic/);const other=structuredClone(original);other[0].alignment.watch=other[1].id;assert.throws(()=>prepareCurriculum(other),/share one topic/);});
test('prerequisites cannot point to a missing, later, cyclic, or more difficult lesson',()=>{
 let ls=structuredClone(original);ls[0].prerequisites=['missing'];assert.throws(()=>prepareCurriculum(ls),/Unknown prerequisite/);
 ls=structuredClone(original);ls[0].prerequisites=[ls[1].id];assert.throws(()=>prepareCurriculum(ls),/cycle|after its lesson/);
 ls=structuredClone(original);ls[0].prerequisites=['performance'];assert.throws(()=>prepareCurriculum(ls),/cycle|harder/);
});
test('a generic video cannot be assigned to multiple topics without distinct bounded chapters',()=>{const ls=structuredClone(original);ls[1].videos[0]={...ls[0].videos[0],topicId:ls[1].id};assert.throws(()=>prepareCurriculum(ls),/unfocused video/);});
test('video selection returns exactly the chosen lesson video and falls back for stale IDs',()=>{const lesson=original.find(l=>l.id==='vectors');assert.equal(lessonVideo(lesson,lesson.videos[1].id),lesson.videos[1]);assert.equal(lessonVideo(lesson,'invalid'),lesson.videos[0]);assert.equal(lessonVideo(lesson,undefined),lesson.videos[0]);assert.equal(lesson.videos[0].id,'e9U0QAFbfLI');});
test('missing, excess, duplicate, or non-YouTube videos are rejected',()=>{
 let ls=structuredClone(original);ls[0].videos=ls[0].videos.slice(0,1);assert.throws(()=>prepareCurriculum(ls),/2–4/);
 ls=structuredClone(original);ls[0].videos=Array(5).fill(ls[0].videos[0]);assert.throws(()=>prepareCurriculum(ls),/2–4/);
 ls=structuredClone(original);ls[0].videos[1]=ls[0].videos[0];assert.throws(()=>prepareCurriculum(ls),/Duplicate/);
 ls=structuredClone(original);ls[0].videos[1].sourceUrl='https://untrusted.example/watch?v='+ls[0].videos[1].id;assert.throws(()=>prepareCurriculum(ls),/Invalid video source/);
});
test('focused chapters set both the start and stop time in the embedded player',()=>{
 for(const id of ['css-layout','async']){const video=original.find(l=>l.id===id).videos[0],url=new URL(videoEmbedUrl(video));assert.equal(url.searchParams.get('start'),String(video.start));assert.equal(url.searchParams.get('end'),String(video.end));assert.ok(video.end>video.start);}
 assert.equal(formatTimestamp(1132),'18:52');assert.throws(()=>videoEmbedUrl({id:'abcdefghijk',start:60}),/both/);assert.throws(()=>videoEmbedUrl({id:'abcdefghijk',start:60,end:30}),/boundaries/);
});
