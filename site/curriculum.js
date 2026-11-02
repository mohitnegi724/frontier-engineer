export const TRACK_ORDER=['dsa','ai','frontend'];
export const LEVEL_ORDER=['Foundation','Core','Advanced'];

// A single ordered lesson owns all three activity associations. Validate the
// curriculum before rendering it so accidental media swaps fail clearly.
export function prepareCurriculum(input){
 if(!Array.isArray(input)||!input.length)throw new Error('The curriculum is empty.');
 const lessons=structuredClone(input),byId=new Map();
 for(const lesson of lessons){
  if(!lesson.id||byId.has(lesson.id))throw new Error('Lesson IDs must be unique.');
  if(!TRACK_ORDER.includes(lesson.track)||!LEVEL_ORDER.includes(lesson.level))throw new Error(`Invalid path or stage: ${lesson.id}`);
  if(!Number.isInteger(lesson.order)||lesson.order<1)throw new Error(`Missing step number: ${lesson.id}`);
  if(lesson.topicId!==lesson.id||['read','watch','practise'].some(activity=>lesson.alignment?.[activity]!==lesson.id)||lesson.video?.topicId!==lesson.id)throw new Error(`Activities do not share one topic: ${lesson.id}`);
  if(typeof lesson.learningObjective!=='string'||lesson.learningObjective.length<25)throw new Error(`Missing learning objective: ${lesson.id}`);
  if(!Array.isArray(lesson.prerequisites))throw new Error(`Missing prerequisites: ${lesson.id}`);
  if(!/^[\w-]{11}$/.test(lesson.video.id)||new URL(lesson.video.sourceUrl).searchParams.get('v')!==lesson.video.id)throw new Error(`Invalid video source: ${lesson.id}`);
  videoEmbedUrl(lesson.video);
  byId.set(lesson.id,lesson);
 }
 lessons.sort((a,b)=>TRACK_ORDER.indexOf(a.track)-TRACK_ORDER.indexOf(b.track)||a.order-b.order);
 for(const track of TRACK_ORDER){const path=lessons.filter(l=>l.track===track);let previous=-1;
  path.forEach((l,i)=>{if(l.order!==i+1)throw new Error(`Path steps must be consecutive: ${track}`);const rank=LEVEL_ORDER.indexOf(l.level);if(rank<previous)throw new Error(`Path difficulty moves backwards: ${track}`);previous=rank;});
 }
 const visiting=new Set(),visited=new Set();
 function visit(lesson){
  if(visiting.has(lesson.id))throw new Error(`Prerequisite cycle: ${lesson.id}`);
  if(visited.has(lesson.id))return;visiting.add(lesson.id);
  for(const id of lesson.prerequisites){const p=byId.get(id);if(!p)throw new Error(`Unknown prerequisite: ${id}`);visit(p);
   if(p.track===lesson.track&&p.order>=lesson.order)throw new Error(`Prerequisite appears after its lesson: ${lesson.id}`);
   if(LEVEL_ORDER.indexOf(p.level)>LEVEL_ORDER.indexOf(lesson.level))throw new Error(`Prerequisite is harder than its lesson: ${lesson.id}`);
  }
  visiting.delete(lesson.id);visited.add(lesson.id);
 }
 lessons.forEach(visit);
 for(let i=0;i<lessons.length;i++)for(let j=i+1;j<lessons.length;j++){
  const a=lessons[i],b=lessons[j];if(a.video.id!==b.video.id)continue;
  const av=a.video,bv=b.video;
  if(av.start==null||av.end==null||bv.start==null||bv.end==null||Math.max(av.start,bv.start)<Math.min(av.end,bv.end))throw new Error(`Different topics share an unfocused video: ${a.id}, ${b.id}`);
 }
 return lessons;
}
export function videoEmbedUrl(video){
 const url=new URL(`https://www.youtube-nocookie.com/embed/${video.id}`);url.searchParams.set('autoplay','1');url.searchParams.set('rel','0');
 const hasStart=video.start!=null,hasEnd=video.end!=null;
 if(hasStart!==hasEnd)throw new Error('A focused chapter needs both start and end.');
 if(hasStart){if(!Number.isInteger(video.start)||!Number.isInteger(video.end)||video.start<0||video.end<=video.start)throw new Error('Invalid video chapter boundaries.');url.searchParams.set('start',String(video.start));url.searchParams.set('end',String(video.end));}
 return url.href;
}
export function formatTimestamp(seconds){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
