'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const base=path.resolve(__dirname,'../app/src/main/assets');
const origin=path.join(base,'index.html'),temp=path.join(base,'_v019_restore_test.html');
const js=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 try{
 const isRestore=location.search.includes('restore');
 if(!isRestore){
   store('initialGpsAttempted',true);
   state.manual=false;
   setLocation(3.139,101.686,90,'native',Date.now()-15*60000,false,'gps');
 } else {
   const data={
    loaded:validLocation(),stale:locationIsStale(),
    lat:state.lat,lon:state.lon,
    source:state.source,
    calculation:!!state.times&&Number.isFinite(state.times.dhuhr),
    dayCount:document.querySelectorAll('#schedule .time-tile').length,
    savedCoordinates:!!saved('location',null),
    rescueVisible:!document.getElementById('location-rescue').hidden,
    onDemandNetwork:document.getElementById('qibla-online-button').disabled===true
   };
   const out=document.createElement('output');
   out.id='restore-check';out.textContent='RESTORED_DATA_'+JSON.stringify(data);
   document.body.appendChild(out);
 }
 }catch(e){document.body.setAttribute('data-restore-error',String(e.stack||e));}
});
</script>`;
fs.writeFileSync(temp,fs.readFileSync(origin,'utf8').replace('</body>',js+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz19reboot-'));
function open(p){
 const result=cp.spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
 ['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files',
 '--user-data-dir='+profile,'--virtual-time-budget=2900','--dump-dom',
 url.pathToFileURL(temp).href+'?'+p],{encoding:'utf8',timeout:26000,maxBuffer:22*1024*1024,windowsHide:true});
 return result.stdout||'';
}
try{
 const seed=open('seed');
 if(seed.includes('data-restore-error='))throw Error('Seed failed '+seed.match(/data-restore-error="([^"]+)"/)?.[1]);
 const html=open('restore'),match=/RESTORED_DATA_(\{.*?\})<\/output>/.exec(html);
 if(!match)throw Error('Restore output missing '+html.match(/data-restore-error="([^"]+)"/)?.[1]);
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const k of ['loaded','stale','calculation','savedCoordinates','rescueVisible','onDemandNetwork']){
   if(!data[k])throw Error(k+' failed '+JSON.stringify(data));
 }
 if(data.lat!==3.139||data.lon!==101.686||data.source!=='previous'||data.dayCount!==6)
    throw Error('Restored content incorrect '+JSON.stringify(data));
 console.log('PASS: New WebView session restores 15-minute old GPS coordinates and prayer times offline, warns stale, does not require online revalidation.');
}catch(e){console.error(e.stack);process.exitCode=1;}finally{fs.unlinkSync(temp);}
