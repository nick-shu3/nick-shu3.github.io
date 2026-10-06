'use strict';
const assert=require('node:assert/strict');
const {Model,Walls,segmentDistance}=require('../docs/games/hachiyoke-line/game.js');
const stage=require('../docs/games/hachiyoke-line/stages.js')[0];
function simulate(m){for(let i=0;i<1300&&m.phase==='defend';i++)m.step(1/120);return m.phase;}
function stroke(m,points){points.forEach((p,i)=>m.pen({x:p[0],y:p[1]},i===0));m.endPen();}
assert.equal(segmentDistance({x:0,y:0},{x:100,y:100},{x:0,y:100},{x:100,y:0}),0);
const walls=new Walls(7);walls.add({x:30,y:0},{x:30,y:100});assert(!walls.clear({x:0,y:40},{x:100,y:40},8));assert(!walls.clear({x:40,y:50},{x:40,y:50},8));assert(walls.clear({x:45,y:50},{x:45,y:70},8));
let m=new Model(stage);assert.equal(m.phase,'ready');assert(!m.pen(stage.targets[0],true));assert.equal(m.phase,'ready');assert(!m.pen(stage.nest,true));
stroke(m,[[120,350],[240,350]]);assert.equal(m.walls.segments.length,1,'cannot draw through target');
m.reset();m.attack();assert.equal(m.bees.length,4);assert.equal(simulate(m),'lost','unprotected target loses');
m.reset();stroke(m,[[115,285],[245,285],[245,415],[115,415],[115,285]]);m.step(5);assert.equal(m.phase,'defend');assert.equal(simulate(m),'won','closed shelter wins');
for(const b of m.bees)assert(m.walls.clear(b,b,b.radius));
const frozen=m.bees.map(b=>[b.x,b.y]);m.step(10);assert.deepEqual(m.bees.map(b=>[b.x,b.y]),frozen);
m.reset();assert.equal(m.walls.segments.length,0);assert.equal(m.bees.length,0);assert.equal(m.elapsed,0);
stroke(m,[[100,230],[260,230]]);m.attack();assert.equal(simulate(m),'lost','bees route around finite wall');
m.reset();stroke(m,[[115,285],[150,285]]);stroke(m,[[210,285],[245,285],[245,415],[115,415],[115,285]]);m.attack();assert.equal(simulate(m),'lost','open gap allows entry');
m.reset();stroke(m,[[115,285],[177,285]]);stroke(m,[[183,285],[245,285],[245,415],[115,415],[115,285]]);m.attack();assert.equal(simulate(m),'won','gap smaller than bee stays blocked');
m.reset();m.pen({x:30,y:100},true);m.endPen();m.pen({x:300,y:200},true);assert.equal(m.walls.segments.length,2,'separate strokes do not bridge');
m.attack();const count=m.walls.segments.length;assert(!m.pen({x:10,y:10},true));assert.equal(m.walls.segments.length,count);
m.reset();m.step(NaN);assert.equal(m.phase,'ready');
console.log('PASS: no-wall loss, closed-loop win, detour, open/narrow gaps, swept collision, exclusions, separate strokes, draw timer, reset and terminal state.');
// Exercise the actual browser event handlers without substituting physics logic.
const vm=require('node:vm'),fs=require('node:fs');
for(const width of [280,428]){
 const elements={},listeners={},frames=[];let hidden=false;
 const context=new Proxy({}, {get:(o,k)=>o[k]||(o[k]=(...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k+' finite');}),set:(o,k,v)=>(o[k]=v,true)});
 for(const id of ['game','phase','timer','message','finish','retry','again','result','result-tag','result-title','result-detail'])elements[id]={textContent:'',hidden:false,disabled:false,events:{},addEventListener(k,fn){this.events[k]=fn;}};
 Object.assign(elements.game,{width:360,height:480,getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width,height:width*4/3}),setPointerCapture(){}});
 const document={getElementById:id=>elements[id],get hidden(){return hidden;},hasFocus:()=>true,addEventListener:(k,fn)=>listeners[k]=fn};
 const sandbox={document,window:{devicePixelRatio:2,addEventListener:(k,fn)=>listeners[k]=fn},HachiyokeStages:[stage],requestAnimationFrame:fn=>frames.push(fn),console};
 vm.runInNewContext(fs.readFileSync('docs/games/hachiyoke-line/game.js','utf8'),sandbox);
 let now=1;function tick(){frames.shift()(now);now+=1000/60;}
 function pen(type,x,y){elements.game.events[type]({isPrimary:true,button:0,pointerId:1,clientX:x*width/360,clientY:y*width/360,preventDefault(){}});}
 tick();assert.equal(elements.phase.textContent,'線を描いて守ろう');
 pen('pointerdown',115,285);pen('pointermove',245,285);pen('pointermove',245,415);pen('pointermove',115,415);pen('pointermove',115,285);pen('pointerup',115,285);
 elements.finish.events.click();assert(elements.finish.disabled);
 hidden=true;listeners.visibilitychange();for(let i=0;i<120;i++)tick();assert.equal(elements.timer.textContent,'防衛 10.0秒');
 hidden=false;listeners.visibilitychange();for(let i=0;i<605;i++)tick();assert.equal(elements.result.hidden,false);assert.equal(elements['result-title'].textContent,'10秒、守りきった！');
 elements.again.events.click();assert.equal(elements.result.hidden,true);assert.equal(elements.finish.disabled,false);
 elements.finish.events.click();for(let i=0;i<400;i++)tick();assert.equal(elements['result-title'].textContent,'もうひと工夫！');
}
console.log('PASS: narrow/wide pointer scaling, Canvas coordinates, finish, background pause, win/loss overlay and retry. Real browser rendering is not covered.');
