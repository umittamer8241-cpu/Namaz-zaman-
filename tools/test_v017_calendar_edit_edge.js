'use strict';
const fs=require('fs'),path=require('path'),url=require('url'),os=require('os'),cp=require('child_process');
const base=path.resolve(__dirname,'../app/src/main/assets'),original=path.join(base,'index.html'),temporary=path.join(base,'_v017_calendar_edit_test.html');
const injected=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 try {
  state.manual=true;setLocation(40.97,29.1,null,'manual',Date.now(),true);
  const api=window.NamazPrayerTracker,now=window.NamazApp.activeDayKey();
  const parts=now.split('-').map(Number),previous=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]-1));
  const yesterday=[previous.getUTCFullYear(),previous.getUTCMonth()+1,previous.getUTCDate()].join('-');
  const month=document.querySelector('#nz-month-calendar');
  const before=!month.querySelector('.nz-cal-editor');
  const today=document.querySelector('.nz-cal-day.is-today');today.click();
  let editor=document.getElementById('nz-cal-editor');
  const opened=!!editor&&editor.querySelectorAll('input[data-history-prayer]').length===5;
  const clock=Date.now();state.times.fajr=clock-60000;state.times.dhuhr=clock+3600000;
  api.render();
  const inputs=[...document.querySelectorAll('#nz-cal-editor input[data-history-prayer]')];
  const fajr=inputs.find(x=>x.dataset.historyPrayer==='fajr');
  const dhuhr=inputs.find(x=>x.dataset.historyPrayer==='dhuhr');
  const enabled=fajr&&!fajr.disabled&&dhuhr.disabled;
  fajr.checked=true;fajr.dispatchEvent(new Event('change',{bubbles:true}));
  const saved=api.getDay(now).fajr===true;
  const close=document.querySelector('.nz-cal-editor-close');close.click();
  const closed=!document.getElementById('nz-cal-editor');
  const prevCell=document.querySelector('.nz-cal-day[data-date-key="'+yesterday+'"]');
  let pastEdited=false;
  if(prevCell){prevCell.click();let cb=document.querySelector('#nz-cal-editor input[data-history-prayer="asr"]');cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));pastEdited=api.getDay(yesterday).asr===true;}
  const tomorrow=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]+1));
  const tomorrowKey=[tomorrow.getUTCFullYear(),tomorrow.getUTCMonth()+1,tomorrow.getUTCDate()].join('-');
  const futureDenied=api.record(tomorrowKey,'isha',true)===false;
  const output=document.createElement('output');output.id='v017-output';output.textContent='V017_CAL_'+JSON.stringify({before,opened,enabled,saved,closed,pastEdited,futureDenied,
  textPresent:document.querySelector('.nz-cal-tap-hint')?.textContent?.length>0,
  hasEditTitle:!!document.querySelector('.nz-cal-editor-label'),count:document.querySelectorAll('.nz-cal-day').length});document.body.appendChild(output);
 }catch(e){document.body.setAttribute('data-v017-error',String(e.stack||e));}
});
</script>`;
fs.writeFileSync(temporary,fs.readFileSync(original,'utf8').replace('</body>',injected+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz17cal-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const proc=cp.spawnSync(edge,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=5500','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(temporary).href],{encoding:'utf8',timeout:24000,maxBuffer:15*1024*1024,windowsHide:true});
 const out=proc.stdout||'',found=/V017_CAL_(\{.*?\})<\/output>/.exec(out);
 if(!found)throw Error('NO_RESULTS '+(out.match(/data-v017-error="([^"]+)"/)||[])[1]+' '+(proc.stderr||'').slice(-500));
 const result=JSON.parse(found[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const field of ['before','opened','enabled','saved','closed','pastEdited','futureDenied','textPresent','hasEditTitle'])if(!result[field])throw Error('FAILED '+field+' '+JSON.stringify(result));
 if(result.count<28||result.count>31)throw Error('Bad calendar '+JSON.stringify(result));
 console.log('PASS v0.17: date tap opens editor, prayer-gate respected, autosave, close works, past day editable, future locked.');
}catch(e){console.error(e.stack);process.exitCode=1;}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
