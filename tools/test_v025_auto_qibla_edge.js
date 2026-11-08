'use strict';
const fs=require('fs'),path=require('path'),url=require('url'),os=require('os'),cp=require('child_process'),assert=require('assert');
const base=path.resolve(__dirname,'../app/src/main/assets'),original=path.join(base,'index.html'),temp=path.join(base,'_v025_auto_test.html');
const injected=[
'<script>',
'window.__qiblaRequests=[];',
'window.GemiNative={',
" verifyQiblaOnline:(lat,lon)=>window.__qiblaRequests.push({lat,lon}),",
" setCompassLocation:()=>{},",
" getLocationDiagnostics:()=>{}",
'};',
'</script>'
].join('\n');
const test=[
'<script>',
"document.addEventListener('DOMContentLoaded',()=>{",
' try{',
"  const element=document.getElementById('nz-compass-tools');",
"  const hidden=element.hidden&&element.inert&&getComputedStyle(element).display==='none';",
"  const consent=document.getElementById('nz-auto-qibla-online-consent');",
"  const defaultOff=!consent.checked&&!window.NamazAutoQibla.permitted();",
"  state.manual=false;",
"  setLocation(3.139,101.686,23,'native',Date.now(),true,'gps');",
"  const noLeak=window.__qiblaRequests.length===0;",
"  const independent=window.NamazAutoQibla.audit(3.139,101.686,qibla(3.139,101.686));",
"  const referenceOk=independent.passed&&independent.difference<.001;",
"  consent.checked=true;consent.dispatchEvent(new Event('change',{bubbles:true}));",
"  const oneCheck=window.__qiblaRequests.length===1;",
"  const optinPersisted=window.NamazAutoQibla.permitted();",
"  window.NamazApp.runAutoQiblaCheck();",
"  const throttled=window.__qiblaRequests.length===1;",
"  const bearing=qibla(3.139,101.686);",
"  nativeQiblaOnlineResult(true,bearing+.2,bearing-.2,'',3.139,101.686);",
"  const acceptedOnline=window.__qiblaRequests.length===1&&!document.getElementById('needle').classList.contains('compass-conflict');",
"  consent.checked=false;consent.dispatchEvent(new Event('change',{bubbles:true}));",
"  localStorage.removeItem('gn_autoQiblaOnlineLast');",
"  window.NamazApp.runAutoQiblaCheck();",
"  const disabledStops=window.__qiblaRequests.length===1&&!window.NamazAutoQibla.permitted();",
"  const noManualFallback=document.getElementById('manual-reference-methods').closest('#nz-compass-tools')!==null;",
"  const data={hidden,defaultOff,noLeak,referenceOk,oneCheck,optinPersisted,throttled,acceptedOnline,disabledStops,noManualFallback};",
"  const node=document.createElement('output');node.id='v025-results';node.textContent='V025_CHECK_'+JSON.stringify(data);document.body.appendChild(node);",
" }catch(e){document.body.setAttribute('data-v025-error',String(e.stack||e));}",
'});',
'</script>'
].join('\n');
fs.writeFileSync(temp,fs.readFileSync(original,'utf8').replace('<script src="auto_qibla.js"></script>',injected+'<script src="auto_qibla.js"></script>').replace('</body>',test+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-v025-'));
try{
 const exe='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const res=cp.spawnSync(exe,['--headless=new','--disable-gpu','--disable-extensions','--no-first-run',
 '--allow-file-access-from-files','--user-data-dir='+profile,'--virtual-time-budget=5000','--dump-dom',url.pathToFileURL(temp).href],
 {encoding:'utf8',timeout:26000,maxBuffer:25*1024*1024,windowsHide:true});
 const doc=res.stdout||'',m=/V025_CHECK_(\{.*?\})<\/output>/.exec(doc);
 if(!m)throw Error('Missing output '+(doc.match(/data-v025-error="([^"]+)"/)||[])[1]+' '+(res.stderr||'').slice(-450));
 const state=JSON.parse(m[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const [k,v] of Object.entries(state))assert(v,'FAILED '+k+' '+JSON.stringify(state));
 console.log('PASS v0.25 browser: Qibla methods invisible/inert, 0 online requests by default, single explicit consent enables 1 automatic check, throttles repeats, disabling stops future requests; offline bearing cross-check passes.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
