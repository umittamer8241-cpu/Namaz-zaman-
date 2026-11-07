'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const assets=path.resolve(__dirname,'../app/src/main/assets'),source=path.join(assets,'index.html'),temp=path.join(assets,'_v020_test.html');
const mock=[
'<script>',
'window.__locationCalls=[];',
'window.GemiNative={',
"getLocationDiagnostics:()=>window.__locationCalls.push('status'),",
"retryOfflineGpsWhenPermitted:()=>window.__locationCalls.push('offline'),",
"requestSmartLocation:()=>window.__locationCalls.push('smart'),",
'copyLocationReport:report=>window.__copiedLocationReport=report,',
'setCompassLocation:()=>{}',
'};',
'</script>'
].join('\n');
const action=[
'<script>',
"document.addEventListener('DOMContentLoaded',()=>{",
'try{',
'window.nativeLocationDiagnostics({fine:false,coarse:true,systemEnabled:true,gpsEnabled:true,networkEnabled:true,googleReady:true,searching:false,mode:"idle",source:"",ageSeconds:-1,accuracyMeters:-1,latestValid:false});',
"const a=document.getElementById('nz-location-diagnostic-results').textContent;",
"const coarse=(a.includes('Yaklaşık')||a.includes('Approximate'))&&a.includes('Google');",
"const hint=document.getElementById('nz-location-diagnostic-hint').textContent;",
"state.manual=true;document.getElementById('nz-location-smart').click();const manualReleased=state.manual===false;",
"document.getElementById('nz-location-diagnostic-copy').click();",
"const text=window.__copiedLocationReport||'';",
"const properButtons=window.__locationCalls.includes('smart')&&window.__locationCalls.includes('status');",
"const firstBootstrap=window.__locationCalls.includes('offline');",
'window.nativeLocationDiagnostics({fine:true,coarse:true,systemEnabled:false,gpsEnabled:false,networkEnabled:false,googleReady:false,searching:false,mode:"idle",source:"",ageSeconds:-1,accuracyMeters:-1,latestValid:false});',
"const offHint=document.getElementById('nz-location-diagnostic-hint').textContent;",
"const data={coarse,coarseHint:hint.includes('Kesin Konum')||hint.includes('Precise permission'),properButtons,manualReleased,firstBootstrap,reportNoCoordinates:!text.includes('3.139')&&!text.includes('101.686')&&text.includes('Location diagnostics'),disabledLocationWarning:(offHint.includes('Konum')&&offHint.includes('aç'))||offHint.includes('Enable system Location'),hasPanel:!!document.getElementById('nz-location-diagnostic-panel')};",
"const output=document.createElement('output');output.id='v020-output';output.textContent='V020_RESULTS_'+JSON.stringify(data);document.body.appendChild(output);",
"}catch(e){document.body.setAttribute('data-v020-error',String(e.stack||e));}",
'});',
'</script>'
].join('\n');
fs.writeFileSync(temp,fs.readFileSync(source,'utf8').replace('<script src="location_diagnostics.js"></script>',mock+'<script src="location_diagnostics.js"></script>').replace('</body>',action+'</body>'));
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'nz20-'));
try{
 const exe='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const result=cp.spawnSync(exe,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=6500','--user-data-dir='+prof,'--dump-dom',url.pathToFileURL(temp).href],
 {encoding:'utf8',timeout:28000,maxBuffer:22*1024*1024,windowsHide:true});
 const html=result.stdout||'',match=/V020_RESULTS_(\{.*?\})<\/output>/.exec(html);
 if(!match)throw Error('No result '+(html.match(/data-v020-error="([^"]+)"/)||[])[1]+' '+(result.stderr||'').slice(-400));
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const [k,v] of Object.entries(data))if(!v)throw Error('FAILED '+k+' '+JSON.stringify(data));
 console.log('PASS Edge v0.20: false-precise permission shown, smart button triggers request, no-coordinate report, system-off diagnostic, offline auto retry.');
}catch(e){console.error(e.stack);process.exitCode=1;}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
