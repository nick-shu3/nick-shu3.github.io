'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('../docs/tools/im-juggler-grape/math.js');
const near=(a,b,t=1e-10)=>assert(Math.abs(a-b)<=t,`${a} != ${b}`);
near(M.direct(3000,510).denominator,3000/510);assert.equal(M.direct(100,0).denominator,null);
// Golden outputs from cached results in supplied S-I’m workbook. Workbook itself is not published.
for(const [n,b,r,d,off,on] of [[8987,36,32,250,6.500193286406334,6.60868845970481],[1277,4,0,-550,6.011298516827127,6.103970745298174],[404,0,1,0,3.4590740277160448,3.4895599535335724]]){near(M.reverse(n,b,r,d,false).denominator,off);near(M.reverse(n,b,r,d,true).denominator,on);}
for(const d of [-1000,1000])for(const on of [false,true])assert(M.reverse(5000,0,0,d,on).k>0);
for(const v of ['', ' ', 'NaN','Infinity','abc','1.2','1e3','0x10','1,000','-1','100001'])assert.throws(()=>M.integer(v,'G',1));
assert.equal(M.integer('-1200','差枚',-5000,5000),-1200);
for(const args of [[0,0],[100,101],[1,-1],[1,1.5],[NaN,2]])assert.throws(()=>M.direct(...args));
for(const args of [[100,99,2,0,false],[1000,0,0,-10000,false],[1000,0,0,100000,false],[0,0,0,0,false],[1000,-1,0,0,false],[1000,1.5,0,0,false],[1000,0,0,NaN,false],[1,1,0,0,false]])assert.throws(()=>M.reverse(...args));
const small=M.distribution(2,.5);near(small.mass[0],.25);near(small.mass[1],.5);near(small.mass[2],.25);
for(const n of [1,1000,3000,5000,8000,100000])for(const p of M.P){const d=M.distribution(n,p);let sum=0,mean=0,variance=0;for(let k=0;k<=n;k++){sum+=d.mass[k];mean+=k*d.mass[k];variance+=(k-n*p)**2*d.mass[k];}near(sum,1,1e-12);near(mean,n*p,1e-7);near(variance,n*p*(1-p),1e-6);assert.equal(d.cdf[n],1);}
let seed=42;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296;};
for(const p of M.P){const counts=M.simulate(M.distribution(3000,p),10000,rng);assert.equal(counts.reduce((a,b)=>a+b),10000);const mean=counts.reduce((sum,c,k)=>sum+c*k,0)/10000;assert(Math.abs(mean-3000*p)<1);}
near(M.tails(1,1)[0],M.P[0]);near(M.tails(1,0)[1],1-M.P[1]);near(M.tails(1,.5)[0],M.P[0]);near(M.tails(1,.5)[1],1-M.P[1]);
for(const k of [0,1,510,3000])for(const v of M.tails(3000,k))assert(Number.isFinite(v)&&v>=0&&v<=1);
const dir='docs/tools/im-juggler-grape/';for(const file of ['index.html','script.js','math.js','style.css']){const s=fs.readFileSync(dir+file,'utf8');assert(!/data:image|fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|innerHTML\s*=|eval\s*\(/.test(s));}
const html=fs.readFileSync(dir+'index.html','utf8');assert(html.includes("connect-src 'none'"));assert(html.includes('inputmode="numeric"'));assert(!/設定6確定|設定6濃厚|設定6期待度/.test(html));
console.log('PASS: grape golden values, Cherry ON/OFF, zero bonuses, signed delta, invalid inputs, exact moments/tails, 10,000 samples, static security.');
// UI event and Canvas command checks without a browser. Actual Safari layout remains manual QA.
const vm=require('node:vm');
for(const width of [280,340,760]){
 const texts=[];class Element{constructor(){this.value='';this.hidden=false;this.checked=false;this.disabled=false;this.textContent='';this.events={};this.children=[];}addEventListener(t,f){this.events[t]=f;}setAttribute(k,v){this[k]=v;}append(...a){this.children.push(...a);}replaceChildren(...a){this.children=a;}getBoundingClientRect(){return{width,height:270};}getContext(){return context;}}
 const context={scale(){},beginPath(){},moveTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y));},lineTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y));},stroke(){},fill(){},closePath(){},setLineDash(){},fillText(t,x,y){assert(Number.isFinite(x)&&Number.isFinite(y));texts.push(t);},measureText(t){return{width:t.length*6};}};
 const els={};for(const match of html.matchAll(/id="([^"]+)"/g))els[match[1]]=new Element();
 els['sim-preset'].value='3000';els.trials.value='10000';els.cherry.checked=true;
 const doc={getElementById(id){assert(els[id],id);return els[id];},createElement(){return new Element();}};
 const win={GrapeMath:M,devicePixelRatio:2,addEventListener(){}};
 vm.runInNewContext(fs.readFileSync(dir+'script.js','utf8'),{window:win,document:doc,setTimeout:f=>f(),console});
 const click=id=>els[id].events.click();
 assert(els['sim-status'].textContent.includes('10,000'));
 els.games.value='3000';els.grapes.value='510';click('calculate');assert(els.result.children.some(e=>e.textContent==='1/5.88'));assert(texts.some(t=>t.includes('あなた 1/5.88')));
 click('mode-reverse');els.games.value='5000';els.big.value='20';els.reg.value='18';els.delta.value='1200';click('calculate');assert.equal(els['input-error'].textContent,'');assert(!els['bonus-results'].hidden);assert(texts.some(t=>t.includes('推定')));
 click('delta-sign');click('calculate');assert.equal(els['input-error'].textContent,'');
 els.delta.value='abc';click('calculate');assert(els['input-error'].textContent);assert(els['use-games'].disabled);
 els['sim-preset'].value='custom';els['sim-custom'].value='1';click('run');assert(els['sim-status'].textContent.includes('1G'));
 click('mode-direct');els.games.value='1000';els.grapes.value='0';click('calculate');assert(els['marker-note'].textContent.includes('0回'));
 els.grapes.value='1001';click('calculate');assert(els['input-error'].textContent);
 assert(!texts.some(t=>/NaN|Infinity/.test(t)));
}
console.log('PASS: DOM events, Canvas finite coordinates at narrow/wide sizes, modes, markers, error recovery. Browser rendering not covered.');
