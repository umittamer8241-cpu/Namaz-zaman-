'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/learning_styles.css'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
assert(gradle.includes('versionCode 25')&&gradle.includes('0.24-actual-sensors-preview'));
for(const term of ['Sensor.TYPE_ACCELEROMETER','Sensor.TYPE_MAGNETIC_FIELD',
  'processMagneticFallback()','SensorManager.getRotationMatrix(rotationMatrix,null,gravityValues,magneticValues)',
  'remapCompassMatrix(rotationMatrix,screenMatrix)','lastPlatformGoodMs',
  'if(!trusted)return;','sendCompassHeading(heading,40d,"magnetic",false)',
  'sendCompassSensorHealth()', 'window.nativeCompassSensorStatus(',
  'd.put("magneticSamples",magneticSamples)','d.put("magneticStrength"',
  'magneticAccuracy<SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM',
  'if(reliable){']){
  assert(java.includes(term),'Missing native fallback feature '+term);
}
const fusedBlock=java.slice(java.indexOf('fusedOrientationListener=(DeviceOrientation orientation)->{'),
 java.indexOf('DeviceOrientationRequest request=',java.indexOf('fusedOrientationListener=(DeviceOrientation orientation)->{')));
assert(fusedBlock.indexOf('if(reliable){') < fusedBlock.indexOf('lastFusedOrientationMs='),
 'Only reliable fused samples may block platform fallback.');
assert(!fusedBlock.includes('sendCompassHeading(heading,error,"fused",false)'));
for(const term of ['state.headingApproximate=source===','const approximate=hasLocation&&fresh',
    'const oriented=trusted||approximate',
    'window.nativeCompassSensorStatus=nativeCompassSensorStatus',
    'İvme + manyetik yön','Manyetik kalibrasyon','KIBLE • YAKLAŞIK CANLI OK',
    "['fused','android','magnetic'].includes(source)"]){
  assert(html.includes(term),'Missing web feature '+term);
}
assert(css.includes('.needle-wrap.ornate-single-needle.compass-approximate{'));
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(x=>x.trim());
scripts.forEach(s=>new Function(s));
console.log('PASS v0.24: accel+mag fallback, FOP confidence gating, sensor health, approximate+verified display, JS syntax.');
