/* v0.19 Offline Qibla sightline/reference geometry.
 * User must PHYSICALLY align the top edge of the phone with a verified
 * true-north bearing/reference. No magnetometer, GPS COG or IP is a heading.
 */
(function(){
"use strict";
const rad=v=>v*Math.PI/180,deg=v=>v*180/Math.PI,wrap=n=>((n%360)+360)%360;
function normalizeTrueBearing(v){
 if(typeof v==="string"&&!v.trim())return null;
 const n=Number(v);
 return Number.isFinite(n)&&n>=0&&n<360?n:null;
}
function referenceAngle(qibla,bearing){
 const b=normalizeTrueBearing(bearing);
 return Number.isFinite(qibla)&&b!==null?wrap(qibla-b):null;
}
function landmark(userLat,userLon,targetLat,targetLon){
 const a=[userLat,userLon,targetLat,targetLon].map(Number);
 if(a.some(x=>!Number.isFinite(x))||Math.abs(a[0])>90||Math.abs(a[1])>180||
 Math.abs(a[2])>90||Math.abs(a[3])>180)return null;
 const [lat1,lon1,lat2,lon2]=a,phi1=rad(lat1),phi2=rad(lat2),dl=rad(lon2-lon1),dphi=phi2-phi1;
 const h=Math.sin(dphi/2)**2+Math.cos(phi1)*Math.cos(phi2)*Math.sin(dl/2)**2;
 const distance=2*6371008.8*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
 if(distance<50)return null; // unstable bearing for coincident/inaccurate fixes
 const heading=wrap(deg(Math.atan2(Math.sin(dl)*Math.cos(phi2),
 Math.cos(phi1)*Math.sin(phi2)-Math.sin(phi1)*Math.cos(phi2)*Math.cos(dl))));
 return {heading,distance};
}
window.NamazManualQibla=Object.freeze({normalizeTrueBearing,referenceAngle,landmark});
})();
