'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../app/src/main/assets');
const html=path.join(root,'index.html'),tmp=path.join(root,'_v014_live_qa.html');
const injected=`<script>
document.addEventListener('DOMContentLoaded',async()=>{
 try{
  const dial=document.querySelector('.ornate-compass-dial');
  const frame=dial.querySelector('.ornate-compass-frame');
  const arrow=dial.querySelector('.ornate-single-needle');
  const current=window.NamazI18n?.getLanguage?.()||'tr';
  state.manual=true;
  setLocation(40.970,29.100,null,'manual',Date.now(),true);
  const target=qibla(40.970,29.100);
  nativeHeading(target);
  const zero=arrow.style.transform;
  const diffZero=document.getElementById('pro-compass-difference').textContent;
  nativeHeading((target+72)%360);
  const rotated=arrow.style.transform;
  const diffOther=document.getElementById('pro-compass-difference').textContent;
  const data={frameLoaded:frame.complete&&frame.naturalWidth>100,arrowCount:dial.querySelectorAll('.ornate-single-needle svg').length,
   zero,rotated,diffZero,diffOther,heading:document.getElementById('pro-compass-heading').textContent,
   bearing:document.getElementById('bearing').textContent,layout:getComputedStyle(dial.parentNode.parentNode).display,
   adhanPresent:!!document.getElementById('adhan-settings-container'),calendarPresent:!!document.getElementById('nz-month-calendar'),locale:current};
  const out=document.createElement('output');out.id='v014-results';out.textContent='V014_RESULTS_'+JSON.stringify(data);document.body.appendChild(out);
 }catch(e){document.body.setAttribute('data-v014-error',String(e.stack||e));}
});
</script>`;
fs.writeFileSync(tmp,fs.readFileSync(html,'utf8').replace('</body>',injected+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-v014-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const args=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--window-size=460,1200','--virtual-time-budget=6000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(tmp).href];
 const run=cp.spawnSync(edge,args,{encoding:'utf8',timeout:23000,maxBuffer:19*1024*1024,windowsHide:true});
 const dom=run.stdout||'',match=/V014_RESULTS_(\{.*?\})<\/output>/.exec(dom);
 if(!match)throw Error('No report '+(dom.match(/data-v014-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-500));
 const v=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 if(!v.frameLoaded||v.arrowCount!==1||v.adhanPresent||!v.calendarPresent)throw Error('Asset/layout error: '+JSON.stringify(v));
 if(v.zero!=='rotate(0deg)'||v.rotated!=='rotate(288deg)'||v.diffZero!=='0°'||v.diffOther!=='72°')throw Error('Sensor rotation regression: '+JSON.stringify(v));
 console.log('PASS Edge v0.14: ornate SVG loaded, one arrow turns 0→288°, heading difference 0→72°, no adhan, calendar retained.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
