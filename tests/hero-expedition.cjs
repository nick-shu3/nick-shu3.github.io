'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../docs/games/hero-again/expedition.js'),B=require('../docs/games/hero-again/campaign.js'),M=require('../docs/games/hero-again/motion.js'),V=require('../docs/games/hero-again/scenery.js');
// Legacy engine outcomes, equipment, resets and events remain identical.
const a=E.create(null,()=>1),b=B.create(null,()=>1);E.play(a);B.play(b);
for(let i=0;i<30000&&b.phase!=='won';i++){
 E.step(a,.1);B.step(b,.1);
 for(const k of ['x','index','phase','level','hp','enemyHP','event'])assert.equal(a[k],b[k]);
 for(const k of ['weapon','armor','wins','best','attempts'])assert.equal(a.saved[k],b.saved[k]);
}
assert.equal(a.phase,'won');assert.equal(E.unlocked(a),1);assert.equal(E.select(a,3),false);
const legacy={wins:1,stageWins:[1,1,1],weapon:12,armor:12,weapons:Array(18).fill(15),armors:Array(18).fill(15),rareWeapons:Array(18).fill(true),rareArmors:Array(18).fill(true),selected:2};
const s=E.create(legacy,()=>1);assert.deepEqual(s.saved.weapons,legacy.weapons);assert.equal(s.saved.expedition.historical,true);s.phase='won';E.play(s);assert.equal(s.stage,3);assert.equal(s.phase,'falling');assert(s.event.includes('めでたし'));
assert.equal(E.result(s),null,'future distances unrevealed');
for(let i=0;i<21;i++)E.step(s,.1);const partial=JSON.parse(JSON.stringify(s.saved));const restored=E.create(partial,()=>1);assert.equal(restored.phase,'falling');assert.equal(restored.timer,s.timer);assert.equal(restored.saved.expedition.fall,s.saved.expedition.fall);
for(let i=0;i<31;i++)E.step(s,.1);assert.equal(s.saved.expedition.fall,6351000);assert.equal(s.phase,'walk');
let frame,live=s;const nodes={},events={},written=[];
const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
class Img{set src(v){this.path=v;} }
function node(id){return nodes[id]||(nodes[id]={textContent:'',disabled:false,hidden:false,setAttribute:(k,v)=>{nodes[id][k]=v;},getContext:()=>ctx,addEventListener:(k,fn)=>{events[id+':'+k]=fn;}});}
const doc={hidden:false,getElementById:node,addEventListener:(k,f)=>{events[k]=f;}};
const api={...E,create:()=>live};
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:Img,window:{HeroAgain:api,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:doc,localStorage:{getItem:()=>null,setItem:(k,v)=>written.push(v)},requestAnimationFrame:f=>{frame=f;}});
assert.equal(nodes.phase.textContent,'一時停止中','restored expansion requires explicit resume');
for(const id of ['distance','best','stage-guide','zone','boss-distance'])assert(!/\d/.test(nodes[id].textContent),'no positional digits in '+id);
assert(nodes.progress.hidden);assert.equal(nodes.progress.value,0);assert(nodes['ending-panel'].hidden);
events['pause:click']();frame(100);frame(200);assert.equal(s.saved.expedition.time,.1,'real activity time independent of speed');
const firstMove=s.x;E.stop(s);assert.equal(s.phase,'ready');E.play(s);assert.equal(s.x,firstMove,'manual stop resumes exact position');doc.hidden=true;events.visibilitychange();frame(10000);assert.equal(s.x,firstMove);doc.hidden=false;events['pause:click']();frame(20000);assert.equal(s.x,firstMove,'no offline catch-up');
// Complete every new route without random drops. Validate death retention and safe reloads mid-fight.
for(const stage of [3,4,5,6]){
 assert.equal(s.stage,stage);let deaths=0,reloaded=false;const startDeaths=s.saved.expedition.deaths;
 for(let i=0;i<500000&&s.phase!=='won';i++){
  const phase=s.phase,gear=JSON.stringify([s.saved.expedition.weapons,s.saved.expedition.armors,s.saved.expedition.resist]);E.step(s,.1);
  assert(Number.isFinite(s.hp)&&s.hp>=0);assert(s.stamina>=0&&s.stamina<=100);
  if(phase==='fight'&&s.phase==='fallen'){deaths++;assert.equal(JSON.stringify([s.saved.expedition.weapons,s.saved.expedition.armors,s.saved.expedition.resist]),gear);}
  if(s.phase==='fight'&&s.enemyHP>0&&!reloaded){
   E.checkpoint(s);const r=E.create(JSON.parse(JSON.stringify(s.saved)),()=>1);
   for(const k of ['stage','phase','x','index','hp','enemyHP','timer','level','stamina'])assert.equal(r[k],s[k],'mid-fight reload '+k);
   E.step(r,.1);const clone=E.create(JSON.parse(JSON.stringify(s.saved)),()=>1);E.step(clone,.1);assert.deepEqual(r.saved,clone.saved);reloaded=true;
  }
 }
 assert.equal(s.phase,'won','no-drop route '+stage+' attainable');assert(reloaded);assert(s.saved.expedition.deaths-startDeaths<=(stage===3?25:stage===6?12:16),'finite retry budget');
 assert.equal(s.saved.expedition.route[stage-3],E.goal(s),'recorded route displacement');
 if(stage<5)assert.equal(E.result(s),null);if(stage===5){assert(E.result(s).normalClear);assert.equal(E.result(s).trueClear,false);}
 // Production UI: each environment, boss and ending is rendered, with finite coordinates.
 for(const z of E.ZONES_EXTRA.filter(z=>z.stage===stage)){
  const i=E.enemies(s).findIndex(n=>n.rank===z.rank&&n.boss),n=E.enemies(s)[i];
  const copy=Object.assign({},s,{saved:E.clean(JSON.parse(JSON.stringify(s.saved))),index:i,x:n.x,phase:'fight',enemyHP:n.hp,timer:5,flash:0});live=copy;
  const localNodes={};let drawFrame;const finiteCtx=new Proxy({},{get:()=> (...args)=>{for(const v of args)if(typeof v==='number')assert(Number.isFinite(v),'finite expansion canvas');},set:()=>true});
  const localDoc={hidden:false,getElementById:id=>localNodes[id]||(localNodes[id]={textContent:'',setAttribute:()=>{},getContext:()=>finiteCtx,addEventListener:()=>{}}),addEventListener:()=>{}};
  vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:Img,window:{HeroAgain:{...E,create:()=>copy},HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:localDoc,localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:f=>{drawFrame=f;}});drawFrame(100);
  assert(localNodes.progress.hidden);assert(!/\d/.test(localNodes['boss-distance'].textContent));
 }
 console.log('PASS: expansion stage '+stage+' no random drops, '+(s.saved.expedition.deaths-startDeaths)+' deaths; environment/boss rendering and reload.');
 if(stage<6)E.play(s);
}
const result=E.result(s);assert(result.trueClear);assert.equal(result.ascent,6381000);assert.equal(result.descent,30000);assert.equal(result.fall,6351000);assert.equal(result.total,12847490);assert.equal(result.totalRecorded,result.walkRecorded+result.fall);assert(result.walkRecorded>result.ascent+result.descent,'retries counted separately from route');
const clean=E.clean(JSON.parse(JSON.stringify(s.saved)));assert.deepEqual(clean,s.saved);assert(JSON.stringify(clean).length<32768);
const toxic=E.clean({wins:1,stageWins:[1,1,1],expedition:{selected:Infinity,weapons:Array(10000).fill(Infinity),resist:{heat:99},snapshot:{stage:3,phase:'fight',x:NaN,index:999999},time:-1,walk:Infinity}});assert.equal(toxic.expedition.snapshot,null);assert.equal(toxic.expedition.time,0);assert.equal(toxic.expedition.walk,0);assert(toxic.expedition.weapons.every(v=>v===-1));assert.equal(toxic.expedition.resist.heat,0);
const forged=E.clean({...legacy,expedition:{selected:3,checkpoints:[5,9,15,16]}});assert.equal(forged.expedition.checkpoints[0],0,'unearned checkpoint rejected');
const env=E.create(legacy,()=>1);env.stage=3;E.start(env);for(let i=0;i<51;i++)E.step(env,.1);const weakDefense=E.stats(env).defense;env.saved.expedition.resist.pressure=4;assert(E.stats(env).defense>weakDefense,'pressure equipment affects defense');env.saved.expedition.resist.heat=0;const hp=env.hp;E.step(env,.1);const rawLoss=hp-env.hp;env.saved.expedition.resist.heat=4;const hp2=env.hp;E.step(env,.1);assert(hp2-env.hp<rawLoss,'heat equipment reduces continuous damage');
assert(E.ZONES_EXTRA.find(z=>z.name==='青の輪郭').env[1]<E.ZONES_EXTRA.find(z=>z.name==='風の止む空').env[1],'upper stratosphere cold eases while oxygen decreases');
console.log('PASS: legacy parity, false ending/fall, hidden positional UI/ARIA, no offline catch-up, real elapsed time, 17 bosses, normal/true ending, actual distance ledgers, save migration/validation and equipment effects.');

