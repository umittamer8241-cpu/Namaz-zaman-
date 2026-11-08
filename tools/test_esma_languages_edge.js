'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const tmp=path.join(assets,'_esma_12lang_test.html');
const source=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const cases=['tr','en','ms','id','ar','ru','fr','de','es','pt','az','ur'];
const script=`<script>
document.addEventListener('DOMContentLoaded',()=>{
 setTimeout(async()=>{
  try {
   const cases=${JSON.stringify(cases)};
   const outputs=[];
   const sel=document.getElementById('app-language');
   for(const code of cases){
     sel.value=code;sel.dispatchEvent(new Event('change',{bubbles:true}));
     await new Promise(ok=>setTimeout(ok,30));
     const host=document.getElementById('nz-esma-learning');
     const title=host.querySelector('.small-label')?.textContent||'';
     const meaning=host.querySelector('.nz-esma-meaning')?.textContent||'';
     const labels=[...host.querySelectorAll('button')].map(b=>b.textContent);
     outputs.push({
       language:code,title,meaning,arabic:host.querySelector('.nz-esma-ar')?.textContent||'',
       count:host.querySelectorAll('.nz-esma-item').length,
       expected:window.NamazEsmaI18n.meaning(window.NamazLearningContent.names[0],code),
       expectedTitle:window.NamazEsmaI18n.text('title',code),
       buttons:labels
     });
   }
   const out=document.createElement('output');out.id='esma-test-result';
   out.textContent='ESMA_12LANG_'+JSON.stringify(outputs);
   document.body.appendChild(out);
  }catch(e){document.body.setAttribute('data-esma-error',String(e));}
 },200);
});
</script>`;
fs.writeFileSync(tmp,source.replace('</body>',script+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'esma12qa-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const result=cp.spawnSync(edge,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=12000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(tmp).href],
 {encoding:'utf8',timeout:23000,maxBuffer:18*1024*1024,windowsHide:true});
 const html=result.stdout||'';
 const match=/ESMA_12LANG_(\[.*?\])<\/output>/.exec(html);
 if(!match)throw Error('No test output; '+(html.match(/data-esma-error="([^"]+)"/)||[])[1]+' '+(result.stderr||'').slice(-500));
 const rows=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 if(rows.length!==12)throw Error('Unexpected language count '+rows.length);
 const arab=rows[0].arabic;
 for(const v of rows){
  if(v.title!==v.expectedTitle||v.meaning!==v.expected||v.count!==1||v.arabic!==arab){
    throw Error('Failed '+v.language+' '+JSON.stringify(v));
  }
  if(v.language!=='tr'&&v.meaning===rows[0].meaning)throw Error('Untranslated '+v.language);
 }
 console.log('PASS: Real Edge locale switching; all 12 localized Esma headings and meanings; exactly one name; Arabic preserved.');
}catch(ex){console.error(ex.stack);process.exitCode=1;}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
