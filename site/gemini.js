import {GeminiConversation,selectionContext,geminiErrorMessage,MAX_QUESTION} from './gemini-conversation.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Keep model output inert: no generated links, HTML, scripts, or remote images.
export function answerMarkup(text){return String(text).split(/```[^\n]*\n?|```/).map((part,i)=>i%2?`<pre><code>${escape(part)}</code></pre>`:`<div class="gemini-prose">${escape(part)}</div>`).join('');}

export function mountGemini({enabled=true,generate,isAuthorized,getLesson}){
 if(!enabled){document.querySelector('#gemini-launcher').hidden=true;return {clear(){},routeChanged(){}};}
 const $=s=>document.querySelector(s),panel=$('#gemini-panel'),composer=$('#gemini-question'),messages=$('#gemini-messages'),status=$('#gemini-status');
 const chat=new GeminiConversation({generate,isAuthorized});
 let opened=false,selectionTimer,returnFocus=null;
 function paint(){
  const context=chat.context;
  $('#gemini-context-label').textContent=context.text?context.lesson:'Your learning companion';
  $('#gemini-excerpt').textContent=context.text||'Select a passage in a lesson to attach it here, or ask an engineering question.';
  $('#gemini-truncated').hidden=!context.truncated;
  messages.innerHTML=chat.messages.length?chat.messages.map(m=>`<article class="gemini-message ${m.role}"><span>${m.role==='user'?'You':'Gemini'}</span>${answerMarkup(m.text)}</article>`).join(''):'<div class="gemini-empty"><span aria-hidden="true">✳</span><h3>A little clarity goes a long way.</h3><p>Ask for a simpler explanation, a worked example, or a hint. Then keep the conversation going.</p></div>';
  if(chat.pending){const waiting=document.createElement('p');waiting.className='gemini-waiting';waiting.textContent='Gemini is thinking…';messages.append(waiting);}
  $('#gemini-send').disabled=chat.pending;composer.disabled=chat.pending;$('#gemini-suggestions').hidden=chat.messages.length>0||chat.pending;
  messages.setAttribute('aria-busy',String(chat.pending));messages.scrollTop=messages.scrollHeight;
 }
 function open(context,focus=false){
  if(!isAuthorized())return;
  if(context&&(context.text!==chat.context.text||context.lesson!==chat.context.lesson)){chat.reset(context);composer.value='';status.textContent='';paint();}
  if(!opened)returnFocus=document.activeElement;
  opened=true;panel.hidden=false;$('#gemini-launcher').hidden=true;$('#gemini-launcher').setAttribute('aria-expanded','true');document.body.classList.add('gemini-open');
  if(focus)composer.focus();
 }
 function close(){opened=false;panel.hidden=true;$('#gemini-launcher').hidden=false;$('#gemini-launcher').setAttribute('aria-expanded','false');document.body.classList.remove('gemini-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function reset(){chat.reset();composer.value='';status.textContent='';paint();}
 function capture(){
  if(!isAuthorized())return;
  const active=document.activeElement;
  let text='';
  if(active?.matches('#main textarea, #main input')&&active.selectionStart!==active.selectionEnd)text=active.value.slice(active.selectionStart,active.selectionEnd);
  else{const selected=window.getSelection();if(selected?.rangeCount&&$('#main').contains(selected.anchorNode)&&$('#main').contains(selected.focusNode))text=selected.toString();}
  if(text.trim().length<2)return;
  open(selectionContext(text,getLesson()),false);
 }
 // Debounce selection so dragging and touch handles remain usable. Opening sends nothing.
 document.addEventListener('selectionchange',()=>{clearTimeout(selectionTimer);selectionTimer=setTimeout(capture,450);});
 document.addEventListener('pointerup',event=>{if(event.target.closest('#main')){clearTimeout(selectionTimer);selectionTimer=setTimeout(capture,100);}});
 document.addEventListener('keyup',event=>{if(event.shiftKey&&event.target.closest('#main')){clearTimeout(selectionTimer);selectionTimer=setTimeout(capture,100);}});
 $('#gemini-launcher').onclick=()=>{paint();open(null,true);};
 $('#gemini-close').onclick=close;
 $('#gemini-new').onclick=()=>{reset();composer.focus();};
 $('#gemini-form').onsubmit=async event=>{
  event.preventDefault();if(chat.pending||!isAuthorized())return;
  const question=composer.value.trim();if(!question){status.textContent='Write a question first.';composer.focus();return;}
  status.textContent='';const version=chat.version;
  const pending=chat.send(question);paint();
  try{const answer=await pending;if(answer===null)return;composer.value='';status.textContent='Gemini replied. You can ask a follow-up.';}
  catch(error){if(version!==chat.version)return;status.textContent=/Sign in|Start a new chat|Keep your question/.test(error.message)?error.message:geminiErrorMessage(error);}
  finally{if(version===chat.version&&isAuthorized()){paint();if(opened)composer.focus();}}
 };
 composer.maxLength=MAX_QUESTION;
 composer.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();$('#gemini-form').requestSubmit();}});
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
 $('#gemini-suggestions').addEventListener('click',event=>{const button=event.target.closest('[data-question]');if(button){composer.value=button.dataset.question;composer.focus();}});
 paint();
 return {clear(){clearTimeout(selectionTimer);reset();close();},routeChanged(){clearTimeout(selectionTimer);},get opened(){return opened;}};
}