const skyRaw={...legacy,expedition:{wins:[1,0,0,0],selected:4}};
const coldA=E.create(skyRaw,()=>1),coldB=E.create(skyRaw,()=>1);E.start(coldA);E.start(coldB);coldB.saved.expedition.resist.cold=4;E.step(coldA,.1);E.step(coldB,.1);assert(coldB.x>coldA.x,'cold protection restores movement speed');
for(const state of [coldA,coldB]){state.stamina=0;state.phase='fight';state.timer=4;state.index=0;state.x=E.enemies(state)[0].x;state.enemyHP=E.enemies(state)[0].hp;}
coldB.saved.expedition.resist.oxygen=4;E.step(coldA,.1);E.step(coldB,.1);assert(coldB.stamina>coldA.stamina,'oxygen equipment improves stamina recovery');
console.log('PASS: cold movement and oxygen recovery equipment effects.');
// Each extra chapter has its own resumable slot, even when playing a legacy chapter between them.
const multiple=E.create(JSON.parse(JSON.stringify(s.saved)),()=>1),positions=[];
for(const stage of [3,4,5,6]){
 assert(E.select(multiple,stage));E.play(multiple);E.step(multiple,.1);E.stop(multiple);
 positions.push(JSON.parse(JSON.stringify(multiple.saved.expedition.snapshots[stage-3])));
}
assert(E.select(multiple,0));E.play(multiple);E.step(multiple,.1);E.stop(multiple);
const migratedSlots=E.create(JSON.parse(JSON.stringify(multiple.saved)),()=>1);
for(const stage of [3,4,5,6]){
 assert(E.select(migratedSlots,stage));E.play(migratedSlots);
 for(const k of ['phase','x','index','level','hp','enemyHP','timer','stamina'])assert.equal(migratedSlots[k],positions[stage-3][k],'independent chapter slot '+stage+' '+k);
 E.stop(migratedSlots);
}
const oldPrototype=JSON.parse(JSON.stringify(partial));oldPrototype.expedition.schema=1;delete oldPrototype.expedition.snapshots;
const prototypeMigration=E.create(oldPrototype,()=>1);assert.equal(prototypeMigration.x,partial.expedition.snapshot.x);assert.equal(prototypeMigration.phase,'falling');assert.deepEqual(prototypeMigration.saved.expedition.snapshots[0],partial.expedition.snapshot);
assert.equal(E.create({expedition:{selected:2}}).stage,0,'new save cannot select a locked legacy chapter');
assert.equal(E.clean({...legacy,expedition:{selected:4,snapshot:{stage:4,phase:'falling',x:0,index:0,level:1,kills:0,hp:60}}}).expedition.snapshot,null,'falling only exists in the unlocked underground chapter');
const clock=E.create(legacy,()=>1);clock.phase='walk';E.tickTime(clock,2.5);assert.equal(clock.saved.expedition.time,2.5,'visible slow frames retain real elapsed time');E.tickTime(clock,Infinity);assert.equal(clock.saved.expedition.time,2.5);clock.phase='ready';E.tickTime(clock,100);assert.equal(clock.saved.expedition.time,2.5);
assert(E.gearEffects(s).includes('%軽減'),'explicit environment equipment effects');
// UI preserves the pre-extension save before its first migration write.
const original=JSON.stringify(legacy),store={'shu3.hero-again.v1':original};let migrationFrame;
const migrationNodes={};
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:Img,window:{HeroAgain:E,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:{hidden:false,getElementById:id=>migrationNodes[id]||(migrationNodes[id]={textContent:'',setAttribute:()=>{},getContext:()=>ctx,addEventListener:()=>{}}),addEventListener:()=>{}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},requestAnimationFrame:f=>{migrationFrame=f;}});
assert.equal(store['shu3.hero-again.v1.before-expedition'],original);migrationFrame(100);assert.equal(store['shu3.hero-again.v1.before-expedition'],original,'backup never overwritten');
console.log('PASS: four persistent chapter slots, v1 prototype migration, locked-stage rejection, equipment effect labels, real-time accounting and pre-migration backup.');

