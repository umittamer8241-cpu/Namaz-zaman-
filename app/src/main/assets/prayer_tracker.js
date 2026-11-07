/* v0.13 — Prayer-times-gated daily tracker + offline monthly calendar.
 * Existing localStorage progress key is kept unchanged.
 * Future prayers and future dates cannot be marked, even via a synthetic change event.
 */
(function(){
"use strict";
const IDS=["fajr","dhuhr","asr","maghrib","isha"];
const STORAGE="nz_prayer_check_v09";
const $=id=>document.getElementById(id);
const STRINGS={
tr:{track:"Namaz takibi · Vakti gelen namazı işaretle",done:"Kılınan",mark:"Kıldım",wait:"Vakti bekleniyor",unknown:"Konum ve vakit bekleniyor",calendar:"Aylık namaz çizelgesi",month:"Aylık",completed:"Kılınan",day:"Günlük detay",future:"Gelecek gün",past:"Geçmiş namaz kaydı",hint:"Vakti girmeyen namazlar işaretlenemez. Kayıtlar sadece bu cihazdadır.",today:"Bugün",back:"Önceki ay",forward:"Sonraki ay"},
en:{track:"Prayer tracker · Mark prayers after their times",done:"Completed",mark:"Prayed",wait:"Not yet due",unknown:"Waiting for verified prayer times",calendar:"Monthly prayer calendar",month:"Monthly",completed:"Completed",day:"Day details",future:"Future date",past:"Previous prayer record",hint:"Prayers cannot be marked before their times. Records stay on this device.",today:"Today",back:"Previous month",forward:"Next month"},
ms:{track:"Rekod solat · Tandakan selepas waktu masuk",done:"Selesai",mark:"Sudah solat",wait:"Belum masuk waktu",unknown:"Menunggu waktu solat",calendar:"Kalendar solat bulanan",completed:"Selesai",day:"Butiran hari",future:"Hari akan datang",hint:"Solat tidak boleh ditanda sebelum waktunya.",today:"Hari ini",back:"Bulan lalu",forward:"Bulan seterusnya"},
id:{track:"Catatan salat · Tandai setelah waktunya",done:"Selesai",mark:"Sudah salat",wait:"Belum waktunya",unknown:"Menunggu waktu salat",calendar:"Kalender salat bulanan",completed:"Selesai",day:"Rincian harian",future:"Hari mendatang",hint:"Salat tidak dapat ditandai sebelum waktunya.",today:"Hari ini",back:"Bulan lalu",forward:"Bulan berikutnya"},
ar:{track:"متابعة الصلاة · سجّل الصلاة بعد دخول وقتها",done:"المؤدّاة",mark:"صلّيت",wait:"لم يدخل الوقت",unknown:"انتظار المواقيت",calendar:"التقويم الشهري للصلاة",completed:"المؤدّاة",day:"تفاصيل اليوم",future:"يوم قادم",hint:"لا يمكن تسجيل الصلاة قبل دخول وقتها.",today:"اليوم",back:"الشهر السابق",forward:"الشهر التالي"},
ru:{track:"Учёт молитв · Отмечайте после наступления времени",done:"Выполнено",mark:"Выполнено",wait:"Ещё не время",unknown:"Ожидание времени молитв",calendar:"Календарь молитв на месяц",completed:"Выполнено",day:"Детали дня",future:"Будущая дата",hint:"Нельзя отмечать молитвы до начала их времени.",today:"Сегодня",back:"Предыдущий месяц",forward:"Следующий месяц"},
fr:{track:"Suivi des prières · Marquer après l'heure",done:"Effectuées",mark:"Effectuée",wait:"Pas encore l'heure",unknown:"En attente des horaires",calendar:"Calendrier mensuel des prières",completed:"Effectuées",day:"Détail du jour",future:"Date future",hint:"Les prières ne peuvent pas être marquées avant leur heure.",today:"Aujourd'hui",back:"Mois précédent",forward:"Mois suivant"},
de:{track:"Gebetsübersicht · Erst nach Gebetsbeginn markieren",done:"Verrichtet",mark:"Verrichtet",wait:"Noch nicht fällig",unknown:"Warte auf Gebetszeiten",calendar:"Monatlicher Gebetskalender",completed:"Verrichtet",day:"Tagesübersicht",future:"Zukünftiger Tag",hint:"Gebete können nicht vor ihrer Zeit markiert werden.",today:"Heute",back:"Voriger Monat",forward:"Nächster Monat"},
es:{track:"Registro de oraciones · Marcar después de su hora",done:"Realizadas",mark:"Realizada",wait:"Aún no es la hora",unknown:"Esperando horarios",calendar:"Calendario mensual de oraciones",completed:"Realizadas",day:"Detalle del día",future:"Día futuro",hint:"No puedes marcar oraciones antes de su hora.",today:"Hoy",back:"Mes anterior",forward:"Mes siguiente"},
pt:{track:"Registo de orações · Marcar após o horário",done:"Concluídas",mark:"Concluída",wait:"Ainda não é hora",unknown:"A aguardar horários",calendar:"Calendário mensal de orações",completed:"Concluídas",day:"Detalhes do dia",future:"Dia futuro",hint:"Não é possível marcar orações antes do horário.",today:"Hoje",back:"Mês anterior",forward:"Mês seguinte"},
az:{track:"Namaz izləmə · Vaxtı gələndən sonra işarələ",done:"Qılınan",mark:"Qıldım",wait:"Vaxtı gəlməyib",unknown:"Namaz vaxtı gözlənilir",calendar:"Aylıq namaz təqvimi",completed:"Qılınan",day:"Günün təfərrüatı",future:"Gələcək gün",hint:"Vaxtı çatmayan namazları işarələmək olmaz.",today:"Bu gün",back:"Əvvəlki ay",forward:"Sonrakı ay"},
ur:{track:"نماز کی نگرانی · وقت کے بعد نشان لگائیں",done:"ادا شدہ",mark:"ادا کی",wait:"ابھی وقت نہیں ہوا",unknown:"اوقات کا انتظار",calendar:"ماہانہ نماز کیلنڈر",completed:"ادا شدہ",day:"دن کی تفصیل",future:"آنے والا دن",hint:"نماز کا وقت آنے سے پہلے نشان نہیں لگا سکتے۔",today:"آج",back:"پچھلا مہینہ",forward:"اگلا مہینہ"}
};
const CAL_EDITOR_I18N={
tr:["Günü seçerek namazlarını düzenle","Namazları düzenle","Bu gün kıldığın namazları seç. Vakti gelmeyen namazlar kilitlidir.","Değişiklikler otomatik kaydedildi.","Düzenlemeyi kapat"],
en:["Tap a date to edit prayers","Edit prayers","Mark the prayers you completed. Future prayer times remain locked.","Changes saved automatically.","Close editor"],
ms:["Tekan tarikh untuk ubah solat","Ubah solat","Tandakan solat yang telah ditunaikan. Waktu yang belum tiba dikunci.","Perubahan disimpan secara automatik.","Tutup"],
id:["Ketuk tanggal untuk mengubah salat","Ubah salat","Tandai salat yang telah dilakukan. Waktu yang belum tiba dikunci.","Perubahan tersimpan otomatis.","Tutup"],
ar:["اضغط على يوم لتعديل الصلوات","تعديل الصلوات","حدّد الصلوات التي أديتها. الأوقات التي لم تدخل بعد مقفلة.","تُحفظ التغييرات تلقائياً.","إغلاق"],
ru:["Нажмите на день, чтобы изменить молитвы","Изменить молитвы","Отметьте совершённые молитвы. Будущие молитвы заблокированы.","Изменения сохраняются автоматически.","Закрыть"],
fr:["Touchez un jour pour modifier les prières","Modifier les prières","Cochez les prières effectuées. Les heures à venir restent verrouillées.","Enregistrement automatique.","Fermer"],
de:["Tag antippen, um Gebete zu bearbeiten","Gebete bearbeiten","Verrichtete Gebete markieren. Künftige Gebetszeiten bleiben gesperrt.","Änderungen automatisch gespeichert.","Schließen"],
es:["Toca un día para editar las oraciones","Editar oraciones","Marca las oraciones realizadas. Los horarios futuros están bloqueados.","Cambios guardados automáticamente.","Cerrar"],
pt:["Toque num dia para editar orações","Editar orações","Marque as orações feitas. Horários futuros ficam bloqueados.","Alterações guardadas automaticamente.","Fechar"],
az:["Namazları dəyişmək üçün günə toxun","Namazları dəyiş","Qıldığın namazları işarələ. Vaxtı gəlməmiş namazlar bağlıdır.","Dəyişikliklər avtomatik saxlanır.","Bağla"],
ur:["نمازیں بدلنے کے لیے تاریخ دبائیں","نمازوں میں ترمیم","ادا کی گئی نمازوں پر نشان لگائیں۔ آنے والے اوقات بند رہیں گے۔","تبدیلیاں خودکار محفوظ ہو گئیں۔","بند کریں"]
};
function lang(){return window.NamazI18n?.getLanguage?.()||"tr";}
function t(key){
 const ci=["tapDay","editDay","editInstruction","autoSave","closeEditor"].indexOf(key);
 if(ci>=0)return (CAL_EDITOR_I18N[lang()]||CAL_EDITOR_I18N.en)[ci];
 return (STRINGS[lang()]||STRINGS.en)[key]||STRINGS.en[key]||key;
}
function el(tag,text,cls){const x=document.createElement(tag);if(text!==undefined&&text!==null)x.textContent=text;if(cls)x.className=cls;return x;}
function btn(label,fn,cls){const x=el("button",label,cls||"secondary");x.type="button";x.addEventListener("click",fn);return x;}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{};}catch(_){return {};}}
let journal=load(),seenToday="",viewYear=null,viewMonth=null,selected=null,editorOpen=false;
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(journal));}catch(_){}}
function dayParts(key){const v=String(key||"").split("-").map(Number);return v.length===3?v:null;}
function dayStamp(key){const p=dayParts(key);return p?Date.UTC(p[0],p[1]-1,p[2]):NaN;}
function keyFor(y,m,d){return [y,m+1,d].join("-");}
function today(){return window.NamazApp?.activeDayKey?.()||keyFor(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());}
function dayData(key){const v=journal[key];return v&&typeof v==="object"&&!Array.isArray(v)?v:{};}
function count(key){return IDS.filter(id=>dayData(key)[id]===true).length;}
function gate(id){
 const fn=window.NamazApp?.prayerMarkGate;
 return typeof fn==="function"?fn(id):{allowed:false,reason:"unknown"};
}
function eligible(day,id){
 const now=today();
 if(!IDS.includes(id)||!Number.isFinite(dayStamp(day))||dayStamp(day)>dayStamp(now))return {allowed:false,reason:"future"};
 if(dayStamp(day)<dayStamp(now))return {allowed:true,reason:"history"};
 return gate(id);
}
function record(day,id,checked){
 if(!eligible(day,id).allowed)return false;
 if(!journal[day]||typeof journal[day]!=="object"||Array.isArray(journal[day]))journal[day]={};
 journal[day][id]=!!checked;
 save();render();return true;
}
function prayerLabel(id){
 if(window.NamazI18n?.prayer)return window.NamazI18n.prayer(id);
 const names={fajr:"Sabah",dhuhr:"Öğle",asr:"İkindi",maghrib:"Akşam",isha:"Yatsı"};
 return names[id]||id;
}
function renderTiles(){
 const schedule=$("schedule");if(!schedule)return;
 const day=today();seenToday=day;
 const label=$("nz-prayer-summary-label");
 if(label)label.textContent="✓ "+t("track");
 const countLabel=$("nz-prayer-progress");
 if(countLabel)countLabel.textContent=t("done")+": "+count(day)+"/5";
 for(const tile of schedule.querySelectorAll(".time-tile[data-prayer]")){
  const id=tile.getAttribute("data-prayer");
  let control=tile.querySelector(".nz-tile-completion");
  if(!IDS.includes(id)){if(control)control.remove();continue;}
  if(!control){
   control=el("label",null,"nz-tile-completion");
   const input=el("input");input.type="checkbox";input.dataset.markPrayer=id;
   input.addEventListener("change",()=>{if(!record(today(),id,input.checked))renderTiles();});
   control.appendChild(input);
   control.appendChild(el("span",null,"nz-tile-check-label"));
   tile.appendChild(control);
  }
  const input=control.querySelector("input"),can=eligible(day,id);
  input.disabled=!can.allowed;
  input.checked=can.allowed&&dayData(day)[id]===true;
  input.setAttribute("aria-label",prayerLabel(id)+" · "+(can.allowed?t("mark"):t("wait")));
  control.classList.toggle("done",input.checked);
  control.classList.toggle("locked",!can.allowed);
  const msg=can.reason==="future"?t("wait"):t("unknown");
  const status=can.allowed?t("mark"):msg;
  control.title=status;
  control.querySelector(".nz-tile-check-label").textContent=status;
 }
}
function monthBounds(key){const p=dayParts(key);return p?{year:p[0],month:p[1]-1}:null;}
function calendarDate(y,m,d){return new Date(Date.UTC(y,m,d));}
function readableDate(key){const d=dayParts(key);return d?new Intl.DateTimeFormat(lang(),{timeZone:"UTC",day:"numeric",month:"long",year:"numeric"}).format(calendarDate(d[0],d[1]-1,d[2])):"";}
function openSelected(day){
 if(dayStamp(day)>dayStamp(today()))return;
 selected=day;editorOpen=true;renderCalendar();
 const detail=document.querySelector(".nz-cal-detail");
 if(detail&&typeof detail.scrollIntoView==="function")detail.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function monthMove(diff){
 const next=calendarDate(viewYear,viewMonth+diff,1);
 const current=monthBounds(today());
 if(next.getUTCFullYear()>current.year||(next.getUTCFullYear()===current.year&&next.getUTCMonth()>current.month))return;
 viewYear=next.getUTCFullYear();viewMonth=next.getUTCMonth();
 selected=keyFor(viewYear,viewMonth,1);editorOpen=false;
 renderCalendar();
}
function renderCalendar(){
 const host=$("nz-month-calendar");if(!host)return;
 const cur=today(),curParts=monthBounds(cur);
 if(viewYear===null||viewMonth===null){viewYear=curParts.year;viewMonth=curParts.month;selected=cur;}
 if(viewYear>curParts.year||(viewYear===curParts.year&&viewMonth>curParts.month)){viewYear=curParts.year;viewMonth=curParts.month;selected=cur;}
 if(!selected||dayStamp(selected)>dayStamp(cur)){selected=cur;editorOpen=false;}
 host.replaceChildren();
 host.appendChild(el("h2",t("calendar"),"nz-cal-title"));
 host.appendChild(el("p",t("tapDay"),"nz-cal-tap-hint"));
 const navigation=el("div",null,"nz-cal-navigation");
 const prev=btn("‹",()=>monthMove(-1));prev.setAttribute("aria-label",t("back"));
 const title=el("strong",new Intl.DateTimeFormat(lang(),{timeZone:"UTC",month:"long",year:"numeric"}).format(calendarDate(viewYear,viewMonth,1)),"nz-cal-month-title");
 const next=btn("›",()=>monthMove(1));next.setAttribute("aria-label",t("forward"));
 next.disabled=viewYear===curParts.year&&viewMonth===curParts.month;
 navigation.appendChild(prev);navigation.appendChild(title);navigation.appendChild(next);host.appendChild(navigation);
 const weekdays=el("div",null,"nz-cal-weekdays");
 for(let i=0;i<7;i++){
  const day=calendarDate(2026,10,2+i); // Monday-first reference week
  weekdays.appendChild(el("span",new Intl.DateTimeFormat(lang(),{timeZone:"UTC",weekday:"short"}).format(day)));
 }
 host.appendChild(weekdays);
 const grid=el("div",null,"nz-cal-grid");
 const first=calendarDate(viewYear,viewMonth,1),total=calendarDate(viewYear,viewMonth+1,0).getUTCDate();
 const padding=(first.getUTCDay()+6)%7;
 for(let n=0;n<padding;n++)grid.appendChild(el("span",null,"nz-cal-empty"));
 for(let day=1;day<=total;day++){
  const key=keyFor(viewYear,viewMonth,day),future=dayStamp(key)>dayStamp(cur),number=count(key);
  const cell=btn("",()=>openSelected(key),"nz-cal-day");
  cell.dataset.dateKey=key;cell.disabled=future;
  cell.classList.toggle("is-today",key===cur);
  cell.classList.toggle("is-selected",editorOpen&&key===selected);
  cell.setAttribute("aria-pressed",editorOpen&&key===selected?"true":"false");
  cell.classList.toggle("is-complete",number===5);
  cell.classList.toggle("is-future",future);
  cell.setAttribute("aria-label",readableDate(key)+" · "+number+"/5");
  const dayNum=el("span",String(day),"nz-cal-day-number"),dots=el("span",null,"nz-cal-day-dots");
  for(let p=0;p<5;p++)dots.appendChild(el("i",null,p<number?"filled":""));
  cell.appendChild(dayNum);cell.appendChild(dots);cell.appendChild(el("span",number+"/5","nz-cal-day-count"));
  grid.appendChild(cell);
 }
 host.appendChild(grid);
 if(!editorOpen)return;
 const detail=el("div",null,"nz-cal-detail nz-cal-editor");
 detail.id="nz-cal-editor";
 detail.setAttribute("role","region");
 detail.setAttribute("aria-label",t("editDay")+" "+readableDate(selected));
 const titleRow=el("div",null,"nz-cal-editor-header");
 const labels=el("div",null,"nz-cal-editor-titles");
 labels.appendChild(el("strong",t("editDay"),"nz-cal-editor-label"));
 labels.appendChild(el("div",readableDate(selected),"nz-cal-detail-heading"));
 titleRow.appendChild(labels);
 const close=btn("×",()=>{editorOpen=false;renderCalendar();},"nz-cal-editor-close");
 close.setAttribute("aria-label",t("closeEditor"));titleRow.appendChild(close);
 detail.appendChild(titleRow);
 detail.appendChild(el("p",t("editInstruction"),"nz-cal-instruction"));
 const row=el("div",null,"nz-cal-detail-grid");
 for(const id of IDS){
   const permission=eligible(selected,id);
   const option=el("label",null,"nz-cal-detail-item");
   const input=el("input");input.type="checkbox";input.dataset.historyPrayer=id;
   input.checked=permission.allowed&&dayData(selected)[id]===true;
   input.disabled=!permission.allowed;
   input.addEventListener("change",()=>{if(!record(selected,id,input.checked))renderCalendar();});
   option.classList.toggle("locked",!permission.allowed);
   option.appendChild(input);option.appendChild(el("span",prayerLabel(id)));
   row.appendChild(option);
 }
 detail.appendChild(row);
 detail.appendChild(el("div",t("done")+": "+count(selected)+"/5","nz-cal-editor-count"));
 detail.appendChild(el("p",t("autoSave"),"nz-cal-editor-saved"));
 detail.appendChild(el("p",t("hint"),"loc-sub"));
 host.appendChild(detail);
}
function render(){renderTiles();renderCalendar();}
function start(){
 const schedule=$("schedule");if(!schedule)return;
 const observer=new MutationObserver(records=>{
  if(records.some(rec=>rec.target===schedule&&rec.type==="childList"))renderTiles();
 });
 observer.observe(schedule,{childList:true});
 const locale=$("app-language");if(locale)locale.addEventListener("change",()=>setTimeout(render,0));
 for(const id of ["timezone-mode","utc-offset","method","asr-method"]){
  const field=$(id);if(field)field.addEventListener("change",()=>setTimeout(render,0));
 }
 render();
 setInterval(()=>{
  const old=seenToday,now=today();
  if(now!==old){selected=now;editorOpen=false;const m=monthBounds(now);viewYear=m.year;viewMonth=m.month;render();}
  else {renderTiles();const current=document.querySelector('#nz-cal-detail input:disabled');if(current||selected===now)renderCalendar();}
 },12000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)render();});
}
window.NamazPrayerTracker={render,getDay:dayData,isEligible:eligible,record};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();