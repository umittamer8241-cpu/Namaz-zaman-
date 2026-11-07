'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..','app','src','main','assets');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const daily=fs.readFileSync(path.join(root,'daily_i18n.js'),'utf8');
const full=fs.readFileSync(path.join(root,'full_ui_i18n.js'),'utf8');
const inline=html.split('<script>').pop().split('</script>')[0];
new Function(inline);
new Function(daily);
new Function(full);
const sandbox={window:{NamazI18n:{getLanguage:()=> 'tr'}},console};
vm.runInNewContext(full,sandbox);
const ui=sandbox.window.NamazUI;
const codes=['tr','en','ms','id','ar','ru','fr','de','es','pt','az','ur'];
assert.deepEqual(Object.keys(ui.LOCALES).sort(),codes.sort());
for(const code of codes){
  const record=ui.LOCALES[code];
  for(const key of ui.KEYS){
    assert.equal(typeof record[key],'string',code+':'+key);
    assert.ok(record[key].length>0,code+':'+key);
    assert.ok(!record[key].includes('\ufffd'),'bad unicode '+code+':'+key);
  }
}
assert.ok(!html.includes('TIMES.map(([,label])'),'undefined id in prayer tiles');
assert.ok(html.includes('<script src="full_ui_i18n.js"></script>'));
assert.ok(daily.includes('if(window.NamazUI)window.NamazUI.apply()'));
for(const match of html.matchAll(/\btr\('([^']+)'/g)){
  assert.ok(ui.KEYS.includes(match[1]),'missing translation key '+match[1]);
}
for(const code of codes){
 sandbox.window.NamazI18n.getLanguage=()=>code;
 for(const msg of ['Konum kaynağı hazırlanıyor...','1/2 · Google Haritalar konum motoru yüksek doğrulukla çalışıyor','Konum izni reddedildi. Koordinatları elle girebilirsin.']){
   const t=ui.status(msg);
   assert.ok(t.length>6 && t!=='noFix',code+': native status untranslated');
 }
}
console.log('PASS: 12 languages x '+ui.KEYS.length+' strings; no undefined prayer tile IDs; all native status examples localized.');
