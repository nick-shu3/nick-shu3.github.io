'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),B=require('../docs/games/hero-again/bosses.js');
const C=require('../docs/games/hero-again/campaign.js'),E=require('../docs/games/hero-again/expedition.js');
const matched=new Set();
for(const stage of [0,1,2,3,4,5,6]){
 const engine=stage<3?C:E,s=engine.create();s.stage=stage;
 for(const enemy of engine.enemies(s))if(B.design(enemy))matched.add(enemy.name);
}
assert.deepEqual([...matched].sort(),Object.keys(B.DESIGNS).sort(),'all four designs match actual campaign/expedition bosses');
assert.equal(B.design({name:'魔王',boss:false}),null);
assert.equal(B.design({name:'toString',boss:true}),null);
assert.equal(B.design({name:'氷牙の王',boss:true}),null,'other bosses keep their original visuals');
let calls=0;const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'? (...args)=>{calls++;for(const n of args.slice(1))assert(Number.isFinite(n));}: (...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),key);},set:()=>true});
for(const [name,item] of Object.entries(B.DESIGNS)){
 const bytes=fs.readFileSync('docs/games/hero-again/assets/boss-'+item.file+'.webp');
 assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 assert(bytes.length<100000,'bounded mobile asset');
 const image={naturalWidth:480,naturalHeight:600},images={[item.file]:{image,ready:true}},enemy={name,boss:true};
 for(const time of [0,.05,.28,.65,2,100])for(const reduced of [false,true])assert(B.draw(ctx,images,enemy,245,time,time,.14,reduced));
 images[item.file].ready=false;assert.equal(B.draw(ctx,images,enemy,245,0,0,0,false),false,'failed/unfinished asset falls back to existing drawing');
 const frozen=B.pose(item.kind,0,5,.14,true);assert.deepEqual(frozen,B.pose(item.kind,20,100,0,true),'reduced motion is static');
 const ready=B.pose(item.kind,1,0,0,false),attack=B.pose(item.kind,1,0,.14,false);assert(attack.dx<ready.dx,'counterattack moves toward the hero');
}
assert(calls>0);
const source=fs.readFileSync('docs/games/hero-again/index.html','utf8');assert(source.indexOf('bosses.js')<source.indexOf('game.js'),'boss module loads first');
console.log('PASS: four real boss mappings, bounded assets, entry/counterattack poses, reduced motion, finite Canvas rendering and asset failure fallback.');
// Real game rendering must retain encounter identity across combat log events.
const vm=require('node:vm'),M=require('../docs/games/hero-again/motion.js'),V=require('../docs/games/hero-again/scenery.js');
const state=E.create();state.stage=1;state.index=E.enemies(state).length-1;state.phase='fight';state.x=E.enemies(state)[state.index].x;state.enemyHP=E.enemies(state)[state.index].hp;
const seen=[],elements={};let nextFrame;
class TestImage{constructor(){this.naturalWidth=360;this.naturalHeight=420;}set src(path){this.path=path;if(path.includes('boss-')&&this.onload)this.onload();}}
const context=new Proxy({translate:(...args)=>seen.push(args),drawImage:()=>{}},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function element(id){return elements[id]||(elements[id]={textContent:'',setAttribute:()=>{},getContext:()=>context,addEventListener:()=>{}});}
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/bosses.js','utf8'),{window:elements,Image:TestImage});
const draws=[],bosses={...elements.HeroBosses,draw:(...args)=>{draws.push({age:args[4],attack:args[6]});return elements.HeroBosses.draw(...args);}};
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{window:{HeroAgain:{...E,create:()=>state,step:()=>{}},HeroBosses:bosses,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:{hidden:false,getElementById:element,addEventListener:()=>{}},Image:TestImage,localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>{nextFrame=fn;}});
nextFrame(100);for(let i=1;i<=8;i++)nextFrame(100+i*100);
draws.length=0;state.serial++;state.hp--;state.flash=.18;nextFrame(1000);nextFrame(1100);
assert(draws.some(p=>p.age>.65&&p.attack>0),'combat event triggers counterattack instead of restarting entry');
console.log('PASS: real battle log updates preserve boss entry and trigger counterattack.');

// The sprite's transformed corners must clear the top HUD (bottom edge 64),
// even during entry/attack and on the highest visible stair approach.
for(const ground of [210,218,257,266,286])for(const [name,item] of Object.entries(B.DESIGNS)){
 const image={naturalWidth:480,naturalHeight:600};
 for(const age of [0,.1,.65,2])for(const attack of [0,.07,.14,.28]){
  const p=B.pose(item.kind,age,1,attack,false);let top=Infinity;
  const ctx=new Proxy({drawImage:(im,sx,sy,sw,sh,x,y,w,h)=>{
   for(const cx of [x,x+w])for(const cy of [y,y+h])top=Math.min(top,ground+p.dy+p.scale*(cx*Math.sin(p.angle)+cy*Math.cos(p.angle)));
  }},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  B.draw(ctx,{[item.file]:{image,ready:true}},{name,boss:true},300,age,1,attack,false,Math.min(174,(ground-82)/1.03-8));
  assert(top>=74,'entry/attack sprite clears HUD by at least 10px: '+name);
 }
}
console.log('PASS: enlarged boss entry and attack corners clear the top HUD on flat ground and stair approaches.');
