/* v0.20: real Android location permission/provider diagnostics.
 * No network calls, coordinates or private identifying data.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const translations={
tr:['Konum tanılama ve onarım','Telefonun neden konum vermediğini burada kontrol et. Hiçbir kontrol otomatik internet sorgusu yapmaz.','Akıllı konum bul (GPS + ağ)','Telefon konum durumunu kontrol et','Konum raporunu kopyala','Konum izni','Kesin','Yaklaşık','Kapalı','Telefon konumu','Açık','Uydu GPS','Ağ konumu','Google konum servisi','Arama modu','Son ölçüm','Kaynak','Hassasiyet','Yok','İzin/servis bilgisi bekleniyor…','İnternetsiz GPS için Kesin Konum izni gerekli. Akıllı arama yaklaşık konumla çalışabilir.','Telefonun genel Konum ayarını aç.','GPS devre dışı. Akıllı konum araması ağ üzerinden çalışabilir.','İzinler açık. Akıllı konum aramasını dene.','Konum araması sürüyor…',' saniye önce',' metre','Rapor kopyalandı. Koordinat eklenmedi.','Tarayıcı Android izinlerini okuyamaz.','Rapor kopyalanamadı; ekran görüntüsü gönder.'],
en:['Location diagnostics and recovery','Check what prevents your phone from locating. Diagnostics never use the internet automatically.','Find location (GPS + network)','Check phone location status','Copy location report','Location permission','Precise','Approximate','Off','System location','On','Satellite GPS','Network provider','Google location services','Search mode','Last fix','Source','Accuracy','None','Waiting for permission/provider status…','Precise permission is required for offline GPS. Smart search can try approximate network positioning.','Enable system Location.','GPS is unavailable. Smart search may use the network.','Permissions are available. Try Smart search.','Searching…',' seconds ago',' meters','Report copied. No coordinates included.','A browser cannot read Android location permissions.','Could not copy; share a screenshot.'],
ms:['Diagnostik lokasi','Semak kebenaran lokasi telefon. Tiada internet digunakan secara automatik.','Cari lokasi pintar','Semak status lokasi','Salin laporan','Kebenaran lokasi','Tepat','Anggaran','Mati','Lokasi telefon','Hidup','GPS satelit','Lokasi rangkaian','Perkhidmatan Google','Mod carian','Lokasi terakhir','Sumber','Ketepatan','Tiada','Menunggu status…','GPS luar talian memerlukan izin tepat.','Hidupkan lokasi telefon.','GPS tidak tersedia.','Cuba carian pintar.','Mencari…',' saat lalu',' meter','Laporan disalin.','Tidak tersedia di pelayar.','Ambil tangkapan skrin.'],
id:['Diagnostik lokasi','Periksa izin dan GPS tanpa internet otomatis.','Cari lokasi pintar','Periksa status lokasi','Salin laporan','Izin lokasi','Akurat','Perkiraan','Mati','Lokasi sistem','Aktif','GPS satelit','Lokasi jaringan','Layanan Google','Mode pencarian','Lokasi terakhir','Sumber','Akurasi','Tidak ada','Menunggu status…','GPS offline memerlukan izin akurat.','Aktifkan lokasi sistem.','GPS tidak tersedia.','Coba pencarian pintar.','Mencari…',' detik lalu',' meter','Laporan disalin.','Tidak tersedia di browser.','Ambil tangkapan layar.'],
ar:['تشخيص الموقع','تحقق من الأذونات والخدمات دون اتصال تلقائي بالإنترنت.','بحث ذكي عن الموقع','فحص حالة الموقع','نسخ التقرير','إذن الموقع','دقيق','تقريبي','مغلق','موقع النظام','مفتوح','GPS','الشبكة','خدمات Google','وضع البحث','آخر موقع','المصدر','الدقة','لا يوجد','انتظار الحالة…','GPS دون شبكة يتطلب إذن الموقع الدقيق.','فعّل موقع الهاتف.','GPS غير متاح.','جرّب البحث الذكي.','جارٍ البحث…',' ثانية',' متر','تم نسخ التقرير.','غير متاح في المتصفح.','التقط صورة للشاشة.'],
ru:['Диагностика местоположения','Проверка разрешений и GPS без автоматического интернета.','Найти местоположение','Проверить службы','Скопировать отчёт','Разрешение','Точное','Примерное','Нет','Геолокация','Да','Спутниковый GPS','Сетевое','Google','Поиск','Последняя точка','Источник','Точность','Нет','Ожидание…','Офлайн GPS требует точное разрешение.','Включите геолокацию.','GPS недоступен.','Попробуйте умный поиск.','Поиск…',' сек. назад',' м','Отчёт скопирован.','Недоступно в браузере.','Сделайте снимок.'],
fr:['Diagnostic de position','Vérifiez les autorisations sans connexion automatique.','Trouver la position','Vérifier la position','Copier le rapport','Autorisation','Précise','Approximative','Non','Position du téléphone','Oui','GPS satellite','Réseau','Google','Recherche','Dernière mesure','Source','Précision','Aucune','En attente…','Le GPS hors ligne exige la position précise.','Activez la position.','GPS indisponible.','Essayez la recherche intelligente.','Recherche…',' s avant',' m','Rapport copié.','Indisponible dans le navigateur.','Capturez l’écran.'],
de:['Standortdiagnose','Berechtigungen prüfen ohne automatische Internetanfrage.','Smart-Standort suchen','Standortstatus prüfen','Bericht kopieren','Berechtigung','Genau','Ungefähr','Aus','Standortdienste','An','Satelliten-GPS','Netzwerk','Google','Suchmodus','Letzter Fix','Quelle','Genauigkeit','Kein','Warte auf Status…','Offline-GPS benötigt genaue Standortberechtigung.','Standort einschalten.','GPS nicht verfügbar.','Smart-Suche versuchen.','Suche läuft…',' Sekunden alt',' Meter','Bericht kopiert.','Im Browser nicht verfügbar.','Screenshot senden.'],
es:['Diagnóstico de ubicación','Comprueba permisos sin usar internet automáticamente.','Buscar ubicación','Comprobar estado','Copiar informe','Permiso','Preciso','Aproximado','No','Ubicación','Sí','GPS satelital','Red','Google','Búsqueda','Última ubicación','Fuente','Precisión','Ninguna','Esperando…','GPS sin red requiere permiso preciso.','Activa la ubicación.','GPS no disponible.','Prueba búsqueda inteligente.','Buscando…',' segundos',' metros','Informe copiado.','No disponible en navegador.','Envía captura.'],
pt:['Diagnóstico de localização','Verifica permissões sem internet automática.','Encontrar localização','Verificar estado','Copiar relatório','Permissão','Precisa','Aproximada','Não','Localização','Sim','GPS satélite','Rede','Google','Pesquisa','Última posição','Fonte','Precisão','Nenhuma','A aguardar…','GPS offline exige permissão precisa.','Ativa localização.','GPS indisponível.','Experimenta pesquisa inteligente.','A pesquisar…',' segundos',' metros','Relatório copiado.','Indisponível no navegador.','Envia imagem.'],
az:['Məkan diaqnostikası','İcazələri internetsiz yoxla.','Ağıllı məkan axtar','Məkan vəziyyəti','Hesabatı köçür','Məkan icazəsi','Dəqiq','Təxmini','Bağlı','Telefon məkanı','Açıq','Peyk GPS','Şəbəkə','Google','Axtarış','Son ölçüm','Mənbə','Dəqiqlik','Yox','Gözlənilir…','Oflayn GPS dəqiq icazə tələb edir.','Məkanı aç.','GPS yoxdur.','Ağıllı axtar.','Axtarılır…',' saniyə əvvəl',' metr','Hesabat köçürüldü.','Brauzerdə mövcud deyil.','Ekran görüntüsü göndər.'],
ur:['مقام کی جانچ','اجازت اور GPS کی جانچ؛ خودکار انٹرنیٹ نہیں۔','سمارٹ مقام تلاش','حالت چیک کریں','رپورٹ نقل','اجازت','درست','تقریبی','بند','فون کا مقام','کھلا','GPS','نیٹ ورک','گوگل','تلاش','آخری مقام','ذریعہ','درستگی','نہیں','انتظار…','آف لائن GPS کے لیے درست مقام کی اجازت چاہیے۔','مقام آن کریں۔','GPS موجود نہیں۔','سمارٹ تلاش کریں۔','تلاش…',' سیکنڈ پہلے',' میٹر','رپورٹ نقل ہوگئی۔','براؤزر میں دستیاب نہیں۔','اسکرین شاٹ بھیجیں۔']
};
function lang(){return window.NamazI18n?.getLanguage?.()||'tr';}
function t(i){return (translations[lang()]||translations.en)[i]||translations.en[i];}
let snapshot=null, report='',lastUpdate=0;
function put(id,text){const node=$(id);if(node)node.textContent=text;}
function row(k,v){const p=document.createElement('div');p.className='nz-location-diag-row';
const label=document.createElement('span');label.textContent=k;const value=document.createElement('strong');value.textContent=v;
p.append(label,value);return p;}
function render(){
put('nz-location-diagnostic-title',t(0));put('nz-location-diagnostic-intro',t(1));
put('nz-location-smart',t(2));put('nz-location-diagnostic-refresh',t(3));
put('nz-location-diagnostic-copy',t(4));
const panel=$('nz-location-diagnostic-results'),hint=$('nz-location-diagnostic-hint');
if(!panel)return;
panel.replaceChildren();
if(!snapshot){hint.textContent=window.GemiNative?t(19):t(28);return;}
const p=snapshot;
const permitted=p.fine?t(6):p.coarse?t(7):t(8);
const positive=x=>x?t(10):t(8);
const lastFix=p.ageSeconds>=0?t(15)+': '+p.ageSeconds+t(25):t(18);
const list=[
[t(5),permitted],[t(9),positive(p.systemEnabled)],[t(11),positive(p.gpsEnabled)],
[t(12),positive(p.networkEnabled)],[t(13),positive(p.googleReady)],
[t(14),p.mode||'idle'],[t(15),lastFix],[t(16),p.source||t(18)],
[t(17),p.accuracyMeters>=0?p.accuracyMeters+t(26):t(18)]
];
for(const [key,value] of list)panel.appendChild(row(key,value));
const warning=!p.systemEnabled?t(21):!p.fine?t(20):!p.gpsEnabled?t(22):p.searching?t(24):t(23);
hint.textContent=warning;
report='Namaz Zamani v0.20 - Location diagnostics\n'+
 list.map(([k,v])=>k+': '+v).join('\n')+
 '\nStatus: '+warning+
 '\nNo latitude/longitude included.';
}
function received(data){
if(!data||typeof data!=='object')return;
snapshot=data;lastUpdate=Date.now();render();
}
function startSmart(){
if(window.GemiNative?.requestSmartLocation){
window.NamazApp?.prepareLocationSearch?.();
window.GemiNative.requestSmartLocation();put('nz-location-diagnostic-hint',t(24));
window.GemiNative.getLocationDiagnostics?.();
}else put('nz-location-diagnostic-hint',t(28));
}
function copyReport(){
if(!snapshot)return;
if(window.GemiNative?.copyLocationReport){
window.GemiNative.copyLocationReport(report);put('nz-location-diagnostic-copy-status',t(27));return;
}
const e=document.createElement('textarea');e.value=report;document.body.appendChild(e);e.select();
const ok=document.execCommand('copy');e.remove();
put('nz-location-diagnostic-copy-status',ok?t(27):t(29));
}
window.nativeLocationDiagnostics=received;
window.NamazLocationDiagnostic={render,getState:()=>snapshot};
function init(){
$('nz-location-smart')?.addEventListener('click',startSmart);
$('nz-location-diagnostic-refresh')?.addEventListener('click',()=>window.GemiNative?.getLocationDiagnostics?.());
$('nz-location-diagnostic-copy')?.addEventListener('click',copyReport);
$('app-language')?.addEventListener('change',()=>setTimeout(render,0));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)window.GemiNative?.getLocationDiagnostics?.();});
render();
window.GemiNative?.getLocationDiagnostics?.();
// Lightweight local permissions check only, no geolocation/network request.
setInterval(()=>{if(!document.hidden&&Date.now()-lastUpdate>12000)window.GemiNative?.getLocationDiagnostics?.();},15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();