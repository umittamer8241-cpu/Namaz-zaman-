'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/../app/src/main/assets/';
const script=fs.readFileSync(root+'esma_i18n.js','utf8');
new vm.Script(script,{filename:'esma_i18n.js'});
let lang='tr';
const ctx={window:{NamazI18n:{getLanguage:()=>lang}}};
vm.runInNewContext(script,ctx);
const esma=ctx.window.NamazEsmaI18n;
const languages=['tr','en','ms','id','ar','ru','fr','de','es','pt','az','ur'];
for(const l of languages){
 lang=l;
 if(l!=='tr')assert.strictEqual(esma.sizes[l],99,l+' expected 99 meanings; got '+esma.sizes[l]);
 for(let i=1;i<=99;i++){
   const meaning=esma.meaning({number:i,meaningTr:'TÜRKÇE'},l);
   assert(meaning&&meaning.trim()&& (l==='tr'||meaning!=='TÜRKÇE'),l+' missing meaning at '+i);
 }
 for(const k of ['title','subtitle','learned','unlearn','count','source','info','note'])assert(esma.text(k,l),l+' missing UI '+k);
}
console.log('PASS: 99 entries per language, 12 languages, all labels; no non-Turkish fallback to Turkish.');
