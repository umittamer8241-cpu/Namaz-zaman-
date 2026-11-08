'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const source=path.join(assets,'index.html'),testFile=path.join(assets,'_v024_compass_qa.html');
const testScript=[
'<script>',
"document.addEventListener('DOMContentLoaded',()=>{",
' try{',
"  state.manual=true;setLocation(40.97,29.1,null,'manual',Date.now(),true);",
"  const needle=document.getElementById('needle');",
"  state.heading=null;state.headingTrusted=false;state.headingUpdatedAt=0;updateNeedle();",
"  const referenceVisible=needle.classList.contains('compass-north-reference')&&!needle.classList.contains('compass-unreliable');",
"  const referenceWarning=document.getElementById('compass-quality').textContent.length>30;",
"  const referenceAngle=needle.style.transform;",
"  nativeHeadingData(100,180,'fused',false);",
"  const approximateVisible=needle.classList.contains('compass-approximate')&&!needle.classList.contains('compass-unreliable');",
"  const approxWarning=document.getElementById('compass-quality').textContent.includes('Do not rely')||document.getElementById('compass-quality').textContent.includes('kesin kıble')||document.getElementById('compass-quality').textContent.includes('Approximate');",
"  const approximateRotates=needle.style.transform!==referenceAngle;",
"  nativeHeadingData(100,5,'fused',true);",
"  nativeCompassDiagnostic(100,5,'fused',0,0,3,0);",
"  nativeCompassDiagnostic(145,25,'android',0,0,3,0);",
"  const conflictVisible=needle.classList.contains('compass-conflict')&&!needle.classList.contains('compass-unreliable');",
"  nativeCompassDiagnostic(103,25,'android',0,0,3,0);",
"  const trustedGold=!needle.classList.contains('compass-approximate')&&!needle.classList.contains('compass-conflict')&&!needle.classList.contains('compass-unreliable');",
"  const oneArrow=document.querySelectorAll('#needle').length===1;",
"  const result={referenceVisible,referenceWarning,approximateVisible,approxWarning,approximateRotates,conflictVisible,trustedGold,oneArrow};",
"  const output=document.createElement('output');output.id='v024-result';output.textContent='COMPASS_V024_'+JSON.stringify(result);document.body.appendChild(output);",
" }catch(e){document.body.setAttribute('data-v024-error',String(e.stack||e));}",
'});',
'</script>'
].join('\n');
fs.writeFileSync(testFile,fs.readFileSync(source,'utf8').replace('</body>',testScript+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-v024-compass-'));
try{
 const result=cp.spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
 ['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files',
 '--user-data-dir='+profile,'--virtual-time-budget=4800','--dump-dom',url.pathToFileURL(testFile).href],
 {encoding:'utf8',timeout:27000,maxBuffer:22*1024*1024,windowsHide:true});
 const html=result.stdout||'',match=/COMPASS_V024_(\{.*?\})<\/output>/.exec(html);
 if(!match)throw Error('No DOM result: '+(html.match(/data-v024-error="([^"]+)"/)||[])[1]+' '+(result.stderr||'').slice(-350));
 const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const [name,passed] of Object.entries(data))assert(passed,'Failed '+name+' '+JSON.stringify(data));
 console.log('PASS v0.24: reference-only arrow, live estimated amber arrow, sensor disagreement warning, trusted heading gold and one ornate needle.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(testFile))fs.unlinkSync(testFile);}
