/* v0.9 manual prayer-completion tracker. Offline only. No assumption of prayer completion. */
(function(){
"use strict";
const ID=["fajr","dhuhr","asr","maghrib","isha"];
const TR=["Sabah","Öğle","İkindi","Akşam","Yatsı"];
const EN=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
const KEY="nz_prayer_check_v09";
const $=id=>document.getElementById(id);
const isTr=()=>window.NamazI18n&&window.NamazI18n.getLanguage&&window.NamazI18n.getLanguage()==="tr";
let state=load(), viewed=null, lastToday=null;
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{};}catch(_){return {};}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}}
function today(){
 if(window.NamazApp&&typeof window.NamazApp.activeDayKey==="function")return window.NamazApp.activeDayKey();
 const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join("-");
}
function dayDate(key){const [y,m,d]=key.split("-").map(Number);return new Date(Date.UTC(y,m-1,d));}
function formatKey(date){return [date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate()].join("-");}
function previous(key,days){const d=dayDate(key);d.setUTCDate(d.getUTCDate()+days);return formatKey(d);}
function showDate(key){return new Intl.DateTimeFormat(isTr()?"tr-TR":"en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(dayDate(key));}
function getDay(key){const x=state[key];return x&&typeof x==="object"&&!Array.isArray(x)?x:{};}
function make(t,cls,text){const el=document.createElement(t);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function btn(text,fn){const b=make("button","secondary",text);b.type="button";b.addEventListener("click",fn);return b;}
function render(){
 const host=$("nz-prayer-tracker");if(!host)return;
 const current=today();lastToday=current;
 if(!viewed||dayDate(viewed)>dayDate(current))viewed=current;
 host.replaceChildren();
 host.appendChild(make("div","small-label",isTr()?"Namaz Takibi":"Prayer Tracking"));
 host.appendChild(make("p","loc-sub",isTr()?"Kıldığın vakti işaretle. Kayıt yalnızca bu telefonda saklanır.":"Mark prayers you completed. Records stay on this phone."));
 const navigation=make("div","nz-tracker-navigation");
 const prev=btn("‹",()=>{viewed=previous(viewed,-1);render();});
 prev.setAttribute("aria-label",isTr()?"Önceki gün":"Previous day");
 navigation.appendChild(prev);
 navigation.appendChild(make("strong","nz-day-name",showDate(viewed)));
 const next=btn("›",()=>{viewed=previous(viewed,1);render();});
 next.disabled=viewed===current;
 next.setAttribute("aria-label",isTr()?"Sonraki gün":"Next day");
 navigation.appendChild(next);
 host.appendChild(navigation);
 const day=getDay(viewed);
 const complete=ID.filter(id=>day[id]===true).length;
 const bar=make("div","nz-tracker-progress");
 bar.appendChild(make("span","",complete+"/5"));
 const gauge=make("div","nz-progress-rail");
 const fill=make("div","nz-progress-fill");fill.style.width=(complete/5*100)+"%";gauge.appendChild(fill);
 bar.appendChild(gauge);host.appendChild(bar);
 const list=make("div","nz-track-grid");
 ID.forEach((id,i)=>{
   const row=make("label","nz-track-row");
   row.dataset.prayerId=id;
   const check=document.createElement("input");check.type="checkbox";check.checked=day[id]===true;
   check.setAttribute("aria-label",(isTr()?TR:EN)[i]);
   check.addEventListener("change",()=>{
      if(!state[viewed]||typeof state[viewed]!=="object")state[viewed]={};
      state[viewed][id]=check.checked;
      save();render();
   });
   row.appendChild(check);
   row.appendChild(make("span","",isTr()?TR[i]:EN[i]));
   if(day[id]===true)row.appendChild(make("span","nz-check-mark","✓"));
   list.appendChild(row);
 });
 host.appendChild(list);
 host.appendChild(make("p","loc-sub",isTr()?
  "Güneş doğuşu bir namaz vakti değildir; takipte işaretlenmez. İşaretlemeler kişisel kayıttır, uygulama kendiliğinden kılındı saymaz.":
  "Sunrise is not a prayer to mark. Completion is entered manually; the app never assumes a prayer was performed."));
}
function setup(){
 viewed=today();render();
 const schedule=$("schedule");
 if(schedule)schedule.addEventListener("click",e=>{
   const tile=e.target.closest("[data-prayer]");
   if(!tile||!ID.includes(tile.dataset.prayer))return;
   viewed=today();render();
   const host=$("nz-prayer-tracker");if(host)host.scrollIntoView({behavior:"smooth",block:"center"});
   const row=host&&host.querySelector('[data-prayer-id="'+tile.dataset.prayer+'"]');
   if(row){row.classList.add("nz-selected-prayer");setTimeout(()=>row.classList.remove("nz-selected-prayer"),1500);}
 });
 const language=$("app-language");if(language)language.addEventListener("change",()=>setTimeout(render,0));
 ["timezone-mode","utc-offset"].forEach(id=>{const x=$(id);if(x)x.addEventListener("change",()=>{viewed=today();render();});});
 setInterval(()=>{if(lastToday!==today()){viewed=today();render();}},30000);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();