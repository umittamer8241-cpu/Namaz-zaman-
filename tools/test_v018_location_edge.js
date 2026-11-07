'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const base=path.resolve(__dirname,'../app/src/main/assets');
const original=path.join(base,'index.html'),temporary=path.join(base,'_v018_location_qa.html');
const injected=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 try{
  const rescue=document.getElementById('location-rescue');
  const before=!rescue.hidden;
  const manual=document.getElementById('manual-location-details');
  let permissionCount=0,settingsCount=0,gpsRequests=0;
  window.GemiNative={
    requestPreciseLocation:()=>{permissionCount++},
    openAppLocationPermissionSettings:()=>{settingsCount++},
    requestLocation:()=>{gpsRequests++},
    setCompassLocation:()=>{}
  };
  document.getElementById('location-precise-button').click();
  document.getElementById('location-app-settings-button').click();
  document.getElementById('location-manual-shortcut').click();
  const opened=manual.open===true;
  document.getElementById('latitude').value='3.139';
  document.getElementById('longitude').value='101.686';
  document.getElementById('manual-button').click();
  const manualGood=state.manual&&state.source==='manual'&&validLocation()&&rescue.hidden;
  const schedule=document.querySelectorAll('#schedule .time-tile[data-prayer]').length===6;
  document.getElementById('gps-button').click();
  const preserved=!state.manual&&validLocation()&&rescue.hidden;
  nativeLocation(3.139,101.686,10000,false,Date.now(),'network');
  const approximate=validLocation()&&!rescue.hidden&&
     document.getElementById('location-rescue-message').textContent.includes('10');
  const result={before,opened,manualGood,schedule,preserved,approximate,
    permissionCount,settingsCount,gpsRequests,calendar:!!document.getElementById('nz-month-calendar')};
  const out=document.createElement('output');out.id='location-qa';
  out.textContent='LOCATIONQA_'+JSON.stringify(result);document.body.appendChild(out);
 }catch(error){document.body.setAttribute('data-location-error',String(error.stack||error));}
});
</script>`;
fs.writeFileSync(temporary,fs.readFileSync(original,'utf8').replace('</body>',injected+'</body>'));
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'nz18loc-'));
try{
 const exec='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const args=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=5000','--user-data-dir='+prof,'--dump-dom',url.pathToFileURL(temporary).href];
 const run=cp.spawnSync(exec,args,{encoding:'utf8',timeout:24000,maxBuffer:20*1024*1024,windowsHide:true});
 const html=run.stdout||'',match=/LOCATIONQA_(\{.*?\})<\/output>/.exec(html);
 if(!match)throw Error('Missing result: '+(html.match(/data-location-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-400));
 const v=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const key of ['before','opened','manualGood','schedule','preserved','approximate','calendar'])
    if(!v[key])throw Error('Broken '+key+' '+JSON.stringify(v));
 if(v.permissionCount!==1||v.settingsCount!==1||v.gpsRequests!==1)
    throw Error('Missing Android bridge actions '+JSON.stringify(v));
 console.log('PASS v0.18 Edge: prominent rescue, app permission and precise buttons, manual location works, GPS retry, approximate warning and calendar retained.');
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
