/* Solar shadow Qibla v0.19.
 * Based on NOAA's approximate solar position equations. All math is offline.
 * This cannot track phone rotation: the user must align the device's top edge
 * with the HORIZONTAL direction of an actual vertical object's shadow.
 */
(function(){
"use strict";
const R=Math.PI/180;
const deg=x=>x/R,rad=x=>x*R,mod=(x,n)=>((x%n)+n)%n;
function leap(y){return y%4===0&&(y%100!==0||y%400===0);}
function position(date,latitude,longitude){
 const time=date instanceof Date?date.getTime():Number(date);
 if(!Number.isFinite(time)||!Number.isFinite(latitude)||!Number.isFinite(longitude)||
    Math.abs(latitude)>90||Math.abs(longitude)>180)return null;
 const utc=new Date(time),year=utc.getUTCFullYear();
 const day=Math.floor((Date.UTC(year,utc.getUTCMonth(),utc.getUTCDate())-
   Date.UTC(year,0,1))/86400000)+1;
 const hours=utc.getUTCHours()+utc.getUTCMinutes()/60+
   utc.getUTCSeconds()/3600+utc.getUTCMilliseconds()/3600000;
 const gamma=2*Math.PI/(leap(year)?366:365)*(day-1+(hours-12)/24);
 const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)
    -.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
 const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)
    -.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)
    -.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
 const tst=mod(hours*60+eq+4*longitude,1440);
 const ha=rad(tst/4-180),lat=rad(latitude);
 const cosZenith=Math.min(1,Math.max(-1,Math.sin(lat)*Math.sin(decl)+
    Math.cos(lat)*Math.cos(decl)*Math.cos(ha)));
 const altitude=90-deg(Math.acos(cosZenith));
 const azimuth=mod(deg(Math.atan2(Math.sin(ha),
    Math.cos(ha)*Math.sin(lat)-Math.tan(decl)*Math.cos(lat)))+180,360);
 return {azimuth,altitude,shadowAzimuth:mod(azimuth+180,360),eqMinutes:eq,declination:deg(decl)};
}
function alignment(date,lat,lon,qiblaBearing){
 const pos=position(date,lat,lon);
 if(!pos||!Number.isFinite(qiblaBearing))return null;
 return {...pos,qibla:mod(qiblaBearing,360),
   relative:mod(qiblaBearing-pos.shadowAzimuth,360),
   usable:pos.altitude>=7&&pos.altitude<=78};
}
window.NamazSunQibla=Object.freeze({position,alignment});
})();
