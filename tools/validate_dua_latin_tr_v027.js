'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert');
const dir=path.resolve(__dirname,'../app/src/main/assets');
function load(applyFix){
 const context={window:{}};
 if(!applyFix)context.window.NamazDuaLatinTR={correct:x=>x.latin};
 for(const p of ['daily_dua_library.js','extra_surahs.js',...(applyFix?['dua_latin_tr_fixes.js']:[]),'learning_content.js'])
  vm.runInNewContext(fs.readFileSync(path.join(dir,p),'utf8'),context,{filename:p});
 return context.window.NamazLearningContent;
}
const original=load(false),repaired=load(true);
assert.strictEqual(original.duas.length,702);
assert.strictEqual(repaired.duas.length,702);
let changed=0;
for(let i=0;i<702;i++){
 const a=original.duas[i],b=repaired.duas[i];
 for(const key of Object.keys(a)){
  if(key!=='latin')assert.strictEqual(a[key],b[key],'Non-reading data changed: '+key+' index='+i);
 }
 assert(b.latin.trim().length>3,'Empty reading index '+i);
 assert(!/[ġżśžêàáéíŋćек]/u.test(b.latin),'Non-Turkish/Cyrillic character '+i);
 assert(!/([a-zçğıöşüâîû])Allâh/u.test(b.latin),'Incorrect fused name '+i);
 if(a.latin!==b.latin)changed++;
}
function byId(n){return repaired.duas.find(x=>x.id===n);}
assert(byId(6).latin.includes("e'innî"),'Ebû Dâvûd 1522');
assert(byId(9).latin.includes('tevelleyte'),'Ebû Dâvûd 1425');
assert(byId(155).latin.includes('ev nechele ev yüchele aleynâ'),'Diyanet published Turkish reading');
assert(byId(752).latin.includes('yünakkas-sevbül'),'Mixed alphabet typo');
assert(changed>=30&&changed<=150,'Unexpected correction count: '+changed);
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
assert(html.indexOf('dua_latin_tr_fixes.js')>0&&html.indexOf('dua_latin_tr_fixes.js')<html.indexOf('learning_content.js'));
const ui=fs.readFileSync(path.join(dir,'learning_ui.js'),'utf8');
assert(ui.includes('nz-dua-pronunciation')&&ui.includes('Latin harfleri Arapçadaki bütün sesleri karşılamaz'));
console.log('PASS: '+changed+'/702 readings normalized; zero non-Turkish characters; Arabic, meanings, sources and order unchanged; dua audio stays absent.');
