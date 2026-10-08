'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),L=require('../docs/games/hero-again/landscapes.js'),E=require('../docs/games/hero-again/expedition.js'),M=require('../docs/games/hero-again/motion.js'),V=require('../docs/games/hero-again/scenery.js');
const assets={};
for(const file of ['underworld','sky','archive']){
 const b=fs.readFileSync('docs/games/hero-again/assets/landscape-'+file+'.webp');assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');assert(b.length<500000,'mobile asset bound');
 assets[file]={ready:true,image:{naturalWidth:1536,naturalHeight:1024}};
}
let calls=0;const ctx={drawImage:(im,sx,sy,sw,sh)=>{calls++;assert(sx>=0&&sy>=0&&sw>0&&sh>0&&sx+sw<=im.naturalWidth&&sy+sh<=im.naturalHeight);}};
for(const z of E.ZONES_EXTRA){
 assert(L.scene(z.stage,z.rank,false));
 for(const p of [0,.01,.5,1,NaN,-1,2])assert(L.draw(ctx,assets,z.stage,z.rank,p,false));
}
assert.equal(calls,17*7);assert.deepEqual(L.scene(6,34,true),{file:'sky',cell:5});assert.equal(L.scene(2,17,false),null);assert.equal(L.scene(3,34,false),null);
const left=L.crop('sky',4,1536,1024,0,true),right=L.crop('sky',4,1536,1024,1,true);assert(left.sx>right.sx,'return reverses pan');
assets.underworld.ready=false;assert.equal(L.draw(ctx,assets,3,18,.5,false),false,'failed asset uses original landscape');
assert.equal(L.crop('sky',99,1536,1024,0,false),null);assert.equal(L.crop('sky',0,NaN,1024,0,false),null);
// Actual renderer uses the new local art through its loader in every environment.
for(const z of E.ZONES_EXTRA){
 const s=E.create();s.stage=z.stage;s.index=E.enemies(s).findIndex(e=>e.rank===z.rank);s.x=z.begin+(z.end-z.begin)*.5;s.phase='walk';
 const nodes={},paths=[];let frame;
 const c=new Proxy({drawImage:im=>paths.push(im.path)},{get:(o,k)=>o[k]||((...a)=>{for(const v of a)if(typeof v==='number')assert(Number.isFinite(v));}),set:(o,k,v)=>(o[k]=v,true)});
 class Img{constructor(){this.naturalWidth=1536;this.naturalHeight=1024;}set src(p){this.path=p;if(p.includes('landscape-')&&this.onload)this.onload();}}
 const root={HeroAgain:{...E,create:()=>s,step:()=>{}},HeroMotion:M,HeroScenery:V,addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/landscapes.js','utf8'),{window:root,Image:Img});
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{window:root,Image:Img,document:{hidden:false,getElementById:id=>nodes[id]||(nodes[id]={textContent:'',setAttribute:()=>{},getContext:()=>c,addEventListener:()=>{}}),addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:f=>{frame=f;}});
 frame(100);assert(paths.includes('assets/landscape-'+L.scene(z.stage,z.rank,false).file+'.webp'));
}
console.log('PASS: 17 section mappings, bounded local atlas crops, return pan, failure fallback, ending landscape and actual game drawing.');
