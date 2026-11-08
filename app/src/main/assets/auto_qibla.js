/* v0.25 automatic, non-interactive Qibla verification.
 * Never infers physical phone heading from Sun position, COG or landmark.
 * No network calls here; network auto check requires user opt-in.
 */
(function(){
'use strict';
const rad=Math.PI/180,deg=180/Math.PI;
const mod=n=>((n%360)+360)%360;
const ANGLE_TOLERANCE=0.08;
const DAY_MS=24*60*60*1000;
const MOVE_COOLDOWN_MS=3*60*60*1000;
const MINIMUM_MOVE_METERS=50000;
const WORDS={
 tr:['Otomatik internetli kıble denetimi','İzin verirsen güncel enlem ve boylamın AlAdhan ve MyQuran servislerine gönderilir. Kontrol otomatik ve seyrek yapılır. İptal edersen yeni istek gönderilmez. Telefonun yönü internetten doğrulanamaz.','İnternetsiz denetimler her zaman otomatik. Çevrim içi denetim isteğe bağlı.'],
 en:['Automatic online Qibla check','If enabled, your current latitude and longitude will be sent to AlAdhan and MyQuran, automatically but infrequently. Turn off to stop future requests. Online data cannot validate phone orientation.','Offline checks always run automatically; online checks require consent.'],
 ms:['Semakan kiblat automatik dalam talian','Jika dibenarkan, latitud dan longitud semasa dihantar ke AlAdhan dan MyQuran. Semakan jarang dan automatik. Matikan untuk berhenti. Arah telefon tidak disahkan.','Semakan luar talian automatik; dalam talian memerlukan izin.'],
 id:['Pemeriksaan kiblat online otomatis','Jika diizinkan, lintang dan bujur terkini dikirim ke AlAdhan dan MyQuran. Pemeriksaan jarang. Matikan untuk berhenti. Arah ponsel tidak divalidasi.','Pemeriksaan offline otomatis; online perlu persetujuan.'],
 ar:['تدقيق القبلة تلقائياً عبر الإنترنت','عند التفعيل تُرسل إحداثيات موقعك إلى AlAdhan وMyQuran تلقائياً وعلى فترات متباعدة. عطّل الخيار لإيقاف الطلبات. لا يُثبت الإنترنت اتجاه الهاتف.','التدقيق دون إنترنت تلقائي دائماً؛ التدقيق عبر الشبكة يتطلب موافقة.'],
 ru:['Автоматическая проверка киблы онлайн','Если разрешить, координаты отправляются в AlAdhan и MyQuran редко и автоматически. Отключите, чтобы прекратить запросы. Интернет не определяет курс телефона.','Автономная проверка автоматическая; для сетевой нужно согласие.'],
 fr:['Vérification automatique de la qibla en ligne','Avec votre accord, latitude et longitude sont transmises à AlAdhan et MyQuran, rarement. Désactivez pour arrêter. Le réseau ne vérifie pas le cap du téléphone.','Vérification hors ligne automatique ; consentement requis en ligne.'],
 de:['Automatische Online-Qibla-Prüfung','Mit Zustimmung werden Breite/Länge selten an AlAdhan und MyQuran gesendet. Ausschalten stoppt weitere Anfragen. Die Ausrichtung des Handys wird nicht geprüft.','Offlineprüfung automatisch; online nur mit Zustimmung.'],
 es:['Comprobación automática de qibla en línea','Al habilitarla, latitud y longitud se envían ocasionalmente a AlAdhan y MyQuran. Desactívala para detenerlo. Internet no comprueba el rumbo del móvil.','Control sin conexión automático; control en línea con permiso.'],
 pt:['Verificação automática online da qibla','Se autorizares, latitude e longitude são enviadas esporadicamente a AlAdhan e MyQuran. Desativa para parar. A rede não valida a orientação do telefone.','Verificação offline automática; online apenas com consentimento.'],
 az:['Avtomatik onlayn qiblə yoxlaması','İcazə versən, cari koordinatların ara-sıra AlAdhan və MyQuran xidmətlərinə göndərilir. Söndürəndə dayanar. Telefonun istiqaməti təsdiqlənmir.','Oflayn yoxlama həmişə avtomatikdir; internet üçün icazə lazımdır.'],
 ur:['خودکار آن لائن قبلہ جانچ','اجازت دینے پر عرض و طول بلد کبھی کبھار AlAdhan اور MyQuran کو بھیجے جائیں گے۔ بند کرنے پر نئی درخواستیں رکیں گی۔ فون کی سمت ثابت نہیں ہوتی۔','آف لائن جانچ خودکار ہے، آن لائن کے لیے اجازت ضروری ہے۔']
};
const $=id=>document.getElementById(id);
function lang(){return window.NamazI18n?.getLanguage?.()||'tr';}
function copy(i){return (WORDS[lang()]||WORDS.en)[i];}
function bearingByVectors(lat,lon){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
 const a=lat*rad,b=lon*rad,c=21.422487*rad,d=39.826206*rad;
 const s=Math.sin,cosa=Math.cos;
 const p=[cosa(a)*cosa(b),cosa(a)*s(b),s(a)];
 const q=[cosa(c)*cosa(d),cosa(c)*s(d),s(c)];
 const dot=p[0]*q[0]+p[1]*q[1]+p[2]*q[2];
 const direction=q.map((x,i)=>x-dot*p[i]);
 const east=[-s(b),cosa(b),0];
 const north=[-s(a)*cosa(b),-s(a)*s(b),cosa(a)];
 const e=direction.reduce((t,x,i)=>t+x*east[i],0);
 const n=direction.reduce((t,x,i)=>t+x*north[i],0);
 if(Math.hypot(e,n)<1e-10)return null;
 return mod(Math.atan2(e,n)*deg);
}
function audit(lat,lon,main){
 const independent=bearingByVectors(lat,lon);
 if(!Number.isFinite(independent)||!Number.isFinite(main))return {available:false,passed:false,difference:null,independent};
 const difference=Math.abs(mod(independent-main+180)-180);
 return {available:true,passed:difference<=ANGLE_TOLERANCE,difference,independent};
}
function read(key,otherwise){try{return JSON.parse(localStorage.getItem(key))??otherwise;}catch(e){return otherwise;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
const key='gn_autoQiblaOnlineConsent',lastKey='gn_autoQiblaOnlineLast';
function permitted(){return read(key,false)===true;}
function distanceMeters(a,b){
 if(!a||!b||![a.lat,a.lon,b.lat,b.lon].every(Number.isFinite))return Infinity;
 const dlat=(a.lat-b.lat)*rad,dlon=(a.lon-b.lon)*rad;
 const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;
 return 12742017.6*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
function due(lat,lon,now=Date.now()){
 if(!permitted()||!Number.isFinite(lat)||!Number.isFinite(lon))return false;
 const last=read(lastKey,null);
 if(!last||!Number.isFinite(last.at)||last.at<=0||last.at>now)return true;
 const elapsed=now-last.at;
 if(elapsed<MOVE_COOLDOWN_MS)return false;
 return elapsed>=DAY_MS || distanceMeters({lat,lon},last)>=MINIMUM_MOVE_METERS;
}
function markAttempt(lat,lon,now=Date.now()){
 write(lastKey,{at:now,lat,lon});
}
function render(){
 const checkbox=$('nz-auto-qibla-online-consent');
 if(!checkbox)return;
 $('nz-auto-qibla-online-title').textContent=copy(0);
 $('nz-auto-qibla-online-disclosure').textContent=copy(1);
 $('nz-auto-qibla-local-note').textContent=copy(2);
 checkbox.checked=permitted();
}
function setConsent(value){
 write(key,value===true);
 render();
}
window.NamazAutoQibla=Object.freeze({audit,bearingByVectors,permitted,due,markAttempt,render,setConsent,
 distanceMeters,intervalMs:DAY_MS,minimumMoveMeters:MINIMUM_MOVE_METERS});
function init(){
 const checkbox=$('nz-auto-qibla-online-consent');
 if(checkbox)checkbox.addEventListener('change',()=>{setConsent(checkbox.checked);window.NamazApp?.runAutoQiblaCheck?.();});
 $('app-language')?.addEventListener('change',()=>setTimeout(render,0));
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();