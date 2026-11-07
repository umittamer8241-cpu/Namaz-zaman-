/* Namaz Zamanı v0.22 - premium one-button location hub. No network calls. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const labels={
tr:['Konum Merkezi','GPS, koordinat ve gemi saati','Konum ve Vakit Merkezi','Konumunu güncelle, vakit yöntemini ve gemi saatini tek yerden ayarla.','NAMAZ ZAMANI • KONUM','Kapat','Konum bulunamadı · Ayarları aç','Güncel GPS konumu · Ayarları yönet','Kayıtlı konum · Yenilemek için aç','Elle belirlenen konum · Ayarları yönet','Son konum eski olabilir · Kontrol et','İnternetli konum sorgusu yalnızca isteğinle başlar; uydu GPS internetsiz çalışabilir.','Kıble doğrulama ve alternatif yöntemler','Gölge, gerçek kuzey, harici yön ve çevrim içi karşılaştırma','Sureler ve Esmaül Hüsna','Bilgi ve kullanım notları'],
en:['Location Center','GPS, coordinates & ship time','Location & Prayer Time Center','Set coordinates, prayer calculation and ship time in one place.','NAMAZ ZAMANI • LOCATION','Close','Location missing · Open settings','Fresh GPS fix · Manage settings','Saved location · Tap to refresh','Manual position · Manage settings','Saved position may be old · Review','Network location is used only on request; satellite GPS can work offline.','Qibla verification and alternatives','Shadow, true north, reference bearing & online comparison','Surahs & Beautiful Names','Usage notes'],
ms:['Pusat Lokasi','GPS, koordinat dan masa kapal','Pusat Lokasi & Solat','Tetapkan lokasi, kaedah kiraan dan masa kapal di satu tempat.','NAMAZ ZAMANI • LOKASI','Tutup','Tiada lokasi · Buka tetapan','GPS terkini · Urus','Lokasi disimpan · Kemas kini','Lokasi manual · Urus','Lokasi lama · Semak','Permintaan rangkaian hanya apabila dipilih.','Pengesahan kiblat dan alternatif','Bayang, utara benar dan semakan dalam talian','Surah & Asmaul Husna','Nota penggunaan'],
id:['Pusat Lokasi','GPS, koordinat dan waktu kapal','Pusat Lokasi & Salat','Atur lokasi, perhitungan dan waktu kapal di satu tempat.','NAMAZ ZAMANI • LOKASI','Tutup','Lokasi tidak ada · Buka pengaturan','GPS terbaru · Kelola','Lokasi tersimpan · Perbarui','Lokasi manual · Kelola','Lokasi mungkin lama · Periksa','Jaringan digunakan hanya jika dipilih.','Verifikasi kiblat dan alternatif','Bayangan, utara sejati, sumber daring','Surah & Asmaul Husna','Catatan penggunaan'],
ar:['مركز الموقع','GPS والإحداثيات ووقت السفينة','مركز الموقع ومواقيت الصلاة','إعداد الموقع والحساب ووقت السفينة في مكان واحد.','NAMAZ ZAMANI • الموقع','إغلاق','لا يوجد موقع · افتح الإعدادات','موقع GPS حديث · إدارة','موقع محفوظ · تحديث','موقع يدوي · إعدادات','قد يكون الموقع قديماً · تحقق','الاتصال بالشبكة عند الطلب فقط.','التحقق من القبلة والبدائل','الظل والشمال الحقيقي والتحقق عبر الإنترنت','السور وأسماء الله الحسنى','ملاحظات الاستخدام'],
ru:['Центр геолокации','GPS, координаты и время судна','Геолокация и время молитв','Управляйте местоположением и временем в одном месте.','NAMAZ ZAMANI • ГЕОЛОКАЦИЯ','Закрыть','Нет геолокации · Настройки','Актуальный GPS · Управление','Сохранённая позиция · Обновить','Ручная позиция · Управление','Позиция устарела · Проверьте','Сеть используется только по запросу.','Проверка киблы и альтернативы','Тень, истинный север и онлайн-сравнение','Суры и прекрасные имена','Примечания'],
fr:['Centre de localisation','GPS, coordonnées et heure du navire','Localisation et prières','Gérez coordonnées, calcul et heure du navire au même endroit.','NAMAZ ZAMANI • POSITION','Fermer','Position introuvable · Réglages','GPS récent · Gérer','Position enregistrée · Actualiser','Position manuelle · Gérer','Position ancienne · Vérifier','Réseau utilisé seulement sur demande.','Vérification qibla et alternatives','Ombre, nord vrai et comparaison en ligne','Sourates et Beaux Noms','Notes d’utilisation'],
de:['Standortzentrum','GPS, Koordinaten und Schiffszeit','Standort & Gebetszeiten','Standort, Berechnung und Schiffszeit an einem Ort.','NAMAZ ZAMANI • STANDORT','Schließen','Standort fehlt · Einstellungen','Aktuelles GPS · Verwalten','Gespeicherter Standort · Erneuern','Manueller Standort · Verwalten','Standort könnte alt sein · Prüfen','Netzwerkzugriff nur auf Wunsch.','Qibla-Prüfung und Alternativen','Schatten, wahrer Norden, Online-Vergleich','Suren & schöne Namen','Hinweise'],
es:['Centro de ubicación','GPS, coordenadas y hora del barco','Ubicación y oración','Gestiona ubicación, cálculos y hora del barco en un lugar.','NAMAZ ZAMANI • UBICACIÓN','Cerrar','Ubicación desconocida · Ajustes','GPS reciente · Gestionar','Ubicación guardada · Actualizar','Ubicación manual · Gestionar','Ubicación antigua · Revisar','Red solo cuando la solicitas.','Verificación de qibla y alternativas','Sombra, norte verdadero y comprobación en línea','Suras y bellos nombres','Notas de uso'],
pt:['Centro de localização','GPS, coordenadas e hora do navio','Localização e orações','Gere coordenadas, cálculo e hora do navio num só lugar.','NAMAZ ZAMANI • LOCALIZAÇÃO','Fechar','Sem localização · Definições','GPS atual · Gerir','Localização guardada · Atualizar','Localização manual · Gerir','Localização antiga · Verificar','Rede só a pedido.','Verificar a qibla e alternativas','Sombra, norte verdadeiro e comparação online','Suratas e belos nomes','Notas'],
az:['Məkan Mərkəzi','GPS, koordinat və gəmi vaxtı','Məkan və Namaz Vaxtı Mərkəzi','Məkanı, hesablamanı və gəmi saatını bir yerdən idarə et.','NAMAZ ZAMANI • MƏKAN','Bağla','Məkan yoxdur · Ayarlar','Yeni GPS · İdarə et','Saxlanan məkan · Yenilə','Əllə seçilən məkan · Ayarlar','Məkan köhnə ola bilər · Yoxla','Şəbəkə yalnız istəklə işləyir.','Qiblə yoxlanışı və alternativlər','Kölgə, həqiqi şimal və internet yoxlaması','Surələr və Esmaül Hüsna','İstifadə qeydləri'],
ur:['مقام مرکز','GPS، نقاط اور جہاز کا وقت','مقام اور نماز اوقات مرکز','مقام، حساب اور جہاز کے وقت کی ایک جگہ ترتیب۔','NAMAZ ZAMANI • مقام','بند کریں','مقام نہیں · ترتیبات','تازہ GPS · انتظام','محفوظ مقام · تازہ کریں','دستی مقام · انتظام','مقام پرانا ہو سکتا ہے · جانچیں','نیٹ ورک صرف درخواست پر استعمال ہوتا ہے۔','قبلہ تصدیق اور دیگر طریقے','سایہ، حقیقی شمال اور آن لائن موازنہ','سورتیں اور اسماء الحسنی','استعمال کی معلومات']
};
const calendarLabels={
tr:['Aylık Namaz Çizelgesi','Günleri düzenlemek için aç'],
en:['Monthly Prayer Calendar','Open to edit days'],
ms:['Kalendar Solat Bulanan','Buka untuk ubah hari'],
id:['Kalender Salat Bulanan','Buka untuk ubah tanggal'],
ar:['جدول الصلاة الشهري','افتح لتعديل الأيام'],
ru:['Календарь молитв','Откройте для изменения дней'],
fr:['Calendrier mensuel des prières','Ouvrir pour modifier les jours'],
de:['Monatlicher Gebetskalender','Zum Bearbeiten öffnen'],
es:['Calendario mensual de oración','Abrir para editar días'],
pt:['Calendário mensal de orações','Abrir para editar dias'],
az:['Aylıq Namaz Təqvimi','Günləri dəyişmək üçün aç'],
ur:['ماہانہ نماز کا کیلنڈر','دنوں کی ترمیم کے لیے کھولیں']
};
let open=false,previousFocus=null;
function t(){return labels[window.NamazI18n?.getLanguage?.()||'tr']||labels.en;}
function hub(){return $('nz-location-hub');}
function isOpen(){return open&&!hub()?.hidden;}
function refresh(){
 const w=t();
 const button=$('nz-location-hub-open');
 if(!button)return;
 $('nz-location-hub-button-label').textContent=w[0];
 $('nz-location-hub-title').textContent=w[2];
 $('nz-location-hub-intro').textContent=w[3];
 $('nz-location-hub-kicker').textContent=w[4];
 $('nz-location-hub-close').setAttribute('aria-label',w[5]);
 $('nz-location-hub-footnote').textContent=w[11];
 if($('nz-compass-tools-label'))$('nz-compass-tools-label').textContent='◈ '+w[12];
 if($('nz-compass-tools-hint'))$('nz-compass-tools-hint').textContent=w[13];
 if($('nz-study-label'))$('nz-study-label').textContent='◈ '+w[14];
 if($('nz-help-label'))$('nz-help-label').textContent=w[15];
 const calendar=$('nz-calendar-label');
 if(calendar){
   const c=calendarLabels[window.NamazI18n?.getLanguage?.()||'tr']||calendarLabels.en;
   calendar.firstChild.textContent='◈ '+c[0]+' ';
   if(calendar.querySelector('span'))calendar.querySelector('span').textContent=c[1];
 }

 const status=window.NamazApp?.locationHubStatus?.();
 let index=6;
 if(status?.available)index=status.manual?9:status.stale?10:status.source==='native'||status.source==='gps'?7:8;
 $('nz-location-hub-caption').textContent=w[index];
 button.classList.toggle('nz-location-needs-attention',!status?.available||!!status?.stale);
 button.setAttribute('aria-expanded',String(isOpen()));
}
function openHub(){
 const panel=hub();if(!panel)return;
 previousFocus=$('nz-location-hub-open');
 open=true;panel.hidden=false;
 panel.setAttribute('aria-hidden','false');
 document.body.classList.add('nz-hub-modal-open');
 refresh();
 $('nz-location-hub-close')?.focus();
 // Refresh native-only diagnostics, never initiate location/network query.
 window.GemiNative?.getLocationDiagnostics?.();
}
function closeHub(){
 const panel=hub();if(!panel||!isOpen())return;
 open=false;panel.hidden=true;panel.setAttribute('aria-hidden','true');
 document.body.classList.remove('nz-hub-modal-open');
 refresh();
 if(previousFocus?.isConnected)previousFocus.focus();
 else $('nz-location-hub-open')?.focus();
}
function handleKeys(event){
 if(!isOpen())return;
 if(event.key==='Escape'){event.preventDefault();closeHub();return;}
 if(event.key!=='Tab')return;
 const controls=[...$('nz-location-hub-sheet').querySelectorAll(
  'button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),summary,a[href]'
 )].filter(el=>el.getClientRects().length>0);
 if(!controls.length)return;
 const first=controls[0],last=controls[controls.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
function init(){
 $('nz-location-hub-open')?.addEventListener('click',openHub);
 $('nz-location-hub-close')?.addEventListener('click',closeHub);
 $('nz-location-hub-backdrop')?.addEventListener('click',closeHub);
 document.addEventListener('keydown',handleKeys);
 $('app-language')?.addEventListener('change',()=>setTimeout(refresh,0));
 // Keep closed after start/restart; do not accidentally occupy page height.
 closeHub();
 refresh();
}
window.NamazLocationHub=Object.freeze({open:openHub,close:closeHub,isOpen,refresh});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();