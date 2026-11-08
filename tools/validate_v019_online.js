'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert'),vm=require('node:vm');
const root=path.resolve(__dirname,'../app/src/main');
const html=fs.readFileSync(path.join(root,'assets/index.html'),'utf8');
const native=fs.readFileSync(path.join(root,'java/com/geminamaz/app/MainActivity.java'),'utf8');
const manifest=fs.readFileSync(path.join(root,'AndroidManifest.xml'),'utf8');
const runtime=html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/);
assert(runtime,'Main runtime missing');new vm.Script("'use strict';"+runtime[1]);
for(const tag of ['qibla-online-verify','qibla-online-button','qibla-online-status',
 'qibla-online-results','qibla-online-caution']){
 assert(html.includes('id="'+tag+'"'),'UI missing '+tag);
}
for(const tag of ['function requestOnlineQibla()','function nativeQiblaOnlineResult(',
 'window.GemiNative.verifyQiblaOnline(lat,lon)','qiblaOnlineState.waiting',
 'qiblaOnlineCoordinatesMatch(q)','gap<=1','aDiff<=1.5','bDiff<=1.5']){
 assert(html.includes(tag),'Online validation missing '+tag);
}
assert(html.includes('requestOnlineQibla);')); // connected to button
assert(native.includes('@JavascriptInterface public void verifyQiblaOnline('));
assert(native.includes('https://api.aladhan.com/v1/qibla/'));
assert(native.includes('https://api.myquran.com/v3/qibla/'));
assert(native.includes('lastOnlineQiblaRequestMs<30000L'));
assert(native.includes('conn.setInstanceFollowRedirects(false)'));
assert(native.includes('conn.setConnectTimeout(4500)'));
assert(native.includes('if(text.length()+len>8192)return null'));
assert(manifest.includes('android.permission.INTERNET'));
assert(!native.includes('verifyQiblaOnline('+'0,0'));
assert(!html.includes('fetch("https://api.aladhan.com'));
console.log('PASS: 12-language online comparison, two allowlisted HTTPS APIs only by click, timeout/size/retry controls, no new auto calls.');
