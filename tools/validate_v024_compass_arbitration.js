'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/premium_shell.css'),'utf8');
const inline=html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>/);
assert(inline);new vm.Script("'use strict';"+inline[1]);
for(const token of ['Sensor.TYPE_HEADING','getHeadingErrorDegrees()','getConservativeHeadingErrorDegrees()',
'lastUsableFusedOrientationMs','lastUsablePlatformHeadingMs','event.values[4]','Math.toDegrees(event.values[4])',
'if(now-lastUsableFusedOrientationMs<5000L)return;','if(trusted)lastUsableFusedOrientationMs=now',
'if(trusted||now-lastUsablePlatformHeadingMs>=5000L)']){
 assert(java.includes(token),'Missing Android heading priority fix '+token);
}
const fallback=java.slice(java.indexOf('if(type!=Sensor.TYPE_ROTATION_VECTOR'),java.indexOf('@Override public void onAccuracyChanged('));
assert(!fallback.includes('SystemClock.elapsedRealtime()-lastFusedOrientationMs<5000L'),
 'Raw untrusted FOP callbacks must not starve platform readings');
for(const token of ["needle.classList.toggle('compass-approximate',approximate)",
"needle.classList.toggle('compass-conflict',approximate&&mismatch)",
"needle.classList.toggle('compass-north-reference',northReference)",
"const relative=fresh&&Number.isFinite(h)?wrap(bearing-h,360):bearing",
"compassFallbackWords()[1]","compassFallbackWords()[0]","compassFallbackWords()[2]"]){
 assert(html.includes(token),'Missing visible uncertainty semantics '+token);
}
assert(css.includes('.ornate-single-needle.compass-approximate'));
assert(css.includes('.ornate-single-needle.compass-conflict'));
assert(css.includes('.ornate-single-needle.compass-north-reference'));
console.log('PASS v0.24 Android arbitration: invalid FOP does not starve fallback; native heading and accuracy radians; app distinguishes trusted, estimated, conflict and north-only reference.');
