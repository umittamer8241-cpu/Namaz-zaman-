'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const htmlPath=path.join(assets,'index.html'),temp=path.join(assets,'_v013_test.html');
const script=`<script>
document.addEventListener('DOMContentLoaded',async()=>{
 try{
  state.manual=true;
  setLocation(3.139,101.686,null,'manual',Date.now(),true);
  await new Promise(resolve=>setTimeout(resolve,100));
  const api=window.NamazPrayerTracker,day=window.NamazApp.activeDayKey();
  const inputs=()=>[...document.querySelectorAll('#schedule input[data-mark-prayer]')];
  const first=inputs().find(n=>n.dataset.markPrayer==='fajr');
  state.times.fajr=Date.now()+1800000;
  api.render();
  const locked=first.disabled===true && api.isEligible(day,'fajr').allowed===false;
  const badMark=api.record(day,'fajr',true);
  const blocked=badMark===false && !api.getDay(day).fajr;
  state.times.fajr=Date.now()-60000;
  api.render();
  const unlocked=first.disabled===false && api.isEligible(day,'fajr').allowed===true;
  const accepted=api.record(day,'fajr',true);
  const saved=api.getDay(day).fajr===true;
  const dates=[...document.querySelectorAll('.nz-cal-day')];
  const future=dates.filter(x=>x.classList.contains('is-future'));
  const futureDisabled=future.every(x=>x.disabled===true);
  const currentMonthNext=document.querySelector('.nz-cal-navigation button:last-child');
  const [y,m,dt]=day.split('-').map(Number);
  const past=new Date(Date.UTC(y,m-1,dt-1));
  const pastKey=[past.getUTCFullYear(),past.getUTCMonth()+1,past.getUTCDate()].join('-');
  const futureKey=[y,m,dt+1].join('-');
  const forbiddenFuture=api.record(futureKey,'dhuhr',true)===false;
  const pastCell=document.querySelector('[data-date-key="'+pastKey+'"]');
  if(pastCell)pastCell.click();
  const historyControls=[...document.querySelectorAll('.nz-cal-detail-item input')];
  const hasPastDetail=historyControls.length===5&&historyControls.every(x=>!x.disabled);
  const pastMark=api.record(pastKey,'asr',true),pastRecord=api.getDay(pastKey).asr===true;
  const hasPrayerHeader=document.querySelector('.nz-prayer-today-head')!==null;
  const hasCalendar=document.getElementById('nz-month-calendar')!==null;
  const hasProPlus=document.querySelector('.compass-proplus #needle')!==null;
  const hasEzan=!!document.getElementById('adhan-settings-container');
  const output=document.createElement('output');output.id='v013-check';output.textContent='V013_RESULTS_'+JSON.stringify({
   count:inputs().length,locked,blocked,unlocked,accepted,saved,futureDisabled,
   forbiddenFuture,hasPastDetail,pastMark,pastRecord,hasPrayerHeader,hasCalendar,hasProPlus,hasEzan,
   calendarDays:dates.length,dayStatus:document.getElementById('nz-prayer-progress')?.textContent,
   nextDisabled:currentMonthNext.disabled
  });
  document.body.appendChild(output);
 }catch(e){document.body.setAttribute('data-v013-error',String(e.stack||e));}
});
</script>`;
fs.writeFileSync(temp,fs.readFileSync(htmlPath,'utf8').replace('</body>',script+'</body>'),'utf8');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'namaz-v013-'));
try{
 const run=cp.spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=9000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(temp).href],{encoding:'utf8',timeout:23000,maxBuffer:20*1024*1024,windowsHide:true});
 const dom=run.stdout||'',match=/V013_RESULTS_(\{.*?\})<\/output>/.exec(dom);
 if(!match)throw Error('No Edge result: '+(dom.match(/data-v013-error="([^"]+)"/)||[])[1]+'; '+(run.stderr||'').slice(-600));
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const flag of ['locked','blocked','unlocked','accepted','saved','futureDisabled','forbiddenFuture','hasPastDetail','pastMark','pastRecord','hasPrayerHeader','hasCalendar','hasProPlus','nextDisabled']){
  if(!data[flag])throw Error('FAIL '+flag+': '+JSON.stringify(data));
 }
 if(data.count!==5||data.hasEzan||data.calendarDays<28)throw Error('Bad UI '+JSON.stringify(data));
 console.log('PASS: Real Edge 5 prayer checkboxes: locked before time, allowed after time; monthly calendar past editing/future disabled; Pro Plus compass; no Adhan.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
