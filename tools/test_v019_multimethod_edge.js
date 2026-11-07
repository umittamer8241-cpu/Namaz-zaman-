'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const base=path.resolve(__dirname,'../app/src/main/assets'),origin=path.join(base,'index.html'),tmp=path.join(base,'_v019_test.html');
const injection=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 try{
  const requests=[];
  window.GemiNative={
    verifyQiblaOnline:(lat,lon)=>requests.push({lat,lon}),
    setCompassLocation:()=>{},
    requestSatelliteLocation:()=>requests.push('GPS'),
    requestLocation:()=>requests.push('NETWORK')
  };
  state.manual=true;setLocation(3.139,101.686,null,'manual',Date.now(),true);
  const initialRequests=requests.length;
  const button=document.getElementById('qibla-online-button');
  button.click();
  const wasRequested=requests.length===1&&requests[0].lat===3.139&&requests[0].lon===101.686;
  const expected=qibla(3.139,101.686);
  nativeQiblaOnlineResult(true,expected+0.11,expected-0.07,'',3.139,101.686);
  const good=document.getElementById('qibla-online-status').classList.contains('verified');
  const resultItems=document.querySelectorAll('.qibla-online-row').length;
  button.click();
  nativeQiblaOnlineResult(true,expected+19.0,expected-8.0,'',3.139,101.686);
  const warning=document.getElementById('qibla-online-status').classList.contains('warning');
  const n=document.getElementById('manual-north-align');
  n.click();
  const withoutApproval=!manualReferenceActive();
  document.getElementById('manual-reference-confirm').checked=true;
  n.click();
  const northWorks=manualReferenceActive()&&
   Math.abs(manualReference.relative-expected)<.001;
  document.getElementById('manual-heading-input').value='270';
  document.getElementById('manual-heading-align').click();
  const headingWorks=manualReferenceActive()&&
   Math.abs(manualReference.relative-(expected+90)%360)<.001;
  document.getElementById('manual-landmark-lat').value='3.139';
  document.getElementById('manual-landmark-lon').value='102.686';
  document.getElementById('manual-landmark-align').click();
  const landmarkWorks=manualReferenceActive()&&Math.abs(manualReference.heading-90)<.5;
  document.getElementById('manual-reference-reset').click();
  const disabled=!manualReferenceActive();
  const payload={initialRequests,wasRequested,good,resultItems,warning,withoutApproval,
   northWorks,headingWorks,landmarkWorks,disabled,requests:requests.length,source:state.source};
  const x=document.createElement('output');x.id='v019-test';x.textContent='V019_MULTI_'+JSON.stringify(payload);document.body.appendChild(x);
 }catch(error){document.body.setAttribute('data-v019-error',String(error.stack||error));}
});
</script>`;
fs.writeFileSync(tmp,fs.readFileSync(origin,'utf8').replace('</body>',injection+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz19-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const run=cp.spawnSync(edge,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=6000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(tmp).href],{encoding:'utf8',timeout:26000,maxBuffer:24*1024*1024,windowsHide:true});
 const doc=run.stdout||'',match=/V019_MULTI_(\{.*?\})<\/output>/.exec(doc);
 if(!match)throw Error('Missing output '+(doc.match(/data-v019-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-450));
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const k of ['wasRequested','good','warning','withoutApproval','northWorks','headingWorks','landmarkWorks','disabled']){
  if(!data[k])throw Error('FAIL '+k+' '+JSON.stringify(data));
 }
 if(data.resultItems!==4||data.initialRequests!==0||data.requests!==2)throw Error('Network behavior wrong '+JSON.stringify(data));
 console.log('PASS Edge: zero automatic online requests; explicit 2 checks; 3 offline alignment methods; unconfirmed alignment rejected; confidence and disagreements displayed.');
}catch(error){console.error(error.stack);process.exitCode=1;}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
