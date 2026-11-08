'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const stand=fs.readFileSync(path.join(assets,'location_diagnostics.js'),'utf8');
const native=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const inline=html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/);
assert(inline,'Inline runtime missing');new vm.Script("'use strict';"+inline[1],{filename:'index.html'});
new vm.Script(stand,{filename:'location_diagnostics.js'});
for(const id of ['nz-location-diagnostic-panel','nz-location-smart','nz-location-diagnostic-refresh','nz-location-diagnostic-results','nz-location-diagnostic-hint','nz-location-diagnostic-copy']){
 assert(html.includes('id="'+id+'"'),'Missing '+id);
}
assert(html.includes('location_diagnostics.js'));
assert(html.includes('requestAutoLocation();'));
assert(!html.includes('initialGpsAttempted'));
for(const name of ['@JavascriptInterface public void requestSmartLocation()','@JavascriptInterface public void retryOfflineGpsWhenPermitted()',
 '@JavascriptInterface public void getLocationDiagnostics()','@JavascriptInterface public void copyLocationReport(String report)',
 'private void sendLocationDiagnostics()','window.nativeLocationDiagnostics(']){
 assert(native.includes(name),'Missing native method '+name);
}
for(const name of ['result.put("fine"','result.put("coarse"','result.put("systemEnabled"','result.put("gpsEnabled"','result.put("networkEnabled"','result.put("googleReady"','result.put("mode"','result.put("accuracyMeters"','result.put("latestValid"']){
 assert(native.includes(name),'Missing status '+name);
}
const start=native.indexOf('private void sendLocationDiagnostics(){'),end=native.indexOf('private boolean hasFine(){',start);
assert(start>=0&&end>start);
assert(!native.slice(start,end).includes('getLatitude()')&&!native.slice(start,end).includes('getLongitude()'), 'Do not leak coordinates');
assert(stand.includes('window.nativeLocationDiagnostics=received'));
assert(stand.includes('window.GemiNative?.requestSmartLocation'));
assert(stand.includes('No latitude/longitude included.'));
assert(!stand.includes('fetch(')&&!stand.includes('XMLHttpRequest'));
console.log('PASS v0.20: native permission/provider diagnostics, coordinate-safe report, offline retry, explicit smart-search and parsed UI.');
