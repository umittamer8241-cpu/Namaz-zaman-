'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert');
const root=path.resolve(__dirname,'..');
const native=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/learning_styles.css'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
assert(gradle.includes('versionCode 23'));
assert(gradle.includes('com.geminamaz.app.pusulatest')===false); // built via suffix; main is unchanged
for(const token of ['SensorManager.remapCoordinateSystem','Surface.ROTATION_90','Surface.ROTATION_180','Surface.ROTATION_270','SensorManager.AXIS_MINUS_X','SensorManager.AXIS_MINUS_Y','currentScreenRotation()']){
 assert(native.includes(token),'Missing screen-specific orientation correction '+token);
}
assert(native.includes('window.nativeCompassDiagnostic('));
assert(native.includes('copyCompassReport(String report)'));
assert(native.includes('lastFusedOrientationMs'));
assert(native.includes('getDeclination()'));
for(const token of ['window.nativeCompassDiagnostic=nativeCompassDiagnostic','id="compass-diagnostics"','id="compass-diagnostics-copy"','function compassHeadingDisagreement()','Math.abs(wrap(f.heading-a.heading+180,360)-180)>30','!mismatch','function copyCompassDiagnostics()']){
 assert(html.includes(token),'Missing diagnostic safety '+token);
}
assert(css.includes('.compass-diagnostics'));
assert(!html.includes('adhan_settings.js'));
console.log('PASS v0.16: 4-way Android screen remap, dual heading diagnostics, mismatch hides arrow, opt-in report copy, no ezan.');
