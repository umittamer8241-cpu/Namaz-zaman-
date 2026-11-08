'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/learning_styles.css'),'utf8');
for(const name of ['FusedOrientationProviderClient','DeviceOrientationListener','DeviceOrientationRequest','requestOrientationUpdates','getHeadingErrorDegrees','getConservativeHeadingErrorDegrees','getHeadingDegrees','lastFusedOrientationMs','stopOrientationTracking','setCompassLocation']){
 assert(java.includes(name),'Missing orientation or coordinate feature '+name);
}
assert(java.includes('window.nativeHeadingData('));
assert(java.includes('Double.isFinite(error)&&error<=25d'));
assert(java.includes('getDeclination()')&&java.includes('Only fallback')===false);
assert(html.includes('function nativeHeadingData(')&&html.includes('headingTrusted'));
assert(html.includes('if(window.GemiNative)return;'),'Android must not accept browser orientation');
assert(html.includes("needle.classList.toggle('compass-approximate',approximate)"));
assert(html.includes('const relative=fresh&&Number.isFinite(h)?wrap(bearing-h,360):bearing;'),'Fallback arrow must distinguish estimated vs north reference');
assert(html.includes('compass-calibration-guide')&&html.includes('compass-quality'));
assert(css.includes('needle-wrap.compass-unreliable{opacity:0!important'));
assert((html.match(/id="needle"/g)||[]).length===1);
console.log('PASS v0.24: Google FOP + platform fallback sensor, uncertainty clearly distinguished and single gold arrow preserved.');
