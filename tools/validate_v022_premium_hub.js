'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const hub=fs.readFileSync(path.join(assets,'location_hub.js'),'utf8');
const css=fs.readFileSync(path.join(assets,'premium_shell.css'),'utf8');
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const inline=html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/);
assert(inline,'App runtime missing');
new vm.Script("'use strict';"+inline[1]);
new vm.Script(hub);
const hubBegin=html.indexOf('<div id="nz-location-hub"'),hubEnd=html.indexOf('id="nz-dua-learning"');
assert(hubBegin>0&&hubEnd>hubBegin,'Location sheet bounds wrong');
const slice=html.slice(hubBegin,hubEnd);
for(const id of ['location-rescue','nz-location-diagnostic-panel','location-detail','latitude',
'longitude','gps-button','location-network-button','location-precise-button','nz-location-smart',
'location-settings-button','method','asr-method','timezone-mode','utc-offset','manual-button'])
 assert(slice.includes('id="'+id+'"'),'Location control outside hub: '+id);
assert(!html.slice(0,hubBegin).includes('id="gps-button"'));
assert((html.match(/id="nz-location-hub-open"/g)||[]).length===1);
assert((html.match(/id="location-detail"/g)||[]).length===1);
assert((html.match(/id="reset-button"/g)||[]).length===0,
 'Duplicate satellite GPS button should be gone.');
assert(html.includes('id="nz-location-hub" class="nz-location-hub" hidden aria-hidden="true"'));
assert(html.includes('id="nz-calendar-drawer"')&&html.includes('id="nz-compass-tools"')&&
 html.includes('id="nz-study-drawer"'));
assert(!html.includes('id="sun-shadow-method" class="sun-shadow-method" open'));
assert(html.includes('premium_shell.css')&&html.includes('location_hub.js'));
for(const lang of ['tr','en','ms','id','ar','ru','fr','de','es','pt','az','ur']){
 assert(hub.includes(lang+':['),'Missing premium UI locale '+lang);
}
assert(hub.includes("event.key==='Escape'")&&hub.includes("event.key!=='Tab'"));
assert(hub.includes('document.body.classList.add(')&&hub.includes('document.body.classList.remove('));
assert(css.includes('.nz-location-hub-sheet')&&css.includes('max-height:calc(100dvh - 16px)'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('.nz-calendar-drawer:not([open])'));
assert(java.includes('window.NamazLocationHub.close()'),'Android back must close location sheet');
assert(java.includes('MainActivity.super.onBackPressed()'));
assert(html.includes('prayerMarkGate:function(id,stamp=Date.now())'));
assert(!html.includes('adhan_settings.js')&&!java.includes('AdhanScheduler'));
console.log('PASS v0.22: single premium location hub, all controls inside, responsive modal, calendar/compass/study compact, 12 locales, Android back, prayer gate retained.');
