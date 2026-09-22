const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/client.js'),'utf8');
test('getFiles preserves native File metadata and prepared image contents',async()=>{
 const file=new File(['image'],'logo.png',{type:'image/png',lastModified:123});
 file.src='data:image/png;base64,aW1hZ2U=';
 file.pathname='/logo.png';
 const input={};const inputs=new Map([[input,new Map([['logo',file]])]]);
 const getFiles=vm.runInNewContext('('+source.slice(source.indexOf('async function getFiles('),source.indexOf('\nasync function getCustomData'))+')',{inputs,getCustomData:async()=>{}});
 const [result]=await getFiles([input]);
 assert.equal(result.name,'logo.png');assert.equal(result.type,'image/png');
 assert.equal(result.size,5);assert.equal(result.lastModified,123);
 assert.equal(result.src,file.src);assert.equal(result.pathname,'/logo.png');
 assert.equal(result.name.replace(/[\\/]/g,'-'),'logo.png');
});
test('file selection notifies the picker without a render template',async()=>{
 const inputs=new Map();const file=new File(['image'],'logo.png',{type:'image/png'});
 const input=new EventTarget();input.files=[file];input.multiple=false;
 input.getAttribute=name=>name==='realtime'?'false':null;
 input.hasAttribute=()=>false;input.renderValue=()=>{};
 let saved=false;input.save=()=>{saved=true;};let selected=false;
 input.addEventListener('filesSelected',()=>{selected=true;assert.equal(inputs.get(input).size,1);assert.equal(file.src,'data:image/png;base64,aW1hZ2U=');});
 const fileEvent=vm.runInNewContext('('+source.slice(source.indexOf('async function fileEvent('),source.indexOf('\nasync function getDirectoryHandles'))+')',{
  inputs,Files:new Map(),CustomEvent,console,
  readFile:async file=>{file.src='data:image/png;base64,aW1hZ2U=';},getFileId:async file=>file.pathname
 });
 await fileEvent({currentTarget:input});
 assert.equal(selected,true);assert.equal(saved,false);
});
