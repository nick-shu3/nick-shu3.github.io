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
