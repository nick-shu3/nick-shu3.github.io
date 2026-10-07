'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {inspect,walk}=require('./security.cjs');
const html=fs.readFileSync('docs/index.html','utf8');
assert.deepEqual(inspect('new-tool/index.html',html),[]);
assert(inspect('new-tool/index.html',html.replace("connect-src 'none'","connect-src *")).length);
assert(inspect('new-tool/index.html',html.replace('class="standalone-pending"','')).length);
assert(inspect('new-tool/index.html',html+'<script>alert(1)</script>').length);
assert(inspect('new-tool/index.html',html+'<img src="https://example.invalid/pixel">').length);
for(const code of ['eval(input)','new Function(input)','element.innerHTML = input','fetch(url)','navigator.sendBeacon(url)','window.postMessage(data)','setTimeout("bad()", 1)'])assert(inspect('new-tool/script.js',code).length,code);
for(const code of ["element['innerHTML'] = input", "const send = window['fetch']; send(url)", 'eval/* review */(input)', "element[`insertAdjacentHTML`]('beforeend', input)", "const f = eval; f(input)", 'import("./remote.js")'])assert(inspect('new-tool/script.js',code).length,code);
assert.deepEqual(inspect('new-tool/script.js','element.textContent = input;'),[]);
assert.deepEqual(inspect('new-tool/script.js','const text = "eval(input)"; // fetch(url)'),[]);
assert(inspect('new-tool/script.js','const = ;').length);
assert(inspect('new-tool/style.css','@import "https://example.invalid/x.css"').length);
assert(inspect('new-tool/logo.svg','<svg onload="bad()"></svg>').length);
// Exercise the real frame guard in top-level, framed, and denied-access contexts.
const code=fs.readFileSync('docs/security/standalone.js','utf8');
for(const mode of ['top','frame','denied']){
 let hidden=true;const win={self:{}};
 if(mode==='denied')Object.defineProperty(win,'top',{get(){throw Error('denied');}});else win.top=mode==='top'?win.self:{};
 vm.runInNewContext(code,{window:win,document:{documentElement:{classList:{remove(c){assert.equal(c,'standalone-pending');hidden=false;}}}}});
 assert.equal(hidden,mode!=='top');
}
const css=fs.readFileSync('docs/security/standalone.css','utf8');
assert(/html\.standalone-pending body\s*\{\s*visibility:\s*hidden\s*!important/.test(css));
// New nested pages must be discovered without adding them to a manual list.
const os=require('node:os'),path=require('node:path');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'security-discovery-'));
try{fs.mkdirSync(path.join(dir,'new','deep'),{recursive:true});fs.writeFileSync(path.join(dir,'new','deep','index.html'),'');assert.equal(walk(dir).length,1);}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log('PASS: unsafe-source rejection, nested discovery, top-level access and fail-closed frame behavior.');
