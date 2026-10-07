'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const acorn=require('acorn');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).filter(e=>!['.git','node_modules'].includes(e.name)).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const htmlSinks=new Set(['innerHTML','outerHTML','insertAdjacentHTML','write','writeln','srcdoc']);
const externalAPIs=new Set(['fetch','XMLHttpRequest','WebSocket','EventSource','sendBeacon','RTCPeerConnection','Worker','SharedWorker','importScripts','postMessage','serviceWorker']);
const dynamicCode=new Set(['eval','Function']);
function memberName(n){
 if(!n||n.type!=='MemberExpression')return null;
 if(!n.computed&&n.property.type==='Identifier')return n.property.name;
 if(n.computed&&n.property.type==='Literal'&&typeof n.property.value==='string')return n.property.value;
 if(n.computed&&n.property.type==='TemplateLiteral'&&!n.property.expressions.length)return n.property.quasis[0].value.cooked;
 return null;
}
function inspectJavaScript(file,source){
 const errors=[];let ast;
 try{ast=acorn.parse(source,{ecmaVersion:'latest',sourceType:'script',allowHashBang:true});}
 catch(e){return [file+': invalid JavaScript: '+e.message];}
 function visit(n){
  if(!n||typeof n!=='object')return;
  if(n.type==='MemberExpression'){
   const name=memberName(n);
   if(htmlSinks.has(name))errors.push(file+': HTML string sink: '+name);
   if(externalAPIs.has(name))errors.push(file+': network/worker API needs review: '+name);
   if(dynamicCode.has(name))errors.push(file+': dynamic code execution: '+name);
  }
  if(n.type==='Identifier'&&dynamicCode.has(n.name))errors.push(file+': dynamic code execution: '+n.name);
  if((n.type==='CallExpression'||n.type==='NewExpression')&&n.callee.type==='Identifier'&&externalAPIs.has(n.callee.name))errors.push(file+': network/worker API needs review: '+n.callee.name);
  if(n.type==='ImportExpression')errors.push(file+': dynamic import needs review');
  if(n.type==='CallExpression'&&['setTimeout','setInterval'].includes(n.callee.name)&&n.arguments[0]&&(['Literal','TemplateLiteral'].includes(n.arguments[0].type)))errors.push(file+': string timer');
  for(const [key,value] of Object.entries(n))if(key!=='start'&&key!=='end'){
   if(Array.isArray(value)){for(const child of value)if(child&&typeof child.type==='string')visit(child);}
   else if(value&&typeof value.type==='string')visit(value);
  }
 }
 visit(ast);
 return errors;
}
function inspect(file,s){
 const errors=[],bad=(test,msg)=>{if(test)errors.push(file+': '+msg);};
 if(/\.html$/i.test(file)){
  const csp=s.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
  const directives=csp?csp[1].split(';').map(v=>v.trim()):[];
  for(const d of ["default-src 'none'","script-src 'self'","connect-src 'none'","object-src 'none'","base-uri 'self'","form-action 'none'"])bad(!directives.includes(d),'required CSP: '+d);
  bad(/unsafe-eval|script-src[^;]*unsafe-inline/i.test(csp?.[1]||''),'unsafe script policy');
  bad(/\son\w+\s*=/i.test(s),'inline event handler');
  bad(/<(?:iframe|object|embed|form)\b/i.test(s),'embedded/submit content needs security review');
  bad(!/<html\b[^>]*class="[^"]*\bstandalone-pending\b/.test(s),'missing fail-closed frame class');
  const scripts=[...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  bad(!scripts.length||!scripts[0][1].includes('security/standalone.js'),'frame guard must precede application scripts');
  for(const x of scripts){const src=x[1].match(/\bsrc="([^"]+)"/);bad(!src||/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src[1])||!!x[2].trim(),'scripts must be external local files');}
  bad(!/<link\b[^>]*href="[^"]*security\/standalone\.css/.test(s),'missing frame-guard stylesheet');
  for(const tag of s.matchAll(/<(?:script|link|img|source|video|audio)\b[^>]*>/gi)){
   for(const a of tag[0].matchAll(/\b(?:src|href|srcset)\s*=\s*["']([^"']+)["']/gi))bad(/(?:https?:|data:|\/\/)/i.test(a[1]),'remote/embedded asset needs review');
  }
  bad(/\b(?:href|src)\s*=\s*["']\s*(?:javascript|data|vbscript):/i.test(s),'executable URL');
 }
 if(/\.(?:html|svg)$/i.test(file)){
  // These file types have no inline scripts; retain a conservative source check.
  for(const [re,msg] of [
   [/\b(?:eval|Function)\s*\(/,'dynamic code execution'],
   [/\b(?:innerHTML|outerHTML|insertAdjacentHTML|write|writeln)\s*(?:[+]?=|\()/,'HTML string sink'],
   [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|RTCPeerConnection|Worker|SharedWorker|importScripts)\s*\(/,'network/worker API needs review'],
   [/\b(?:postMessage|import)\s*\(/,'message/dynamic import needs review'],
   [/\bset(?:Timeout|Interval)\s*\(\s*['"`]/,'string timer'],
   [/\bserviceWorker\s*\./,'service worker needs review']
 ])bad(re.test(s),msg);
 }
 if(/\.(?:js|mjs)$/i.test(file))errors.push(...inspectJavaScript(file,s));
 if(/\.css$/i.test(file))bad(/@import|url\(\s*['"]?(?:https?:|data:|\/\/)/i.test(s),'remote/embedded CSS resource');
 if(/\.svg$/i.test(file))bad(/<script\b|\son\w+\s*=|<foreignObject\b/i.test(s),'active SVG');
 return errors;
}
function audit(root='.'){
 const files=walk(root).map(f=>path.relative(root,f));
 const errors=files.filter(f=>/\.(?:html|js|mjs|css|svg)$/i.test(f)).flatMap(f=>inspect(f,fs.readFileSync(path.join(root,f),'utf8')));
 assert.deepEqual(errors,[]);
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
 for(const marker of ['pull_request:','persist-credentials: false','fetch-depth: 0','contents: read','bash scripts/scan-secrets.sh','npm ci --ignore-scripts --no-audit --no-fund','node tests/security.cjs','node tests/security-regression.cjs'])assert(workflow.includes(marker),marker);
 assert(/actions\/checkout@[a-f0-9]{40}/.test(workflow));
 assert(!/pull_request_target|continue-on-error:\s*true|contents:\s*write/.test(workflow));
 console.log('PASS: all published pages/scripts/styles/SVG discovered; CSP, sinks, network and frame guards checked.');
}
if(require.main===module)audit();
module.exports={inspect,audit,walk};
