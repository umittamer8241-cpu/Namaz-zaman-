'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../app/src/main/assets');
const source=path.join(root,'index.html'),tmp=path.join(root,'_v024_compass_fallback_test.html');
const injection="<script>\ndocument.addEventListener('DOMContentLoaded',()=>{\n try{\n  const arrow=document.getElementById('needle');\n  const read=()=>({mode:document.getElementById('pro-compass-label').textContent,\n    note:document.getElementById('compass-arrow-mode').textContent,\n    heading:document.getElementById('pro-compass-heading').textContent,\n    angle:arrow.style.transform,\n    visibility:getComputedStyle(arrow).opacity,\n    approximate:arrow.classList.contains('compass-approximate'),\n    schematic:arrow.classList.contains('compass-unreliable')});\n  state.manual=true;\n  setLocation(40.97,29.10,null,'manual',Date.now(),true);\n  const map=read();\n  nativeHeadingData(150,180,'magnetic',false);\n  const invalid=read();\n  nativeHeadingData(150,40,'magnetic',false);\n  const magnetic=read();\n  nativeCompassSensorStatus({model:'Redmi TEST',rotationPresent:true,accelerometerPresent:true,magnetometerPresent:true,rotationSamples:4,gravitySamples:13,magneticSamples:11,fusedSamples:2,magneticAccuracy:2,magneticStrength:48});\n  const diagnosis=document.getElementById('compass-diagnostics-data').textContent;\n  nativeHeadingData(150,5,'fused',true);\n  const trusted=read();\n  state.headingUpdatedAt=Date.now()-15000;\n  updateNeedle();\n  const expired=read();\n  const output=document.createElement('output');\n  output.id='v024-test-result';output.textContent='V024_RESULT_'+JSON.stringify({map,invalid,magnetic,trusted,expired,diagnosis});\n  document.body.appendChild(output);\n }catch(e){document.body.setAttribute('data-v024-error',String(e.stack||e));}\n});\n</script>";
fs.writeFileSync(tmp,fs.readFileSync(source,'utf8').replace('</body>',injection+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-v024-compass-'));
try {
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const args=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--window-size=460,1200','--virtual-time-budget=6000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(tmp).href];
 const run=cp.spawnSync(edge,args,{encoding:'utf8',timeout:26000,maxBuffer:25*1024*1024,windowsHide:true});
 const dom=run.stdout||'',found=/V024_RESULT_(\{.*?\})<\/output>/.exec(dom);
 if(!found)throw Error('No browser measurement '+(dom.match(/data-v024-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-400));
 const v=JSON.parse(found[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 if(!v.map.schematic||v.map.approximate)throw Error('Initial map fallback missing '+JSON.stringify(v.map));
 if(!v.invalid.schematic||v.invalid.approximate)throw Error('Bad magnetic reading accepted '+JSON.stringify(v.invalid));
 if(v.magnetic.schematic||!v.magnetic.approximate||!/(APPROXIMATE|YAKLAŞIK)/.test(v.magnetic.mode))throw Error('Approximate live heading missing '+JSON.stringify(v.magnetic));
 if(v.magnetic.angle===v.map.angle)throw Error('Approximate live pointer did not rotate '+JSON.stringify(v.magnetic));
 if(v.trusted.schematic||v.trusted.approximate||!/(LIVE|CANLI)/.test(v.trusted.mode))throw Error('Good fused not restored '+JSON.stringify(v.trusted));
 if(!v.expired.schematic||v.expired.approximate)throw Error('Expired live pointer remains active '+JSON.stringify(v.expired));
 if(!v.diagnosis.includes('Redmi TEST')||!v.diagnosis.includes('48 µT')||!v.diagnosis.includes('13'))throw Error('Native sensor diagnostics missing '+v.diagnosis);
 console.log('PASS v0.24 Edge: bogus magnetic stays schematic; valid raw magnetic animates as APPROX; calibrated fused takes priority; timeout schematic; diagnostic reports model/strength/samples.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
