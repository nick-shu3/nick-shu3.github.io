'use strict';
const assert=require('node:assert/strict');
const {Model,Walls,segmentDistance}=require('../docs/games/hachiyoke-line/game.js');
const stages=require('../docs/games/hachiyoke-line/stages.js'),stage=stages[0];
function simulate(m){for(let i=0;i<(m.stage.defendSeconds+1)*120&&m.phase==='defend';i++)m.step(1/120);return m.phase;}
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
assert.equal(stages.length,5);
function loop(m,target,r){const points=[];for(let i=0;i<=20;i++){const a=2*Math.PI*i/20;points.push([target.x+r*Math.cos(a),target.y+r*Math.sin(a)]);}stroke(m,points);}
for(const s of stages){
  assert.equal(s.drawSeconds,5);
  const game=new Model(s);game.attack();assert.equal(simulate(game),'lost','stage '+s.id+' loses without protection');
  game.reset();
  if(s.id===1)stroke(game,[[115,285],[245,285],[245,415],[115,415],[115,285]]);
  else for(const t of s.targets)loop(game,t,{2:42,3:38,4:38,5:36}[s.id]);
  if(s.maxLength!==undefined)assert(game.usedLength<=s.maxLength,'within ink budget');
  game.attack();
  assert.equal(simulate(game),'won','stage '+s.id+' has a playable winning route');
  assert.equal(game.bees.length,s.bees.count);
}
const budget=new Model(stages[1]);stroke(budget,[[20,200],[340,200]]);
assert.equal(budget.usedLength,290);assert.equal(budget.walls.segments.at(-1).b.x,310,'overlong stroke stops at ink limit');
stroke(budget,[[30,240],[100,240]]);assert.equal(budget.usedLength,290,'no more wall after ink is spent');
budget.attack();assert.equal(simulate(budget),'lost','short incomplete wall can be passed');
const twoSources=new Model(stages[2]);stroke(twoSources,[[8,220],[352,220]]);twoSources.attack();
assert.deepEqual([...new Set(twoSources.bees.map(b=>b.y===stages[2].nests[0].y?'top':'bottom'))].sort(),['bottom','top']);
assert.equal(simulate(twoSources),'lost','one horizontal wall does not stop bees from opposite nest');
console.log('PASS: five winnable stages, ink clipping, exhausted ink, multiple nests, and incomplete defenses.');
// Exercise the actual browser event handlers without substituting physics logic.
const vm=require('node:vm'),fs=require('node:fs');
for(const width of [280,428]){
 const elements={},listeners={},frames=[],saved={};let hidden=false;
 const context=new Proxy({}, {get:(o,k)=>o[k]||(o[k]=(...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k+' finite');}),set:(o,k,v)=>(o[k]=v,true)});
 for(const id of ['game','phase','timer','message','finish','retry','again','next','stage-title','stage-hint','ink-remaining','ink-fill','result','result-tag','result-title','result-detail'])elements[id]={textContent:'',hidden:false,disabled:false,style:{},events:{},addEventListener(k,fn){this.events[k]=fn;}};
 const buttons=stages.map(()=>({disabled:false,events:{},attrs:{},addEventListener(k,fn){this.events[k]=fn;},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}}));
 Object.assign(elements.game,{width:360,height:480,getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width,height:width*4/3}),setPointerCapture(){}});
 const document={getElementById:id=>elements[id],querySelectorAll:()=>buttons,get hidden(){return hidden;},hasFocus:()=>true,addEventListener:(k,fn)=>listeners[k]=fn};
 const sandbox={document,window:{devicePixelRatio:2,addEventListener:(k,fn)=>listeners[k]=fn},localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},HachiyokeStages:stages,requestAnimationFrame:fn=>frames.push(fn),console};
 vm.runInNewContext(fs.readFileSync('docs/games/hachiyoke-line/game.js','utf8'),sandbox);
 let now=1;function tick(){frames.shift()(now);now+=1000/60;}
 function pen(type,x,y){elements.game.events[type]({isPrimary:true,button:0,pointerId:1,clientX:x*width/360,clientY:y*width/360,preventDefault(){}});}
 tick();assert.equal(elements.phase.textContent,'線を描いて守ろう');
 pen('pointerdown',115,285);pen('pointermove',245,285);pen('pointermove',245,415);pen('pointermove',115,415);pen('pointermove',115,285);pen('pointerup',115,285);
 elements.finish.events.click();assert(elements.finish.disabled);
 hidden=true;listeners.visibilitychange();for(let i=0;i<120;i++)tick();assert.equal(elements.timer.textContent,'防衛 10.0秒');
 hidden=false;listeners.visibilitychange();for(let i=0;i<605;i++)tick();assert.equal(elements.result.hidden,false);assert.equal(elements['result-title'].textContent,'10秒、守りきった！');
 assert.equal(saved['hachiyoke-unlocked-v1'],'2');assert.equal(buttons[1].disabled,false);assert.equal(buttons[2].disabled,true);assert.equal(elements.next.hidden,false);
 buttons[2].events.click();assert.match(elements['stage-title'].textContent,/^1 · /,'locked stage cannot be entered');
 elements.again.events.click();assert.equal(elements.result.hidden,true);assert.equal(elements.finish.disabled,false);
 elements.finish.events.click();for(let i=0;i<400;i++)tick();assert.equal(elements['result-title'].textContent,'もうひと工夫！');
 elements.retry.events.click();buttons[1].events.click();assert.match(elements['stage-title'].textContent,/^2 · /);assert.equal(buttons[1].attrs['aria-current'],'step');
 assert.equal(elements['ink-remaining'].textContent,'線のこり 290');assert.equal(elements['ink-fill'].style.width,'100%');
 pen('pointerdown',20,200);pen('pointermove',340,200);pen('pointerup',340,200);tick();
 assert.equal(elements['ink-remaining'].textContent,'線のこり 0');assert.equal(elements['ink-fill'].style.width,'0%');
 buttons[0].events.click();assert.match(elements['stage-title'].textContent,/^1 · /);
}
console.log('PASS: narrow/wide pointer scaling, Canvas coordinates, finish, background pause, unlock, stage selection, win/loss overlay and retry. Real browser rendering is not covered.');
