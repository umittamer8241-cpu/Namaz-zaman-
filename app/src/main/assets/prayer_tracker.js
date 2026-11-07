/* Integrated prayer tracking: five checkboxes directly on today's time tiles. */
(function(){
"use strict";
const PRAYERS=['fajr','dhuhr','asr','maghrib','isha'];
const STORAGE='nz_prayer_check_v09'; // preserve prior progress and history
const isTurkish=()=>window.NamazI18n?.getLanguage?.()==='tr';
const $=id=>document.getElementById(id);
let journal=load(),lastDay='';
function load(){
 try{const v=JSON.parse(localStorage.getItem(STORAGE)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
 catch(_){return {};}
}
function store(){try{localStorage.setItem(STORAGE,JSON.stringify(journal));}catch(_){}}
function today(){
 if(window.NamazApp?.activeDayKey)return window.NamazApp.activeDayKey();
 const date=new Date();return [date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
}
function dayData(key){const entry=journal[key];return entry&&typeof entry==='object'?entry:{};}
function count(day){return PRAYERS.filter(id=>dayData(day)[id]===true).length;}
function setCompleted(id,checked){
 const key=today();
 if(!PRAYERS.includes(id))return;
 if(!journal[key]||typeof journal[key]!=='object')journal[key]={};
 journal[key][id]=checked;store();render();
}
function render(){
 const schedule=$('schedule');if(!schedule)return;
 const key=today();lastDay=key;
 const heading=$('nz-prayer-summary-label');
 if(heading)heading.textContent=isTurkish()?'✓ Namaz takibi · Kıldığın vakti işaretle':'✓ Prayer tracking · Mark prayers you completed';
 const countLabel=$('nz-prayer-progress');
 if(countLabel)countLabel.textContent=(isTurkish()?'Kılınan: ':'Completed: ')+count(key)+'/5';
 for(const tile of schedule.querySelectorAll('.time-tile[data-prayer]')){
   const id=tile.getAttribute('data-prayer');
   let control=tile.querySelector('.nz-tile-completion');
   if(!PRAYERS.includes(id)){
     if(control)control.remove();continue;
   }
   if(!control){
     control=document.createElement('label');
     control.className='nz-tile-completion';
     const input=document.createElement('input');
     input.type='checkbox';input.dataset.markPrayer=id;
     input.setAttribute('aria-label',(isTurkish()?'Kıldım: ':'Completed: ')+id);
     input.addEventListener('change',()=>setCompleted(id,input.checked));
     const label=document.createElement('span');label.className='nz-tile-check-label';
     control.appendChild(input);control.appendChild(label);tile.appendChild(control);
   }
   const checkbox=control.querySelector('input');
   checkbox.checked=dayData(key)[id]===true;
   control.classList.toggle('done',checkbox.checked);
   control.querySelector('.nz-tile-check-label').textContent=isTurkish()?'Kıldım':'Prayed';
 }
}
function start(){
 const schedule=$('schedule');if(!schedule)return;
 const observer=new MutationObserver(records=>{
   if(records.some(record=>record.target===schedule&&record.type==='childList'))render();
 });
 observer.observe(schedule,{childList:true});
 render();
 const language=$('app-language');
 if(language)language.addEventListener('change',()=>setTimeout(render,0));
 ['timezone-mode','utc-offset'].forEach(id=>{
   const input=$(id);if(input)input.addEventListener('change',()=>setTimeout(render,0));
 });
 setInterval(()=>{if(lastDay!==today())render();},15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
