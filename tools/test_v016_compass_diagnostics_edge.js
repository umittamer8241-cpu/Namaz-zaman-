'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const base=path.resolve(__dirname,'../app/src/main/assets'),origin=path.join(base,'index.html'),temp=path.join(base,'_v016_test.html');
const code=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 try{
   state.manual=true;setLocation(40.97,29.1,null,'manual',Date.now(),true);
   nativeHeadingData(100,5,'fused',true);
   nativeCompassDiagnostic(100,5,'fused',null,null,4,0);
   nativeCompassDiagnostic(104,25,'android',12,-3,4,0);
   const arrow=document.getElementById('needle');
   const good=!arrow.classList.contains('compass-unreliable');
   const readable=document.getElementById('compass-diagnostics-data').textContent;
   nativeCompassDiagnostic(145,25,'android',12,-3,4,1);
   const mismatchHidden=arrow.classList.contains('compass-unreliable');
   const mismatchText=document.getElementById('compass-diagnostics-data').textContent;
   const count=document.querySelectorAll('.compass-debug-row').length;
   window.GemiNative={copyCompassReport:s=>window.copiedReport=s};
   document.getElementById('compass-diagnostics-copy').click();
   const copied=window.copiedReport||'';
   nativeCompassDiagnostic(101,25,'android',12,-3,4,0);
   const recovered=!arrow.classList.contains('compass-unreliable');
   const output=document.createElement('output');output.id='diag-output';
   output.textContent='DIAG_V016_'+JSON.stringify({good,mismatchHidden,recovered,count,hasBoth:readable.includes('100.0')&&readable.includes('104.0'),
   showsGap:mismatchText.includes('45.0'),copied:copied.includes('Google')&&copied.includes('Android'),noExactCoords:!copied.includes('40.97')&&!copied.includes('29.1'),
   heading:document.getElementById('pro-compass-heading').textContent,source:document.getElementById('compass-quality').textContent});
   document.body.appendChild(output);
 }catch(err){document.body.setAttribute('data-diag-error',String(err.stack||err));}
});
</script>`;
fs.writeFileSync(temp,fs.readFileSync(origin,'utf8').replace('</body>',code+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz16compass-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const run=cp.spawnSync(edge,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=5500','--window-size=460,1200','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(temp).href],
  {encoding:'utf8',timeout:22000,maxBuffer:18*1024*1024,windowsHide:true});
 const dom=run.stdout||'',m=/DIAG_V016_(\{.*?\})<\/output>/.exec(dom);
 if(!m)throw Error('No output '+(dom.match(/data-diag-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-400));
 const d=JSON.parse(m[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const k of ['good','mismatchHidden','recovered','hasBoth','showsGap','copied','noExactCoords'])if(!d[k])throw Error('Missing '+k+' '+JSON.stringify(d));
 if(d.count<11)throw Error('Missing diagnostics '+JSON.stringify(d));
 console.log('PASS: good sensor agrees, 45° disagreement hides needle, re-alignment recovers, copying diagnostics omits exact location.');
}catch(e){console.error(e.stack);process.exitCode=1;}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
