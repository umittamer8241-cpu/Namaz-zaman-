'use strict';
const fs=require('fs'),path=require('path'),url=require('url'),os=require('os'),cp=require('child_process'),assert=require('assert');
const assets=path.resolve(__dirname,'../app/src/main/assets'),original=path.join(assets,'index.html'),
  temp=path.join(assets,'_v022_premium_test.html');
const mock=[
'<script>',
'window.__locationBridge=[];',
'window.GemiNative={',
" getLocationDiagnostics:()=>window.__locationBridge.push('status'),",
" requestPreciseLocation:()=>window.__locationBridge.push('precise'),",
" requestSatelliteLocation:()=>window.__locationBridge.push('satellite'),",
" requestLocation:()=>window.__locationBridge.push('network'),",
" setCompassLocation:()=>{},",
" requestSmartLocation:()=>window.__locationBridge.push('smart')",
'};',
'</script>'
].join('\n');
const test=[
'<script>',
"document.addEventListener('DOMContentLoaded',()=>{",
'try{',
" const hub=document.getElementById('nz-location-hub');",
" const button=document.getElementById('nz-location-hub-open');",
" const details=document.getElementById('nz-compass-tools');",
" const study=document.getElementById('nz-study-drawer');",
" const before={hubHidden:hub.hidden,detailClosed:!details.open,studyClosed:!study.open,buttonUnique:document.querySelectorAll('#nz-location-hub-open').length===1,diagnosticWithinHub:!!document.getElementById('nz-location-diagnostic-panel').closest('#nz-location-hub'),rescueWithinHub:!!document.getElementById('location-rescue').closest('#nz-location-hub'),settingsWithinHub:!!document.getElementById('timezone-mode').closest('#nz-location-hub'),calendarClosed:!document.getElementById('nz-calendar-drawer').open,duaVisible:!!document.getElementById('nz-dua-learning').offsetHeight,ariaClosed:button.getAttribute('aria-expanded')==='false'};",
" button.click();",
" const opened=!hub.hidden&&hub.getAttribute('aria-hidden')==='false'&&document.body.classList.contains('nz-hub-modal-open')&&document.activeElement.id==='nz-location-hub-close';",
" document.getElementById('location-precise-button').click();",
" const precise=window.__locationBridge.includes('precise');",
" document.getElementById('location-manual-shortcut').click();",
" const manualDetails=document.getElementById('manual-location-details').open;",
" document.getElementById('latitude').value='3.139';document.getElementById('longitude').value='101.687';",
" document.getElementById('manual-button').click();",
" const manualSaved=window.NamazApp.locationHubStatus().manual&&window.NamazApp.locationHubStatus().available;",
" const labelUpdated=document.getElementById('nz-location-hub-caption').textContent.length>8;",
" document.getElementById('method').value='JAKIM';document.getElementById('method').dispatchEvent(new Event('change',{bubbles:true}));",
" const settingsSaved=JSON.parse(localStorage.getItem('gn_method'))==='JAKIM';",
" document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));",
" const closed=hub.hidden&&!document.body.classList.contains('nz-hub-modal-open')&&button.getAttribute('aria-expanded')==='false'&&document.activeElement===button;",
" details.open=true;study.open=true;",
" const expandable=details.open&&study.open&&document.getElementById('sun-shadow-align').closest('#nz-compass-tools')!==null;",
" details.open=false;study.open=false;",
" const afterClosing=hub.hidden&&before.hubHidden&&!details.open&&!study.open;",
" const output=document.createElement('output');output.id='premium-qa';",
" output.textContent='PREMIUM_V022_'+JSON.stringify({before,opened,precise,manualDetails,manualSaved,labelUpdated,settingsSaved,closed,expandable,afterClosing,windowWidth:document.documentElement.clientWidth,bodyScrollWidth:document.body.scrollWidth,scrollHeight:document.body.scrollHeight,hubStatus:window.NamazApp.locationHubStatus(),currentFocus:document.activeElement?.id});document.body.appendChild(output);",
"}catch(e){document.body.setAttribute('data-premium-error',String(e.stack||e));}",
'});',
'</script>'
].join('\n');
fs.writeFileSync(temp,fs.readFileSync(original,'utf8')
.replace('<script src="location_hub.js"></script>',mock+'<script src="location_hub.js"></script>')
.replace('</body>',test+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-v022-ui-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const args=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files',
   '--window-size=405,1050','--virtual-time-budget=5500','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(temp).href];
 const result=cp.spawnSync(edge,args,{encoding:'utf8',timeout:27000,maxBuffer:20*1024*1024,windowsHide:true});
 const output=result.stdout||'',match=/PREMIUM_V022_(\{.*?\})<\/output>/.exec(output);
 if(!match)throw Error('QA missing: '+(output.match(/data-premium-error="([^"]+)"/)||[])[1]+' '+(result.stderr||'').slice(-350));
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const [k,v] of Object.entries(data.before))assert(v,'Precondition failed '+k+' '+JSON.stringify(data));
 for(const k of ['opened','precise','manualDetails','manualSaved','labelUpdated','settingsSaved','closed','expandable','afterClosing'])
  assert(data[k],'Interaction failed '+k+' '+JSON.stringify(data));
 assert(data.bodyScrollWidth<=data.windowWidth+1,'Horizontal overflow '+JSON.stringify(data));
 console.log('PASS v0.22: one-button sheet, settings/diagnostics/manual inside, modal open/close/ESC, focus restored, settings persisted, compass & study collapsed, no horizontal overflow.');
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
