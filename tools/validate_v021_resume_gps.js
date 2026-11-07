'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
assert(gradle.includes('versionCode 23'));
assert(gradle.includes('0.22-premium-plus-location-center-preview'));
const pause=java.slice(java.indexOf('@Override protected void onPause(){'),java.indexOf('@Override protected void onActivityResult(',java.indexOf('@Override protected void onPause(){')));
assert(pause.indexOf('resumePendingGpsSearch=working&&!freshFix')<pause.indexOf('stopSources();'),
 'Resume flag must be saved before stopSources clears working.');
const resume=java.slice(java.indexOf('@Override protected void onResume(){'),java.indexOf('@Override protected void onPause(){'));
assert(resume.includes('if(resumePendingGpsSearch)'));
assert(resume.includes('hasFine()&&locationEnabled()&&providerAvailable(LocationManager.GPS_PROVIDER)'));
assert(resume.includes('startSatelliteOnly();'));
assert(!resume.includes('beginLocation();')&&!resume.includes('startGoogleOrNetwork();'),
 'Wake must not automatically initiate cellular/WiFi positioning.');
const acceptance=java.slice(java.indexOf('private void accept(Location location,'),java.indexOf('private void sendLocation(Location loc,'));
assert(acceptance.includes('resumePendingGpsSearch=false;'));
assert(html.includes('nz-location-diagnostic-panel'),'Diagnostics retained.');
console.log('PASS v0.21: unfinished GPS resumes after screen unlock; no network wake requests; accepted fix clears retry; no loss of diagnostic UI.');
