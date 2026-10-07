'use strict';
const assert=require('node:assert/strict'),E=require('../docs/games/hero-again/engine.js');
assert.deepEqual(E.clean({weapon:-1,armor:Infinity,best:2000,attempts:0,wins:'2'}),E.clean(null));
assert.equal(E.clean({weapon:12}).weapon,12);assert.equal(E.clean({weapon:13}).weapon,0);
const s=E.create();E.start(s);let died=false,won=false,retained=false;
for(let i=0;i<30000;i++){const before=s.phase,gear=s.saved.weapon+s.saved.armor;E.step(s,.1);if(s.phase==='fallen')died=true;if(before==='fallen'&&s.phase==='walk'){retained=s.saved.weapon+s.saved.armor===gear;assert.equal(s.level,1);assert.equal(s.hp,60);assert.equal(s.x,0);}if(s.phase==='won'){won=true;break;}}
assert(died,'fresh hero must fail at least once');assert(retained,'equipment survives death');assert(won,'repeated attempts must reach goal');assert.equal(s.x,E.GOAL);assert(s.saved.attempts>1);assert(s.saved.weapon<=12&&s.saved.armor<=12);assert.equal(s.saved.wins,1);
const snapshot=JSON.stringify(s);E.step(s,.1);assert.equal(JSON.stringify(s),snapshot,'terminal state stable');
const one=E.create({weapon:12,armor:12});E.start(one);one.x=100;E.step(one,.1);E.step(one,.1);E.step(one,.1);E.step(one,.1);E.step(one,.1);assert.equal(one.hp,60,'one-hit kill has no retaliation');
const bad=E.create();E.start(bad);const before=JSON.stringify(bad);E.step(bad,NaN);E.step(bad,-1);assert.equal(JSON.stringify(bad),before);
const fight=E.create();E.start(fight);fight.x=100;E.step(fight,.1);for(let i=0;i<4;i++)E.step(fight,.1);assert.equal(fight.hp,50);assert.equal(fight.enemyHP,14);
const M=require('../docs/games/hero-again/motion.js');
const enemy=E.ENEMIES[0];
assert.equal(M.enemyX({phase:'walk',x:0},enemy),830,'enemy enters from right edge');
assert(M.enemyX({phase:'walk',x:50},enemy)<M.enemyX({phase:'walk',x:0},enemy));
assert.equal(M.enemyX({phase:'walk',x:100},enemy),M.enemyX({phase:'fight',x:100},enemy),'no teleport at contact');
assert.equal(M.enemyX({phase:'walk',x:100},E.ENEMIES[1]),830,'next enemy also enters at right edge');
assert.equal(M.enemyX({phase:'fallen',x:100},enemy),245,'enemy stays at contact after death');
assert.notEqual(M.stride(.1),M.stride(.3));
const fs=require('node:fs'),vm=require('node:vm'),elements={},handlers={};let raf;
const ctx=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function el(id){return elements[id]||(elements[id]={textContent:'',disabled:false,setAttribute:()=>{},getContext:()=>ctx,addEventListener:(key,fn)=>{handlers[id+':'+key]=fn;}});}
const doc={hidden:false,getElementById:el,addEventListener:(key,fn)=>{handlers[key]=fn;}};
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{window:{HeroAgain:E,HeroMotion:M,addEventListener:()=>{}},document:doc,localStorage:{getItem:()=>'{bad json',setItem:()=>{}},requestAnimationFrame:fn=>{raf=fn;},console});
assert(elements['save-note'].textContent.includes('読み込めません'));handlers['start:click']();raf(100);raf(1100);const shown=elements.distance.textContent;
doc.hidden=true;handlers.visibilitychange();raf(100000);assert.equal(elements.distance.textContent,shown);assert.equal(elements.phase.textContent,'一時停止中');
doc.hidden=false;raf(200000);assert.equal(elements.distance.textContent,shown);handlers['pause:click']();raf(300000);assert.equal(elements.distance.textContent,shown,'resume must not catch up elapsed hidden time');raf(300100);assert.notEqual(elements.distance.textContent,shown);
console.log('PASS: bounded/corrupt saves, death/restart and retained equipment, level/HP reset, attainable goal, damage formula, one-hit kill, terminal state, background pause and explicit resume without catch-up.');

function playback(multiplier){
 const nodes={},events={};let frame,current;
 function node(id){return nodes[id]||(nodes[id]={textContent:'',disabled:false,setAttribute:(k,v)=>{nodes[id][k]=v;},getContext:()=>ctx,addEventListener:(k,fn)=>{events[id+':'+k]=fn;}});}
 const engine={...E,step:(state,dt)=>{current=state;E.step(state,dt);}};
 const document={hidden:false,getElementById:node,addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{window:{HeroAgain:engine,HeroMotion:M,addEventListener:()=>{}},document,localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>{frame=fn;}});
 events['speed-'+multiplier+':click']();assert.equal(nodes['speed-'+multiplier]['aria-pressed'],'true');
 events['start:click']();frame(100);
 for(let i=1;i<=4800/multiplier;i++)frame(100+i*1000/60);
 assert.equal(current.phase,'won','all speeds complete the course');
 const state=JSON.parse(JSON.stringify(current));
 events['pause:click']();return state;
}
const normal=playback(1);assert.deepEqual(playback(2),normal,'2x has identical damage, growth, gear and outcome');assert.deepEqual(playback(4),normal,'4x has identical damage, growth, gear and outcome');
handlers['speed-4:click']();handlers['pause:click']();const stopped=elements.distance.textContent;raf(400000);raf(400100);assert.equal(elements.distance.textContent,stopped,'4x also respects pause');
console.log('PASS: 1x/2x/4x equal simulated time produces identical complete state; 4x pause.');
