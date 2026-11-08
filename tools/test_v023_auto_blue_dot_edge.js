'use strict';
const fs=require('fs'),path=require('path'),url=require('url'),os=require('os'),cp=require('child_process'),assert=require('assert');
const assets=path.resolve(__dirname,'../app/src/main/assets'),original=path.join(assets,'index.html'),temporary=path.join(assets,'_v023_blue_dot_qa.html');
const inject=[
'<script>',
'window.__autoTests=[];',
'window.GemiNative={',
" requestAutoLocation:()=>window.__autoTests.push('auto'),",
" requestSmartLocation:()=>window.__autoTests.push('smart'),",
" setCompassLocation:()=>{},",
" getLocationDiagnostics:()=>{}",
'};',
'</script>'
].join('\n');
const test=[
'<script>',
"document.addEventListener('DOMContentLoaded',()=>{",
' try{',
" const dot=document.getElementById('nz-location-blue-dot');",
" const live=document.getElementById('nz-location-live-dot');",
" const initial=dot.dataset.status==='waiting'&&live.dataset.status==='waiting';",
" const autoOnce=window.__autoTests.filter(x=>x==='auto').length===1;",
" const noAutomaticMap=window.__autoTests.filter(x=>x==='smart').length===0;",
" window.nativeLocation(3.139,101.686,21,false,Date.now(),'google');",
" const liveBlue=dot.dataset.status==='precise'&&live.dataset.status==='precise'&&state.source==='native';",
" const displayed=document.getElementById('nz-location-live-text').textContent;",
" const displayLabel=displayed.includes('21')&&state.times!==null;",
" state.stamp=Date.now()-17*60000;window.NamazLocationHub.refresh();",
" const staleNotBlue=dot.dataset.status==='stale';",
" window.nativeLocation(3.139,101.686,5000,false,Date.now(),'network');",
" const approximateNotBlue=dot.dataset.status==='approx';",
" state.manual=true;setLocation(3.139,101.686,null,'manual',Date.now(),true);",
" const manualGreen=dot.dataset.status==='manual';",
" const payload={initial,autoOnce,noAutomaticMap,liveBlue,displayLabel,staleNotBlue,approximateNotBlue,manualGreen};",
" const node=document.createElement('output');node.id='v023-auto-result';node.textContent='V023_AUTO_'+JSON.stringify(payload);document.body.appendChild(node);",
" }catch(e){document.body.setAttribute('data-v023-error',String(e.stack||e));}",
'});',
'</script>'
].join('\n');
fs.writeFileSync(temporary,fs.readFileSync(original,'utf8')
 .replace('<script src="location_hub.js"></script>',inject+'<script src="location_hub.js"></script>')
 .replace('</body>',test+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz23-auto-'));
try{
 const exe='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const proc=cp.spawnSync(exe,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions',
 '--allow-file-access-from-files','--user-data-dir='+profile,'--virtual-time-budget=5700','--dump-dom',url.pathToFileURL(temporary).href],
 {encoding:'utf8',timeout:27000,maxBuffer:24*1024*1024,windowsHide:true});
 const doc=proc.stdout||'',match=/V023_AUTO_(\{.*?\})<\/output>/.exec(doc);
 if(!match)throw Error('No test output: '+(doc.match(/data-v023-error="([^"]+)"/)||[])[1]+' '+(proc.stderr||'').slice(-350));
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const [k,v] of Object.entries(data))assert(v,'Failed '+k+' '+JSON.stringify(data));
 console.log('PASS v0.23 Edge: auto fused request once, no fake blue, blue only on precise real fix, stale/approximate/manual separate.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
