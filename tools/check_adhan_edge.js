'use strict';
const fs=require('fs'),path=require('path'),url=require('url'),cp=require('child_process'),os=require('os');
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const html=path.resolve(__dirname,'../app/src/main/assets/index.html');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-adhan-'));
const cmd=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--virtual-time-budget=5000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(html).href];
const r=cp.spawnSync(edge,cmd,{encoding:'utf8',timeout:20000,maxBuffer:12*1024*1024,windowsHide:true});
const dom=r.stdout||'';
for(const id of ['adhan-auto-toggle','adhan-auto-status','adhan-settings-container','adhan-select-fajr','adhan-select-isha']){
 if(!dom.includes('id="'+id+'"'))throw Error('missing UI element: '+id);
}
if(r.status!==0)throw Error('Edge failed '+r.status);
console.log('PASS: Edge headless renders automatic switch, permission status and individual prayer selectors.');
