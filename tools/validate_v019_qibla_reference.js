'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert'),vm=require('node:vm');
const root=path.resolve(__dirname,'../app/src/main/assets');
const raw=fs.readFileSync(path.join(root,'manual_qibla.js'),'utf8');
const ctx={window:{}};vm.runInNewContext(raw,ctx);
const m=ctx.window.NamazManualQibla;
const near=(a,b,t)=>Math.abs(a-b)<t;
assert(m.normalizeTrueBearing('0')===0);
assert(m.normalizeTrueBearing('359.9')===359.9);
assert(m.normalizeTrueBearing('')===null);
assert(m.normalizeTrueBearing('360')===null);
assert(m.normalizeTrueBearing('-1')===null);
assert(near(m.referenceAngle(272.2,0),272.2,1e-6));
assert(near(m.referenceAngle(272.2,270),2.2,.0001));
assert(near(m.referenceAngle(15,350),25,.0001));
assert(near(m.landmark(0,0,0,1).heading,90,.0001));
assert(near(m.landmark(0,0,0,-1).heading,270,.0001));
assert(m.landmark(40.970,29.10,40.970,29.10)===null);
assert(m.landmark(400,0,0,1)===null);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('manual_qibla.js'));
for(const id of ['manual-reference-methods','manual-north-align','manual-heading-input',
 'manual-heading-align','manual-landmark-lat','manual-landmark-lon',
 'manual-landmark-align','manual-reference-confirm','manual-reference-reset']){
 assert(html.includes('id="'+id+'"'),'Missing '+id);
}
assert(html.includes('function manualReferenceActive()'));
assert(html.includes('function alignManualReference(method)'));
assert(html.includes('window.NamazManualQibla.landmark('));
assert(html.includes('manualConfirm()'));
console.log('PASS: true north, verified heading, landmark bearings and user-confirmation checks.');
