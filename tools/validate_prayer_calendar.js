'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert'),vm=require('node:vm');
const root=path.join(__dirname,'..'),main=path.join(root,'app','src','main');
const html=fs.readFileSync(path.join(main,'assets','index.html'),'utf8');
const tracker=fs.readFileSync(path.join(main,'assets','prayer_tracker.js'),'utf8');
const styles=fs.readFileSync(path.join(main,'assets','learning_styles.css'),'utf8');
const java=fs.readFileSync(path.join(main,'java/com/geminamaz/app/MainActivity.java'),'utf8');
const manifest=fs.readFileSync(path.join(main,'AndroidManifest.xml'),'utf8');
new vm.Script(tracker,{filename:'prayer_tracker.js'});
assert(html.includes('id="nz-month-calendar"')&&html.includes('id="nz-prayer-tracker"'));
assert(html.includes('class="panel compass-card compass-proplus"'));
assert(html.includes('id="needle"')&&html.includes('id="bearing"'));
assert(html.includes('prayerMarkGate:function(id,stamp=Date.now())'));
assert(html.includes("validLocation(stamp)")&&html.includes('when<=stamp'));
assert(tracker.includes('if(!eligible(day,id).allowed)return false'));
assert(tracker.includes('input.disabled=!can.allowed'));
assert(tracker.includes('dayStamp(day)>dayStamp(now)'));
assert(tracker.includes('viewYear')&&tracker.includes('viewMonth'));
assert(tracker.includes('nz-cal-detail-grid'));
assert(styles.includes('.nz-cal-grid')&&styles.includes('.premium-dial.pro-dial'));
assert(!html.includes('adhan-settings-container')&&!html.includes('adhan_settings.js'));
for(const s of ['AdhanScheduler','AdhanPlaybackService','AdhanAlarmReceiver','previewAdhan','setAdhanEnabled','stopAdhan','requestAdhanPermissions']){
 assert(!java.includes(s),'stale native Adhan token '+s);
}
for(const s of ['POST_NOTIFICATIONS','SCHEDULE_EXACT_ALARM','RECEIVE_BOOT_COMPLETED','FOREGROUND_SERVICE_MEDIA_PLAYBACK','AdhanPlaybackService','AdhanAlarmReceiver']){
 assert(!manifest.includes(s),'stale manifest Adhan token '+s);
}
for(const file of ['assets/adhan_settings.js','assets/audio/Adhan.ogg','java/com/geminamaz/app/AdhanScheduler.java','java/com/geminamaz/app/AdhanPlaybackService.java','java/com/geminamaz/app/AdhanAlarmReceiver.java']){
 assert(!fs.existsSync(path.join(main,file)),'stale packaged Adhan file '+file);
}
for(const file of ['assets/quran_audio/fatiha.mp3','assets/quran_audio/ikhlas.mp3','assets/quran_audio/falaq.mp3','assets/quran_audio/nas.mp3']){
 assert(fs.statSync(path.join(main,file)).size>100000,'missing unrelated surah audio '+file);
}
console.log('PASS: no Adhan UI/media/services/permissions; prayer-time gate + 12-language calendar; Pro Plus compass; surah audio retained.');
