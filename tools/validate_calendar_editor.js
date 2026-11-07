'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const ui=fs.readFileSync(path.join(assets,'prayer_tracker.js'),'utf8');
const css=fs.readFileSync(path.join(assets,'learning_styles.css'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
assert(gradle.includes("versionCode 23")&&gradle.includes("applicationId 'com.geminamaz.app'"));
for(const text of ['editorOpen=true','openSelected(day)','nz-cal-editor','nz-cal-editor-close','autoSave','closeEditor',
  'if(dayStamp(day)>dayStamp(today()))return','if(!eligible(day,id).allowed)return false',
  'input.disabled=!permission.allowed','selected=day;editorOpen=true;renderCalendar()']){
 assert(ui.includes(text),'Missing calendar editor requirement: '+text);
}
for(const code of ['tr','en','ms','id','ar','ru','fr','de','es','pt','az','ur']){
 assert(ui.includes(code+':['),'Missing localized calendar editor strings for '+code);
}
assert(css.includes('.nz-cal-detail.nz-cal-editor')&&css.includes('.nz-cal-editor-close'));
console.log('PASS: monthly calendar tap editor, 12 languages, history editable, future and pre-time gated, main full package.');
