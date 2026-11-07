/* Namaz Zamani v0.9 -- offline ezan library preview and per-prayer choices.
   Playback is user-initiated only. Background alarms/notifications are NOT wired.
   All bundled recordings must be checked against docs/ADHAN_AUDIO_LICENSES.md.
*/
(function(){
'use strict';
const LOCALES={
tr:{title:'Ezan Sesleri',help:'Her vakte ayrı ezan kaydı seçin. İnternetsiz ön dinleme yapabilirsiniz.',warning:'Bu sürümde yalnızca ses seçimi ve ön dinleme çalışır. Otomatik vakit alarmı henüz etkin değil.',none:'Sessiz',preview:'Dinle',stop:'Durdur',loading:'Ses açılıyor…',playing:'Çalıyor',failed:'Ses açılamadı; dosyanın pakette olduğunu kontrol edin.',quality:'Kayıtlar CC0 lisanslı örneklerdir; dünya birincisi kaydı olarak sunulmaz.',lib:'Ses kaynağı ve lisans bilgileri',beautiful:'Ezan — 2:34',calling:'Ezan kaydı — 1:42',short:'Kısa ezan kaydı — 0:42'},
en:{title:'Adhan sounds',help:'Choose a separate recording for each prayer. Preview offline.',warning:'This version supports selection and manual preview only. Scheduled background adhan is not enabled yet.',none:'Silent',preview:'Preview',stop:'Stop',loading:'Loading audio…',playing:'Playing',failed:'Cannot play audio; verify bundled asset.',quality:'These are CC0 sample recordings, not recordings of competition winners.',lib:'Audio sources and licenses',beautiful:'Adhan — 2:34',calling:'Call to prayer — 1:42',short:'Short call — 0:42'},
ms:{title:'Suara azan',help:'Pilih rakaman bagi setiap waktu solat. Dengar tanpa internet.',warning:'Versi ini hanya menyediakan pilihan dan pratonton. Azan berjadual belum diaktifkan.',none:'Senyap',preview:'Dengar',stop:'Henti',loading:'Memuatkan audio…',playing:'Sedang dimainkan',failed:'Audio tidak dapat dimainkan.',quality:'Rakaman contoh berlesen CC0; bukan pemenang pertandingan.',lib:'Sumber dan lesen',beautiful:'Azan — 2:34',calling:'Azan — 1:42',short:'Azan pendek — 0:42'},
id:{title:'Suara azan',help:'Pilih rekaman per salat. Dengarkan tanpa internet.',warning:'Hanya pilihan dan pratinjau yang aktif; azan terjadwal belum tersedia.',none:'Diam',preview:'Dengar',stop:'Hentikan',loading:'Memuat audio…',playing:'Memutar',failed:'Audio tidak dapat diputar.',quality:'Contoh rekaman CC0, bukan rekaman juara.',lib:'Sumber dan lisensi',beautiful:'Azan — 2:34',calling:'Panggilan salat — 1:42',short:'Azan pendek — 0:42'},
ar:{title:'أصوات الأذان',help:'اختر تسجيلاً لكل صلاة واستمع دون اتصال بالإنترنت.',warning:'هذه النسخة تتيح الاختيار والاستماع التجريبي فقط. الأذان التلقائي غير مفعّل بعد.',none:'صامت',preview:'استمع',stop:'إيقاف',loading:'جارٍ تحميل الصوت…',playing:'جارٍ التشغيل',failed:'تعذر تشغيل الصوت.',quality:'تسجيلات تجريبية بترخيص CC0 وليست تسجيلات الفائزين.',lib:'مصادر الصوت والتراخيص',beautiful:'الأذان — 2:34',calling:'نداء الصلاة — 1:42',short:'أذان قصير — 0:42'},
ru:{title:'Звуки азана',help:'Выберите запись для каждого намаза. Прослушивание офлайн.',warning:'Пока доступен только выбор и прослушивание, автоматическое оповещение не включено.',none:'Без звука',preview:'Слушать',stop:'Стоп',loading:'Загрузка звука…',playing:'Воспроизведение',failed:'Не удалось воспроизвести запись.',quality:'Это записи CC0, не записи победителей конкурса.',lib:'Источники и лицензии',beautiful:'Азан — 2:34',calling:'Призыв — 1:42',short:'Короткий азан — 0:42'},
fr:{title:"Sons de l'adhan",help:'Choisissez un enregistrement par prière. Écoute hors ligne.',warning:"Seuls le choix et l'aperçu fonctionnent. Aucune alarme automatique pour le moment.",none:'Silence',preview:'Écouter',stop:'Arrêter',loading:'Chargement…',playing:'Lecture',failed:'Impossible de lire le son.',quality:'Extraits CC0, pas des enregistrements de lauréats.',lib:'Sources et licences',beautiful:'Adhan — 2:34',calling:'Appel — 1:42',short:'Appel court — 0:42'},
de:{title:'Adhan-Klänge',help:'Aufnahme für jedes Gebet wählen und offline anhören.',warning:'Zurzeit nur Auswahl und Vorschau. Automatische Gebetsalarme sind noch aus.',none:'Stumm',preview:'Anhören',stop:'Stopp',loading:'Audio wird geladen…',playing:'Wiedergabe',failed:'Audio nicht abspielbar.',quality:'CC0-Beispielaufnahmen, keine Wettbewerbssieger.',lib:'Quellen und Lizenzen',beautiful:'Adhan — 2:34',calling:'Gebetsruf — 1:42',short:'Kurzer Ruf — 0:42'},
es:{title:'Sonidos del adhan',help:'Elige un audio por oración. Escucha sin internet.',warning:'Solo selección y escucha previa. Alarmas automáticas aún no disponibles.',none:'Silencio',preview:'Escuchar',stop:'Detener',loading:'Cargando audio…',playing:'Reproduciendo',failed:'No se puede reproducir el audio.',quality:'Grabaciones CC0 de muestra, no de ganadores.',lib:'Fuentes y licencias',beautiful:'Adhan — 2:34',calling:'Llamada — 1:42',short:'Llamada breve — 0:42'},
pt:{title:'Sons do adhan',help:'Selecione um áudio por oração. Ouça sem internet.',warning:'Apenas seleção e prévia estão disponíveis; alarmes automáticos ainda não.',none:'Silêncio',preview:'Ouvir',stop:'Parar',loading:'Carregando…',playing:'Reproduzindo',failed:'Não foi possível reproduzir.',quality:'Amostras CC0, não gravações de vencedores.',lib:'Fontes e licenças',beautiful:'Adhan — 2:34',calling:'Chamado — 1:42',short:'Chamado curto — 0:42'},
az:{title:'Azan səsləri',help:'Hər namaz üçün səs seçin. İnternetsiz dinləyin.',warning:'Yalnız seçim və dinləmə mövcuddur; avtomatik azan hələ aktiv deyil.',none:'Səssiz',preview:'Dinlə',stop:'Dayandır',loading:'Səs yüklənir…',playing:'Oxunur',failed:'Səs oxudula bilmədi.',quality:'CC0 nümunə səsləridir; yarışma qalibləri deyil.',lib:'Mənbələr və lisenziyalar',beautiful:'Azan — 2:34',calling:'Namaza çağırış — 1:42',short:'Qısa azan — 0:42'},
ur:{title:'اذان کی آوازیں',help:'ہر نماز کے لیے الگ آواز منتخب کریں اور آف لائن سنیں۔',warning:'فی الحال صرف انتخاب اور سننا دستیاب ہے، خودکار اذان ابھی فعال نہیں۔',none:'خاموش',preview:'سنیں',stop:'بند کریں',loading:'آڈیو لوڈ ہو رہا ہے…',playing:'چل رہا ہے',failed:'آڈیو نہیں چل سکا۔',quality:'CC0 نمونے ہیں، مقابلوں کے فاتحین کی ریکارڈنگ نہیں۔',lib:'ذرائع اور لائسنس',beautiful:'اذان — 2:34',calling:'نماز کی اذان — 1:42',short:'مختصر اذان — 0:42'}};
const RECORDINGS=[
{id:'beautiful',path:'audio/Beautiful_adhan.ogg'},
{id:'calling',path:'audio/Muslim_calling_to_prayer.ogg'},
{id:'short',path:'audio/Adhan.ogg'}];
const PRAYERS=['fajr','dhuhr','asr','maghrib','isha'];
const ALLOWED=new Set(['none',...RECORDINGS.map(r=>r.id)]);
const AUTO_LOCALES={
tr:{toggle:'Vakit girince otomatik ezan oku',permission:'Android izinlerini aç',on:'Otomatik ezan açık',off:'Otomatik ezan kapalı',exact:'Tam saatinde çalması için Alarmlar ve hatırlatıcılar iznini açın.',notice:'Bildirim izni kapalı; çalma bildirimi görünmeyebilir.',location:'Konum doğrulanınca ezan saatleri hazırlanır.',hint:'Otomatik ezan Android uygulamasında çalışır. Konum ve saat dilimini güncel tutun.'},
en:{toggle:'Play Adhan automatically at prayer time',permission:'Enable Android permissions',on:'Automatic Adhan on',off:'Automatic Adhan off',exact:'Allow Alarms & reminders for timely playback.',notice:'Notification permission disabled; playback notification may be hidden.',location:'Prayer schedule starts after location verification.',hint:'Automatic playback works in the Android app. Keep your location and time zone updated.'},
ms:{toggle:'Mainkan azan secara automatik',permission:'Benarkan kebenaran Android',on:'Azan automatik aktif',off:'Azan automatik mati',exact:'Benarkan Penggera dan peringatan.',notice:'Kebenaran pemberitahuan tiada.',location:'Waktu disediakan setelah lokasi disahkan.',hint:'Azan automatik berfungsi pada Android. Pastikan lokasi dan zon waktu tepat.'},
id:{toggle:'Putar azan otomatis saat waktu salat',permission:'Izinkan akses Android',on:'Azan otomatis aktif',off:'Azan otomatis mati',exact:'Izinkan Alarm & pengingat.',notice:'Izin notifikasi belum diberikan.',location:'Jadwal disiapkan setelah lokasi terverifikasi.',hint:'Pemutaran otomatis tersedia di Android. Periksa lokasi dan zona waktu.'},
ar:{toggle:'تشغيل الأذان تلقائياً عند دخول الوقت',permission:'تفعيل أذونات أندرويد',on:'الأذان التلقائي مفعّل',off:'الأذان التلقائي متوقف',exact:'اسمح بالمنبهات والتذكيرات للتشغيل في الموعد.',notice:'إذن الإشعارات غير متاح.',location:'تُعد المواقيت بعد التحقق من الموقع.',hint:'يعمل الأذان التلقائي في تطبيق أندرويد. تحقّق من الموقع والمنطقة الزمنية.'},
ru:{toggle:'Автоматически включать азан',permission:'Разрешить уведомления и будильники',on:'Автоазан включён',off:'Автоазан выключен',exact:'Разрешите точные будильники.',notice:'Уведомления отключены.',location:'Расписание появится после проверки места.',hint:'Автоматический азан работает в приложении Android. Проверяйте местоположение и часовой пояс.'},
fr:{toggle:"Jouer l'adhan automatiquement",permission:'Autoriser les alarmes Android',on:'Adhan automatique activé',off:'Adhan automatique désactivé',exact:'Autorisez les alarmes exactes.',notice:'Notifications désactivées.',location:'Planning disponible après vérification de position.',hint:"Lecture automatique dans l'application Android. Vérifiez position et fuseau horaire."},
de:{toggle:'Adhan automatisch zur Gebetszeit spielen',permission:'Android-Berechtigungen',on:'Automatischer Adhan an',off:'Automatischer Adhan aus',exact:'Genaue Alarme erlauben.',notice:'Mitteilungen deaktiviert.',location:'Zeitplan nach Standortprüfung.',hint:'Automatisch in der Android-App. Standort und Zeitzone prüfen.'},
es:{toggle:'Reproducir adhan automáticamente',permission:'Permitir alarmas Android',on:'Adhan automático activo',off:'Adhan automático desactivado',exact:'Permite las alarmas exactas.',notice:'Notificaciones desactivadas.',location:'Horario tras comprobar la ubicación.',hint:'Reproducción automática en Android. Comprueba ubicación y zona horaria.'},
pt:{toggle:'Reproduzir adhan automaticamente',permission:'Permitir alarmes Android',on:'Adhan automático ativo',off:'Adhan automático desligado',exact:'Permita alarmes exatos.',notice:'Notificações desativadas.',location:'Agenda após validar a localização.',hint:'Reprodução automática no Android. Verifique localização e fuso horário.'},
az:{toggle:'Vaxt girəndə azanı avtomatik oxut',permission:'Android icazələrini aç',on:'Avtomatik azan açıqdır',off:'Avtomatik azan bağlıdır',exact:'Dəqiq zəngli saata icazə verin.',notice:'Bildiriş icazəsi bağlıdır.',location:'Məkan təsdiqlənəndən sonra vaxtlar hazırlanır.',hint:'Avtomatik azan Android tətbiqində işləyir. Məkanı və saat qurşağını yoxlayın.'},
ur:{toggle:'نماز کے وقت خودکار اذان چلائیں',permission:'اینڈرائیڈ اجازتیں دیں',on:'خودکار اذان فعال',off:'خودکار اذان بند',exact:'درست الارم کی اجازت دیں۔',notice:'اطلاع کی اجازت بند ہے۔',location:'مقام کی تصدیق کے بعد اوقات بنیں گے۔',hint:'اینڈرائیڈ ایپ میں خودکار اذان دستیاب ہے۔ مقام اور وقت درست رکھیں۔'}
};
function a(k){const lang=window.NamazI18n&&window.NamazI18n.getLanguage?window.NamazI18n.getLanguage():'tr';return (AUTO_LOCALES[lang]||AUTO_LOCALES.en)[k]||AUTO_LOCALES.en[k];}
function automaticEnabled(){try{return localStorage.getItem('gn_adhan_auto')!=='false';}catch(e){return true;}}
function saveAutomatic(value){try{localStorage.setItem('gn_adhan_auto',String(value));}catch(e){}}
let lastSent='',audio=null,playingId=null,nativePlaying=false;
function t(k){const lang=window.NamazI18n&&window.NamazI18n.getLanguage?window.NamazI18n.getLanguage():'tr';return (LOCALES[lang]||LOCALES.en)[k]||LOCALES.en[k]||k;}
function selected(prayer){
 try{const value=localStorage.getItem('gn_adhan_'+prayer);return ALLOWED.has(value)?value:'beautiful';}catch(e){return 'beautiful';}
}
function save(prayer,value){if(!ALLOWED.has(value))return;try{localStorage.setItem('gn_adhan_'+prayer,value);}catch(e){}}
function stopAudio(){
 if(nativePlaying&&window.GemiNative&&window.GemiNative.stopAdhan)window.GemiNative.stopAdhan();
 nativePlaying=false;
 if(audio){const old=audio;audio=null;old.onplaying=null;old.onerror=null;old.onended=null;old.pause();old.removeAttribute('src');old.load();}
 playingId=null;paintStatus('');
}
function paintStatus(message){
 const label=document.getElementById('adhan-playback-status');if(label)label.textContent=message;
 const btn=document.getElementById('adhan-preview-btn');if(btn)btn.textContent=playingId?t('stop'):t('preview');
}
function preview(){
 const prayer=document.getElementById('adhan-prayer-select').value, id=selected(prayer);
 if(playingId){stopAudio();return;}
 const r=RECORDINGS.find(x=>x.id===id);if(!r)return;
 if(window.GemiNative&&typeof window.GemiNative.previewAdhan==='function'){
   window.GemiNative.previewAdhan(prayer,id);
   playingId=id;nativePlaying=true;paintStatus(t('playing'));return;
 }
 audio=new Audio(r.path);audio.preload='none';playingId=id;paintStatus(t('loading'));
 audio.onplaying=()=>paintStatus(t('playing'));
 audio.onerror=()=>{stopAudio();paintStatus(t('failed'));};
 audio.onended=()=>stopAudio();
 const p=audio.play();if(p&&typeof p.catch==='function')p.catch(()=>{stopAudio();paintStatus(t('failed'));});
}
function scheduleNative(){
 const bridge=window.GemiNative;
 if(!bridge||typeof bridge.setAdhanSchedule!=='function'||!automaticEnabled())return;
 if(!validLocation()||!Number.isFinite(state.lat)||!Number.isFinite(state.lon))return;
 const now=new Date(),day=displayDateParts(now),events=[];
 for(let i=0;i<31;i++){
   const date=new Date(Date.UTC(day.y,day.m,day.day+i));
   const times=prayerTimes({y:date.getUTCFullYear(),m:date.getUTCMonth(),day:date.getUTCDate()},state.lat,state.lon,state.method,state.asr);
   for(const prayer of PRAYERS){
     const recording=selected(prayer),at=times[prayer];
     if(recording==='none'||at===null||!Number.isFinite(at)||at<=Date.now()+1000)continue;
     events.push({id:prayer,at,recording});
   }
 }
 events.sort((x,y)=>x.at-y.at);
 const payload=JSON.stringify(events);
 if(payload!==lastSent){lastSent=payload;bridge.setAdhanSchedule(payload);}
}
function statusAuto(){
 const status=document.getElementById('adhan-auto-status');
 if(!status)return;
 const on=automaticEnabled(),bridge=window.GemiNative;
 if(!on){status.textContent=a('off');return;}
 if(!bridge){status.textContent=a('hint');return;}
 if(!validLocation()){status.textContent=a('location');return;}
 try{
   const permissions=JSON.parse(bridge.adhanPermissionState());
   if(!permissions.exact){status.textContent=a('exact');return;}
   if(!permissions.notifications){status.textContent=a('notice');return;}
 }catch(e){}
 status.textContent=a('on');
}
function refreshAuto(){scheduleNative();statusAuto();}
function render(){
 const host=document.getElementById('adhan-settings-container');if(!host)return;
 if(audio)stopAudio();
 host.innerHTML='';
 const title=document.createElement('div');title.className='small-label';title.textContent='♫ '+t('title');host.appendChild(title);
 const autoRow=document.createElement('label');autoRow.style.cssText='display:flex;gap:12px;align-items:center;margin:13px 0;color:var(--mint);font-size:13px;font-weight:700';
 const toggle=document.createElement('input');toggle.type='checkbox';toggle.id='adhan-auto-toggle';toggle.checked=automaticEnabled();
 toggle.style.cssText='width:22px;height:22px;flex:none;padding:0;accent-color:#79e7cb';
 const toggleLabel=document.createElement('span');toggleLabel.textContent=a('toggle');
 autoRow.appendChild(toggle);autoRow.appendChild(toggleLabel);host.appendChild(autoRow);
 toggle.addEventListener('change',()=>{
   saveAutomatic(toggle.checked);lastSent='';
   if(window.GemiNative){
     window.GemiNative.setAdhanEnabled(toggle.checked);
     if(toggle.checked)window.GemiNative.requestAdhanPermissions();
   }
   refreshAuto();
 });
 const permission=document.createElement('button');permission.type='button';permission.className='secondary';permission.textContent=a('permission');
 permission.addEventListener('click',()=>{if(window.GemiNative)window.GemiNative.requestAdhanPermissions();});
 host.appendChild(permission);
 const autoStatus=document.createElement('p');autoStatus.id='adhan-auto-status';autoStatus.className='loc-sub';
 autoStatus.style.marginTop='8px';autoStatus.setAttribute('role','status');host.appendChild(autoStatus);
 const help=document.createElement('p');help.className='loc-sub';help.textContent=t('help');host.appendChild(help);
 const grid=document.createElement('div');grid.className='settings';host.appendChild(grid);
 for(const prayer of PRAYERS){
   const label=document.createElement('label');label.textContent=(window.NamazI18n&&window.NamazI18n.prayer?window.NamazI18n.prayer(prayer):prayer);
   const sel=document.createElement('select');sel.id='adhan-select-'+prayer;sel.dataset.prayer=prayer;
   for(const id of ['none',...RECORDINGS.map(r=>r.id)]){const opt=document.createElement('option');opt.value=id;opt.textContent=t(id);sel.appendChild(opt);}
   sel.value=selected(prayer);sel.addEventListener('change',()=>{save(prayer,sel.value);if(audio)stopAudio();lastSent='';refreshAuto();});label.appendChild(sel);grid.appendChild(label);
 }
 const ctr=document.createElement('div');ctr.className='controls';host.appendChild(ctr);
 const prayerSelect=document.createElement('select');prayerSelect.id='adhan-prayer-select';prayerSelect.setAttribute('aria-label',t('title'));
 for(const prayer of PRAYERS){const opt=document.createElement('option');opt.value=prayer;opt.textContent=window.NamazI18n&&window.NamazI18n.prayer?window.NamazI18n.prayer(prayer):prayer;prayerSelect.appendChild(opt);}
 prayerSelect.addEventListener('change',()=>{if(audio)stopAudio();});ctr.appendChild(prayerSelect);
 const btn=document.createElement('button');btn.type='button';btn.id='adhan-preview-btn';btn.textContent=t('preview');btn.addEventListener('click',preview);ctr.appendChild(btn);
 const status=document.createElement('div');status.id='adhan-playback-status';status.className='loc-sub';status.setAttribute('role','status');host.appendChild(status);
 const warning=document.createElement('p');warning.className='loc-sub';warning.textContent=a('hint');host.appendChild(warning);
 const quality=document.createElement('p');quality.className='loc-sub';quality.textContent=t('quality');host.appendChild(quality);
 const link=document.createElement('a');link.href='https://github.com/umittamer8241-cpu/Namaz-zaman-/blob/v0.9-adhan-library/docs/ADHAN_AUDIO_LICENSES.md';link.textContent=t('lib');link.style.color='#bcd8d7';host.appendChild(link);
 const enabled=()=>{const r=selected(prayerSelect.value);btn.disabled=r==='none';};prayerSelect.addEventListener('change',enabled);
 grid.addEventListener('change',enabled);enabled();
 refreshAuto();
}
function init(){
 if(window.GemiNative)window.GemiNative.setAdhanEnabled(automaticEnabled());
 render();
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audio)stopAudio();});
 document.addEventListener('change',e=>{if(['method','asr-method','timezone-mode','utc-offset'].includes(e.target.id)){lastSent='';setTimeout(refreshAuto,0);}});
 setInterval(refreshAuto,15000);
}
window.NamazAdhan={init,refreshLocale:render,selected,refreshSchedule:refreshAuto};
})();