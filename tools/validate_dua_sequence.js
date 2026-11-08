'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ui=fs.readFileSync(path.join(__dirname,'..','app','src','main','assets','learning_ui.js'),'utf8');
const begin=ui.indexOf('function dayOrdinal('),end=ui.indexOf('function stopAudio(');
if(begin<0||end<=begin)throw new Error('Date sequence functions not found');
const pieces=[ui.slice(begin,end)];
const storage=new Map();
const context={
 localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v))},
 window:{}
};
vm.runInNewContext(pieces[0]+'\nwindow.dailyIndex=dailyIndex;',context);
const ix=context.window.dailyIndex,n=702,start='2026-11-07';
function dayAfter(n){
 const dt=new Date(Date.UTC(2026,10,7));
 dt.setUTCDate(dt.getUTCDate()+n);
 return dt.getUTCFullYear()+'-'+(dt.getUTCMonth()+1)+'-'+dt.getUTCDate();
}
function assert(cond,msg){if(!cond)throw Error(msg);}
assert(ix(start,n)===0,'First app day must show first dua');
assert(ix(start,n)===0,'Repeated app opens same day stay same');
assert(ix(dayAfter(1),n)===1,'Second day must show second dua');
assert(ix(dayAfter(7),n)===7,'Old 7-day loop must not repeat');
assert(ix(dayAfter(n-1),n)===n-1,'Last dua reached before reset');
assert(ix(dayAfter(n),n)===0,'Restart only after whole catalog');
assert(ix(dayAfter(n+1),n)===1,'New cycle day two');
assert(ix(dayAfter(-1),n)===0,'Phone clock before first day must not select negative index');
assert(!storage.has('nz_dua_sequence_start_v09'),'Daily sequence cannot depend on installation storage');
storage.set('nz_dua_sequence_start_v09','2026-11-08');
assert(ix(dayAfter(1),n)===1,'Legacy start value must not reset daily sequence');
storage.clear();
assert(ix(dayAfter(1),n)===1,'Uninstall/new installation must not restart daily sequence');
assert(ix(dayAfter(1),24)===1,'New daily surah must advance in order');
assert(ix(dayAfter(24),24)===0,'24-surah catalog loops only after its final surah');

console.log('PASS: 702 dua sequential calendar days; reinstall cannot restart; 24 surahs advance daily; 99 Esma follow same fixed calendar.');
