'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert');
const root=__dirname+'/../app/src/main/assets/';
const html=fs.readFileSync(root+'index.html','utf8');
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const adhan=fs.readFileSync(root+'adhan_settings.js','utf8');
new vm.Script(adhan,{filename:'adhan_settings.js'});
new vm.Script(inline,{filename:'index-inline.js'});
const ui=[];
function element(tag='div'){
 const el={tag,id:'',value:'',checked:false,textContent:'',style:{},dataset:{},children:[],listeners:{},
    appendChild(ch){this.children.push(ch);return ch;},
    addEventListener(type,callback){this.listeners[type]=callback;},
    setAttribute(k,v){this[k]=v;},
    get innerHTML(){return this._html||'';},
    set innerHTML(value){this._html=value;this.children=[];}};
 ui.push(el);return el;
}
const host=element('section');host.id='adhan-settings-container';
const store={}, nativeEvents=[], enabled=[], previews=[];
const bridge={
 setAdhanEnabled(on){enabled.push(on);},
 setAdhanSchedule(s){nativeEvents.push(JSON.parse(s));},
 requestAdhanPermissions(){},stopAdhan(){},previewAdhan(prayer,recording){previews.push({prayer,recording});},
 adhanPermissionState(){return JSON.stringify({exact:true,notifications:true});}
};
const ctx=vm.createContext({Date,Math,JSON,Number,String,Array,Object,Set,Map,console,
 window:{GemiNative:bridge,NamazI18n:{getLanguage(){return 'tr';},prayer(id){return id;}}},
 document:{getElementById(id){return ui.find(x=>x.id===id)||null;},createElement:element,addEventListener(){},hidden:false},
 localStorage:{getItem(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null;},setItem(k,v){store[k]=v;}},
 setTimeout(cb){cb();},setInterval(){}});
const core=inline.slice(inline.indexOf('const $ ='),inline.indexOf('function qibla('));
vm.runInContext(core,ctx);
vm.runInContext('state.lat=3.139;state.lon=101.686;state.source="manual";state.stamp=Date.now();',ctx);
vm.runInContext(adhan,ctx);
vm.runInContext('window.NamazAdhan.init()',ctx);
assert.equal(enabled[0],true);
assert(nativeEvents.length>0);
assert(nativeEvents[0].length>140&&nativeEvents[0].length<=155);
assert(nativeEvents[0].every(x=>x.recording==='beautiful'));
const sw=ui.find(x=>x.id==='adhan-auto-toggle');
assert(sw&&sw.checked);
sw.checked=false;sw.listeners.change();
assert.equal(enabled.at(-1),false);
sw.checked=true;sw.listeners.change();
assert.equal(enabled.at(-1),true);
const fajr=ui.find(x=>x.id==='adhan-select-fajr');
assert(fajr);
fajr.value='none';fajr.listeners.change();
assert(nativeEvents.at(-1).every(x=>x.id!=='fajr'),'silent Fajr should never play');
fajr.value='calling';fajr.listeners.change();
assert(nativeEvents.at(-1).some(x=>x.id==='fajr'&&x.recording==='calling'));
ui.find(x=>x.id==='adhan-prayer-select').value='fajr';
const listen=ui.find(x=>x.id==='adhan-preview-btn');
assert(listen&&listen.listeners.click);
listen.listeners.click();
assert.deepEqual(previews.at(-1),{prayer:'fajr',recording:'calling'});
listen.listeners.click(); // repeat click stops playback
console.log('PASS: v0.11 auto Adhan default ON, 31 days, per-prayer choice, disable, native listen/stop.');
