const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/client/index.js'),'utf8');
test('accept values convert to content-type filter expressions',()=>{
 const acceptToFilterValue=vm.runInNewContext('('+source.slice(source.indexOf('function acceptToFilterValue('),source.indexOf('\nfunction applyFileFor'))+')');
 assert.equal(acceptToFilterValue('image/*'),'^image/');
 assert.equal(acceptToFilterValue('image/png'),'^image/png$');
 assert.equal(acceptToFilterValue('image/*, video/*'),'^(?:image/.*|video/.*)$');
 assert.equal(acceptToFilterValue('.png'),'');
 assert.equal(acceptToFilterValue('*/*'),'');
});
test('file capture is applied to the controller before native activation',()=>{
 const attributes=new Map();
 const controller={matches:selector=>selector==='input[type="file"]',setAttribute:(name,value)=>attributes.set(name,value),removeAttribute:name=>attributes.delete(name)};
 const document={getElementById:id=>id==='camera-controller'?controller:null};
 const label={parentElement:null,getAttribute:name=>name==='file-for'?'camera-controller':name==='file-capture'?'user':null,hasAttribute:name=>name==='file-capture'};
 const start=source.indexOf('function resolveFileController(');
 const end=source.indexOf('\nfunction getRenderableFiles',start);
 const syncFileCapture=vm.runInNewContext(`(()=>{${source.slice(start,end)};return syncFileCapture})()`,{document,fileForAttribute:'file-for'});
 syncFileCapture(label);
 assert.equal(attributes.get('capture'),'user');
 label.getAttribute=name=>name==='file-for'?'camera-controller':name==='file-capture'?'false':null;
 syncFileCapture(label);
 assert.equal(attributes.has('capture'),false);
});
test('file-select reads its stored file from the render controller',async()=>{
 const stored={_id:'file-1',name:'avatar.png',pathname:'/media/avatar.png','content-type':'image/png'};
 const preview={currentSrc:'https://example.test/assets/media/avatar.png',src:''};
 const renderedElement={
  getAttribute:name=>name==='object'?'file-1':null,
  querySelector:()=>preview
 };
 const renderController={
  getData:async()=>({object:[stored]}),
  getAttribute:name=>name==='render'?'object':null
 };
 const element={
  closest:selector=>selector==='[render-query]'?renderController:renderedElement,
  querySelector:()=>null
 };
 const start=source.indexOf('async function getFileSelectValue(');
 const end=source.indexOf('\nfunction initFileSelect',start);
 const getFileSelectValue=vm.runInNewContext('('+source.slice(start,end)+')');
 const result=await getFileSelectValue(element);
 assert.equal(result.id,'file-1');
 assert.equal(result.pathname,'/media/avatar.png');
 assert.equal(result.src,preview.currentSrc);
});
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
test('renderable files expose native File metadata as own properties',()=>{
 const file=new File(['image'],'logo.png',{type:'image/png',lastModified:123});
 file.src='data:image/png;base64,aW1hZ2U=';
 file.pathname='/logo.png';
 const start=source.indexOf('function getRenderableFiles(');
 const end=source.indexOf('\nfunction acceptToFilterValue',start);
 const getRenderableFiles=vm.runInNewContext('('+source.slice(start,end)+')');
 const [result]=getRenderableFiles([file]);
 assert.equal(Object.hasOwn(result,'name'),true);
 assert.equal(result.name,'logo.png');
 assert.equal(result.type,'image/png');
 assert.equal(result.size,5);
 assert.equal(result.lastModified,123);
 assert.equal(result.pathname,'/logo.png');
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
test('delegated file drops use the owning input and honor accept',async()=>{
 const inputs=new Map();
 const image=new File(['image'],'logo.png',{type:'image/png'});
 const text=new File(['text'],'notes.txt',{type:'text/plain'});
 const input=new EventTarget();input.multiple=true;input.accept='image/*';
 input.getAttribute=name=>name==='accept'?'image/*':name==='realtime'?'false':null;
 input.hasAttribute=()=>false;input.renderValue=()=>{};
 const functions=source.slice(source.indexOf('function acceptsFile('),source.indexOf('\nasync function getDirectoryHandles'));
 const fileEvent=vm.runInNewContext(`(()=>{${functions};return fileEvent})()`,{
  inputs,Files:new Map(),CustomEvent,console,
  readFile:async file=>{file.src='data:'+file.type;},getFileId:async file=>file.pathname
 });
 let prevented=false;
 await fileEvent({type:'drop',currentTarget:{},dataTransfer:{files:[image,text]},preventDefault(){prevented=true;}},input);
 assert.equal(inputs.get(input).size,1);
 assert.equal(inputs.get(input).values().next().value.name,'logo.png');
 assert.equal(prevented,false);
});