const heatDeath=E.create(legacy,()=>1);heatDeath.stage=3;E.start(heatDeath);for(let i=0;i<51;i++)E.step(heatDeath,.1);
heatDeath.phase='fight';heatDeath.index=1;heatDeath.x=E.enemies(heatDeath)[1].x;heatDeath.enemyHP=1;heatDeath.hp=1e-9;heatDeath.kills=1;heatDeath.level=1;heatDeath.timer=0;
E.step(heatDeath,.1);assert.equal(heatDeath.phase,'fallen');assert.equal(heatDeath.index,1);assert.equal(heatDeath.level,1,'heat defeat cannot be reversed by same-tick level-up');
console.log('PASS: heat defeat resolves before attack/level-up.');
// Real UI playback keeps the fall readable at 4x; home endings render finite Canvas arguments.
const fallState=E.create(legacy,()=>1);fallState.phase='won';const fallEvents={},fallNodes={};let fallFrame;
const finiteContext=new Proxy({},{get:()=> (...args)=>{for(const v of args)if(typeof v==='number')assert(Number.isFinite(v));},set:()=>true});
function fallNode(id){return fallNodes[id]||(fallNodes[id]={textContent:'',setAttribute:()=>{},getContext:()=>finiteContext,addEventListener:(k,f)=>{fallEvents[id+':'+k]=f;}});}
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:Img,window:{HeroAgain:{...E,create:()=>fallState},HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:{hidden:false,getElementById:fallNode,addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:f=>{fallFrame=f;}});
fallEvents['start:click']();fallEvents['speed-4:click']();fallFrame(100);for(let i=1;i<=150;i++)fallFrame(100+i*1000/60);
assert.equal(fallState.phase,'falling');assert(Math.abs(fallState.saved.expedition.fall/6351000-.5)<1e-8,'fall lasts five real seconds at 4x');assert(Math.abs(fallState.saved.expedition.time-2.5)<1e-8);
for(const stage of [5,6]){
 const ending=E.create(JSON.parse(JSON.stringify(s.saved)),()=>1);ending.stage=stage;ending.phase='won';ending.index=E.enemies(ending).length;ending.x=E.goal(ending);ending.hp=60;ending.enemyHP=0;ending.kills=0;ending.level=1;
 const endNodes={};let endFrame,scrolls=0;
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:Img,window:{HeroAgain:{...E,create:()=>ending},HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:{hidden:false,getElementById:id=>endNodes[id]||(endNodes[id]={textContent:'',setAttribute:()=>{},getContext:()=>finiteContext,addEventListener:()=>{},scrollIntoView:()=>{scrolls++;}}),addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:f=>{endFrame=f;}});
 endFrame(100);endFrame(200);assert.equal(endNodes['ending-panel'].hidden,false);assert.equal(scrolls,1,'ending card scrolled into view once');assert(endNodes['ending-result'].textContent.includes('マラソン往復'));
}
console.log('PASS: unaccelerated fall at 4x, real-time UI accounting and home/true ending render with a single result-card scroll.');
