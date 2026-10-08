'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('../docs/games/hero-again/expedition.js'),M=require('../docs/games/hero-again/motion.js'),V=require('../docs/games/hero-again/scenery.js');
for(const stage of [0,1,2,3,4,5,6]){
 const s=E.create();s.stage=stage;s.phase='walk';s.x=0;s.hp=60;s.stamina=100;s.saved.expedition.resist.cold=0;
 E.step(s,.1);const cold=stage>=3?E.zone(s).env[1]:0;
 assert(Math.abs(s.x-Math.min(E.enemies(s)[0].x,6.5*(1-.25*cold)))<1e-9,'consistent base movement in stage '+stage);
}
function ui(stage,reduced=false){
 const s=E.create();s.stage=stage;s.phase='fight';s.enemyHP=22;s.hp=60;s.timer=.001;s.x=E.enemies(s)[0].x;
 const text=[],handlers={},nodes={};let frame,hit=true;
 const ctx=new Proxy({fillText:(t,x,y)=>text.push({t,x,y,color:ctx.fillStyle})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const element=id=>nodes[id]||(nodes[id]={textContent:'',setAttribute:()=>{},getContext:()=>ctx,addEventListener:(name,fn)=>{handlers[id+':'+name]=fn;}});
 const engine={...E,create:()=>s,step:()=>{if(hit){s.enemyHP=0;s.hp=50;s.index++;s.phase='walk';hit=false;}}};
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:class{},window:{HeroAgain:engine,HeroMotion:M,HeroScenery:V,matchMedia:()=>({matches:reduced}),addEventListener:()=>{}},document:{hidden:false,getElementById:element,addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:f=>{frame=f;}});
 if(stage>=3)handlers['pause:click']();
 frame(100);text.length=0;frame(200);
 const damage=text.filter(q=>q.color==='#ff6868');
 assert(damage.some(q=>q.t==='−22'),'finishing damage survives enemy switch');assert(damage.some(q=>q.t==='−10'),'hero damage');
 assert(damage.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.y<200));
 const hero=damage.find(q=>q.t==='−10');assert.equal(hero.x,M.layout(stage).heroX,'return direction text remains readable');
 text.length=0;frame(300);const later=text.find(q=>q.t==='−10'&&q.color==='#ff6868');if(reduced)assert.equal(later.y,hero.y);else assert(later.y<hero.y);
 for(let i=4;i<15;i++)frame(i*100);text.length=0;frame(1600);assert(!text.some(q=>q.color==='#ff6868'),'labels expire');
}
ui(1);ui(2);ui(3,true);
console.log('PASS: unified movement base, cold effects, finishing hit/hero damage labels, return coordinates, reduced motion and expiry.');
