/* v0.9 learning UI. Offline text and approved CC0 audio; no external API or tracking. */
(function() {
"use strict";
const DATA = window.NamazLearningContent;
if (!DATA) return;
const $ = id => document.getElementById(id);
const LABELS = {
tr:{surah:"Günün Suresi — Her Gün Sıradaki Sure",dua:"Günün Duası",esma:"Esmaül Hüsna — 99 İsim",intro:"Arapça metin · okunuş · anlam özeti · dinleyerek tekrar",
memorized:"Ezberledim",forget:"Ezber işaretini kaldır",listen:"Dinle",stop:"Durdur",repeat:"Tekrar",audioWait:"Bu sure için lisanslı ses henüz eklenmedi.",
reading:"Türkçe okunuş",meaning:"Anlam özeti (resmî meal değildir)",showReading:"Okunuşu göster",
source:"Metni ve açıklamayı kaynaktan incele",sound:"Ses: CC0 lisanslı tilavet",
count:"Ezberlenen sure",learned:"Öğrendim",notLearned:"İşareti kaldır",namesCount:"Öğrenilen isim",
search:"İsim veya anlam ara",titleMore:"Kısa Türkçe anlam",newDay:"Dua her gün yenilenir",languageNote:"Bu içerikte Türkçe kısa açıklamalar kullanılmıştır.",
practice:"Ezber için okunuşu gizleyebilir ve sureyi 1, 3 veya 5 kez dinleyebilirsiniz.",
translit:"Okunuş yaklaşık bir yardımcıdır. Doğru telaffuz için ehil öğreticiden destek alın.",
noAudio:"Sesli tilavet henüz mevcut değil",none:"Sonuç bulunamadı",onlyTr:"İsimlerin anlamları şu an Türkçedir.",end:"Daha fazla göster",ready:"Dinleme hazır.",playing:"Dinleniyor...",failed:"Ses oynatılamadı."},
en:{surah:"Surah of the Day — Sequential Rotation",dua:"Daily Supplication",esma:"Beautiful Names — 99 Names",intro:"Arabic · pronunciation aid · meaning summary · audio practice",
memorized:"Mark memorized",forget:"Unmark memorized",listen:"Play recitation",stop:"Stop",repeat:"Repetitions",audioWait:"Approved audio not yet available for this surah.",
reading:"Pronunciation aid (Turkish)",meaning:"Meaning summary (not a formal translation)",showReading:"Show pronunciation aid",
source:"Check source text and commentary",sound:"Audio: CC0 licensed recitation",
count:"Surahs memorized",learned:"Mark learned",notLearned:"Unmark learned",namesCount:"Names learned",
search:"Search names or meanings",titleMore:"Short Turkish meaning",newDay:"The prayer changes each day",languageNote:"Brief meanings are provided in Turkish.",
practice:"Hide pronunciation while memorizing, and play the surah 1, 3 or 5 times.",
translit:"Transliteration is an approximation, not a substitute for accurate instruction.",
noAudio:"No approved recitation yet",none:"No results",onlyTr:"Meanings of names are currently in Turkish.",end:"Show more",ready:"Ready to listen.",playing:"Playing...",failed:"Audio could not be played."}
};
let chosenSurah = null, lastSurahDay = "", showTranslit = true;
let lastEsmaDay = "";
let playing = null, remaining = 0;
let savedSurahs = readObject("nz_surah_memorized_v09");
let savedNames = readObject("nz_esma_learned_v09");
let lastDuaDay = "";
function lang(){return window.NamazI18n && window.NamazI18n.getLanguage && window.NamazI18n.getLanguage() === "tr" ? "tr" : "en";}
function t(key){return LABELS[lang()][key] || key;}
function el(tag,txt,cl){const node=document.createElement(tag);if(txt!==undefined&&txt!==null)node.textContent=txt;if(cl)node.className=cl;return node;}
function button(label,fn,cl){const b=el("button",label,cl||"secondary");b.type="button";b.addEventListener("click",fn);return b;}
function readObject(key){try{const x=JSON.parse(localStorage.getItem(key)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{};}catch(_){return {};}}
function save(key,x){try{localStorage.setItem(key,JSON.stringify(x));}catch(_){}}
function currentDay(){
 if(window.NamazApp && typeof window.NamazApp.activeDayKey==="function") return window.NamazApp.activeDayKey();
 const d=new Date(); return [d.getFullYear(),d.getMonth()+1,d.getDate()].join("-");
}
function dayOrdinal(key){
 const parts=String(key||"").split("-").map(Number);
 if(parts.length!==3||!Number.isInteger(parts[0])||!Number.isInteger(parts[1])||!Number.isInteger(parts[2]))return NaN;
 const millis=Date.UTC(parts[0],parts[1]-1,parts[2]);
 const dt=new Date(millis);
 return dt.getUTCFullYear()===parts[0]&&dt.getUTCMonth()===parts[1]-1&&dt.getUTCDate()===parts[2] ? Math.floor(millis/86400000) : NaN;
}
// Fixed calendar anchor prevents a repeated "first day" after uninstall,
// reinstall, app update, permission changes or a different offline device.
// Day 1 is 2026-11-07, the original daily-catalog release.
const SEQUENCE_ANCHOR="2026-11-07";
function dailyIndex(day,n,sequenceKey="nz_dua_sequence_start_v09"){
 if(!Number.isInteger(n)||n<1)return 0;
 const current=dayOrdinal(day),start=dayOrdinal(SEQUENCE_ANCHOR);
 if(!Number.isFinite(current)||!Number.isFinite(start))return 0;
 return Math.max(0,current-start)%n;
}
function stopAudio(){
 if(playing){try{playing.pause();playing.currentTime=0;playing.onended=null;}catch(_){}}
 playing=null;remaining=0;
 const s=$("nz-surah-audio-status");if(s)s.textContent="";
}
function playAudio(surah){
 stopAudio();
 if(!surah.audio)return;
 const repeats=$("nz-surah-repeat");
 remaining=repeats?Math.min(5,Math.max(1,Number(repeats.value)||1)):1;
 const audio=new Audio(surah.audio);
 playing=audio;
 audio.preload="none";
 audio.onended=function(){
  if(playing!==audio)return;
  remaining--;
  if(remaining>0){audio.currentTime=0;const p=audio.play();if(p&&p.catch)p.catch(()=>{stopAudio();audioError();});}
  else{stopAudio();const status=$("nz-surah-audio-status");if(status)status.textContent=t("ready");}
 };
 audio.onerror=function(){stopAudio();audioError();};
 const status=$("nz-surah-audio-status");if(status)status.textContent=t("playing");
 try{const p=audio.play();if(p&&p.catch)p.catch(()=>{stopAudio();audioError();});}catch(_){stopAudio();audioError();}
}
function audioError(){const x=$("nz-surah-audio-status");if(x)x.textContent=t("failed");}
function makeLink(url,label){
 const a=el("a",label,"nz-source-link");a.href=url;a.rel="noopener noreferrer";return a;
}
function buildSectionTitle(host,name,subtitle){
 host.replaceChildren();
 host.appendChild(el("div",name,"small-label"));
 if(subtitle)host.appendChild(el("p",subtitle,"loc-sub"));
}
function renderSurah(force=false){
 const host=$("nz-surah-learning");if(!host)return;
 const day=currentDay();
 if(!force&&lastSurahDay===day)return;
 if(lastSurahDay!==day||chosenSurah===null){
   chosenSurah=DATA.surahs[dailyIndex(day,DATA.surahs.length,"nz_surah_daily_anchor_v026")]?.id||DATA.surahs[0].id;
 }
 lastSurahDay=day;
 stopAudio();
 buildSectionTitle(host,t("surah"),t("intro"));
 host.appendChild(el("p",
   (lang()==="tr"?"Bugünün suresi":"Surah of the day")+
   " · "+day+" · "+(dailyIndex(day,DATA.surahs.length)+1)+"/"+DATA.surahs.length,
   "nz-progress nz-surah-daily-progress"));
 const nav=el("div",null,"nz-learn-row");
 const picker=el("select");picker.id="nz-surah-select";picker.setAttribute("aria-label",t("surah"));
 DATA.surahs.forEach(x=>{const o=el("option",x.number+". "+(lang()==="tr"?x.tr:x.en));o.value=x.id;picker.appendChild(o);});
 picker.value=chosenSurah;picker.addEventListener("change",()=>{chosenSurah=picker.value;renderSurah(true);});
 nav.appendChild(picker);
 const progress=el("strong",Object.values(savedSurahs).filter(Boolean).length+"/"+DATA.surahs.length,"nz-progress");
 nav.appendChild(progress);host.appendChild(nav);
 const surah=DATA.surahs.find(x=>x.id===chosenSurah)||DATA.surahs[0];
 if(surah.number!==1)host.appendChild(el("p","بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ","nz-arabic nz-basmala"));
 const verses=el("div",null,"nz-verse-list");
 surah.verses.forEach((v,i)=>{
   const box=el("div",null,"nz-verse");
   box.appendChild(el("span",String(i+1),"nz-verse-num"));
   const ar=el("div",v[0],"nz-arabic");ar.dir="rtl";ar.lang="ar";box.appendChild(ar);
   if(showTranslit)box.appendChild(el("div",v[1],"nz-phonetic"));
   verses.appendChild(box);
 });
 host.appendChild(verses);
 host.appendChild(el("div",t("meaning"),"nz-mini-label"));
 host.appendChild(el("p",lang()==="tr"?surah.meaningTr:surah.meaningEn,"nz-meaning"));
 const controls=el("div",null,"nz-learn-controls");
 const read=el("label",null,"nz-check-label");
 const check=document.createElement("input");check.type="checkbox";check.checked=showTranslit;check.addEventListener("change",()=>{showTranslit=check.checked;renderSurah(true);});
 read.appendChild(check);read.appendChild(el("span",t("showReading")));controls.appendChild(read);
 const mastered=button(savedSurahs[surah.id]?t("forget"):t("memorized"),()=>{savedSurahs[surah.id]=!savedSurahs[surah.id];save("nz_surah_memorized_v09",savedSurahs);renderSurah(true);});
 mastered.className=savedSurahs[surah.id]?"nz-done":"secondary";controls.appendChild(mastered);
 host.appendChild(controls);
 const audioRow=el("div",null,"nz-learn-controls");
 if(surah.audio){
   const rpt=el("label",t("repeat")+" ","nz-repeat-label");
   const select=el("select");select.id="nz-surah-repeat";
   [1,3,5].forEach(n=>{const o=el("option",String(n)+"×");o.value=String(n);select.appendChild(o);});
   rpt.appendChild(select);audioRow.appendChild(rpt);
   audioRow.appendChild(button(t("listen"),()=>playAudio(surah)));
   audioRow.appendChild(button(t("stop"),stopAudio));
 } else audioRow.appendChild(el("span",t("audioWait"),"loc-sub"));
 host.appendChild(audioRow);
 host.appendChild(el("p","", "loc-sub")).id="nz-surah-audio-status";
 host.appendChild(el("p",t("practice")+" "+t("translit"),"loc-sub"));
 const source=el("div",null,"nz-source");source.appendChild(makeLink(surah.link,t("source")));
 host.appendChild(source);
}
function renderDua(force){
 const host=$("nz-dua-learning");if(!host)return;
 const day=currentDay();if(!force&&day===lastDuaDay)return;lastDuaDay=day;
 const position=dailyIndex(day,DATA.duas.length);
 const dua=DATA.duas[position];
 buildSectionTitle(host,t("dua"),t("newDay"));
 const counter=(lang()==="tr"?"Dua ":"Dua ")+(position+1)+" / "+DATA.duas.length+
   " · "+day+" · "+(lang()==="tr"?"Her gün sıradaki dua":"One per day, in order");
 host.appendChild(el("p",counter,"nz-progress nz-dua-progress"));
 if(dua.title)host.appendChild(el("h3",dua.title,"nz-dua-title"));
 const ar=el("p",dua.ar,"nz-arabic nz-dua-arabic");ar.lang="ar";ar.dir="rtl";host.appendChild(ar);
 host.appendChild(el("p",dua.latin,"nz-phonetic"));
 host.appendChild(el("div",t("meaning"),"nz-mini-label"));
 host.appendChild(el("p",lang()==="tr"?dua.tr:dua.en,"nz-meaning"));
 host.appendChild(makeLink(dua.url,dua.ref+" · "+t("source")));
}
function renderNames(force=true){
 const host=$("nz-esma-learning");if(!host)return;
 const day=currentDay();if(!force&&day===lastEsmaDay)return;lastEsmaDay=day;
 const position=dailyIndex(day,DATA.names.length,"nz_esma_sequence_start_v10");
 const item=DATA.names[position];
 const esma=window.NamazEsmaI18n;
 const localized=key=>esma?esma.text(key):t(key);
 buildSectionTitle(host,localized("title"),localized("subtitle"));
 if(!item)return;
 const head=el("div",null,"nz-learn-row");
 head.appendChild(el("strong",(position+1)+" / "+DATA.names.length,"nz-progress"));
 const count=el("span",localized("count")+": "+Object.keys(savedNames).filter(k=>savedNames[k]).length+"/99","loc-sub");
 count.id="nz-esma-count";head.appendChild(count);host.appendChild(head);
 const wrap=el("div",null,"nz-esma-item nz-esma-today");
 const title=el("div",null,"nz-esma-label");
 title.appendChild(el("span",String(item.number).padStart(2,"0"),"nz-index"));
 title.appendChild(el("strong",item.name));
 const arab=el("span",item.ar,"nz-esma-ar");arab.lang="ar";arab.dir="rtl";title.appendChild(arab);
 wrap.appendChild(title);
 const meaning=el("p",esma?esma.meaning(item):item.meaningTr,"nz-esma-meaning");
 meaning.lang=esma?esma.language():"tr";wrap.appendChild(meaning);
 const checked=!!savedNames[item.number];
 const done=button(checked?localized("unlearn"):localized("learned"),()=>{
   savedNames[item.number]=!savedNames[item.number];save("nz_esma_learned_v09",savedNames);renderNames(true);
 },checked?"nz-done":"secondary");
 done.setAttribute("aria-pressed",checked?"true":"false");
 wrap.appendChild(done);host.appendChild(wrap);
 const info=el("p",localized("info"),"loc-sub");
 host.appendChild(info);
 host.appendChild(el("p",localized("note"),"loc-sub"));
 host.appendChild(makeLink("https://www.diyanet.gov.tr/icerik/10462",localized("source")));
}
function refresh(){
 renderDua(true);renderSurah(true);renderNames();
 const foot=$("nz-developer-note");
 if(foot)foot.textContent=lang()==="tr"?
  "Namaz Zamanı, Ümit Tamer tarafından ibadet vakitlerinin takibine ve dinî öğrenmeye yardımcı olmak amacıyla hazırlanmıştır. Ücretsiz ve kâr amacı güdülmeden sunulur. Resmî bir dinî kurumun uygulaması değildir; hesaplanan vakitler yerel takvimden farklı olabilir.":
  "Namaz Zamanı was developed by Ümit Tamer to assist with prayer times and learning. Offered free of charge, without a profit motive. This is not an official religious authority app; calculated times may differ from local schedules.";
}
function init(){
 refresh();
 const langSel=$("app-language");if(langSel)langSel.addEventListener("change",()=>{setTimeout(refresh,0);});
 const checkDay=()=>{renderDua(false);renderSurah(false);renderNames(false);};
 ["timezone-mode","utc-offset"].forEach(id=>{
  const field=$(id);
  if(field)field.addEventListener("change",()=>{checkDay();renderDua(true);renderSurah(true);renderNames(true);});
 });
 // A date change is checked even while the app stays on screen at midnight.
 setInterval(checkDay,15000);
 // Android WebView timers can be paused when the phone is locked. Recheck on
 // return to foreground, and when a saved web view is shown again.
 document.addEventListener("visibilitychange",()=>{
  if(document.hidden)stopAudio();else checkDay();
 });
 window.addEventListener("pageshow",checkDay);
 window.addEventListener("focus",checkDay);
 window.NamazLearning=Object.freeze({checkDay,currentDay,dailyIndex});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
