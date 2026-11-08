'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const base=path.resolve(__dirname,'../app/src/main/assets');
const source=path.join(base,'index.html'),temporary=path.join(base,'_v015_compass_test.html');
const inserted=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 try{
  state.manual=true;
  setLocation(40.97,29.1,null,'manual',Date.now(),true);
  const arrow=document.getElementById('needle');
  const measured=(input)=>{
   return {classHidden:arrow.classList.contains('compass-unreliable'),rotation:arrow.style.transform,
   quality:document.getElementById('compass-quality').textContent,
   status:document.getElementById('compass-status').textContent};
  };
  const unknown=measured();
  nativeHeadingData(100,180,'fused',false);
  const uncalibrated=measured();
  nativeHeadingData(100,5,'fused',true);
  const reliable=measured();
  nativeHeadingData(100,50,'fused',true);
  const imprecise=measured();
  nativeHeadingData(100,5,'fused',true);
  state.headingUpdatedAt=Date.now()-16000;
  updateNeedle();const stale=measured();
  const button=document.getElementById('compass-calibrate'),guide=document.getElementById('compass-calibration-guide');
  const guideInitiallyHidden=guide.hidden;button.click();const guideOpens=!guide.hidden;
  button.click();const guideCloses=guide.hidden;
  const output=document.createElement('output');output.id='v015-output';
  output.textContent='V015_RESULT_'+JSON.stringify({unknown,uncalibrated,reliable,imprecise,stale,guideInitiallyHidden,guideOpens,guideCloses,
   browserWidth:document.body.scrollWidth,viewport:document.documentElement.clientWidth,
   headingText:document.getElementById('pro-compass-heading').textContent,
   nativeBridge:typeof window.nativeHeadingData,arrowCount:document.querySelectorAll('#needle svg').length});
  document.body.appendChild(output);
 }catch(error){document.body.setAttribute('data-test-error',String(error.stack||error));}
});
</script>`;
fs.writeFileSync(temporary,fs.readFileSync(source,'utf8').replace('</body>',inserted+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz15-compass-'));
try{
 const exe='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const args=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--window-size=460,1150','--virtual-time-budget=5000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(temporary).href];
 const run=cp.spawnSync(exe,args,{encoding:'utf8',timeout:26000,maxBuffer:22*1024*1024,windowsHide:true});
 const html=run.stdout||'',match=/V015_RESULT_(\{.*?\})<\/output>/.exec(html);
 if(!match)throw Error('Missing QA marker '+(html.match(/data-test-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-300));
 const d=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 if(!d.unknown.classHidden||!d.uncalibrated.classHidden||!d.imprecise.classHidden||!d.stale.classHidden)throw Error('Unsafe compass arrow visible: '+JSON.stringify(d));
 if(d.reliable.classHidden||!d.reliable.quality.includes('±5°')||d.reliable.rotation==='rotate(0deg)')throw Error('Reliable reading suppressed '+JSON.stringify(d.reliable));
 if(!d.guideInitiallyHidden||!d.guideOpens||!d.guideCloses||d.arrowCount!==1||d.nativeBridge!=='function')throw Error('UI interaction broken '+JSON.stringify(d));
 console.log('PASS v0.15: unknown, low accuracy, high error and stale readings hide arrow; accurate fused heading rotates; calibration guide toggles.');
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
