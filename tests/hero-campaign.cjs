'use strict';
const assert=require('node:assert/strict'),C=require('../docs/games/hero-again/campaign.js'),T=require('../docs/games/hero-again/engine.js');
const old={weapon:7,armor:5,best:1000,attempts:12,wins:1};
const migrated=C.create(old);assert.equal(C.unlocked(migrated),1);assert.equal(migrated.saved.weapon,7);assert.equal(migrated.saved.best,1000);
assert.equal(C.select(migrated,2),false);assert(C.select(migrated,1));
assert.equal(C.clean({stageWins:[0,1,1],selected:2}).selected,0,'inconsistent unlocks fail closed');
const malformed=C.clean({wins:1,selected:99,materials:Infinity,weapons:Array(500).fill('1'),armors:[-2],counts:[NaN]});
assert.equal(malformed.selected,0);assert.equal(malformed.materials,0);assert.equal(malformed.weapons.length,18);assert(malformed.weapons.every(x=>x===-1));assert.equal(malformed.armors[0],-1);
const fresh=C.create(null,()=>1),tutorial=T.create();C.play(fresh);T.start(tutorial);
for(let i=0;i<30000&&fresh.phase!=='won';i++){
 C.step(fresh,.1);T.step(tutorial,.1);
 for(const key of ['phase','x','hp','level','enemyHP','kills','index'])assert.equal(fresh[key],tutorial[key],'tutorial preserved: '+key);
 for(const key of ['weapon','armor','best','attempts','wins'])assert.equal(fresh.saved[key],tutorial.saved[key]);
}
assert.equal(fresh.phase,'won');assert.equal(C.unlocked(fresh),1);
function finish(s,limit){
 let deaths=0;
 for(let i=0;i<limit&&s.phase!=='won';i++){
  const before=s.phase,items=JSON.stringify([s.saved.weapons,s.saved.armors,s.saved.materials]);C.step(s,.1);
  assert(Number.isFinite(s.hp)&&Number.isFinite(s.enemyHP));
  if(s.phase==='fallen')assert(s.lastDeath>0);
  if(before==='fallen'&&s.phase==='walk'){
   deaths++;assert.equal(s.x,0);assert.equal(s.level,1);assert.equal(s.hp,60);
   assert.equal(JSON.stringify([s.saved.weapons,s.saved.armors,s.saved.materials]),items,'death retains equipment and materials');
  }
 }
 assert.equal(s.phase,'won','route attainable with no random drops');assert.equal(s.x,42195);return deaths;
}
C.play(fresh);assert.equal(fresh.stage,1);assert.equal(C.enemies(fresh).length,169);
for(const stage of [1,2]){
 const list=C.enemies({...fresh,stage});assert.equal(list.filter(x=>x.boss).length,9);assert.equal(list.at(-1).x,42195);
 for(let i=1;i<list.length;i++)assert(list[i].x>list[i-1].x);
 for(let z=1;z<9;z++)assert(list.find(x=>x.zone===z&&!x.boss).hp>list.find(x=>x.zone===z-1&&!x.boss).hp,'exponential growth');
}
const outwardDeaths=finish(fresh,500000);assert(outwardDeaths>0);assert.equal(C.unlocked(fresh),2);
const saved=C.clean(JSON.parse(JSON.stringify(fresh.saved)));assert.deepEqual(saved,fresh.saved,'round-trip save exact');
assert(JSON.stringify(saved).length<8192,'save below browser load cap');
C.play(fresh);assert.equal(fresh.stage,2);assert.equal(C.zone(fresh).name,'魔王城');
const returnDeaths=finish(fresh,700000);assert(returnDeaths>0);assert.equal(C.zone(fresh).name,'旅立ちの草原');assert(fresh.saved.bosses.every(Boolean));
// Faster completion may precede the tenth kill needed for the final zone armor.
const collection=C.create(fresh.saved,()=>1);C.select(collection,1);C.play(collection);finish(collection,500000);
assert(collection.saved.weapons.every(x=>x>=0)&&collection.saved.armors.every(x=>x>=0),'guaranteed drops cover all zones after enough cumulative kills');
assert(outwardDeaths<=5&&returnDeaths<=20,'guaranteed rewards bound no-random-drop retries');
const stable=JSON.stringify(fresh.saved);C.step(fresh,.1);assert.equal(JSON.stringify(fresh.saved),stable);
const reload=C.create(JSON.parse(stable),()=>1);assert.equal(reload.stage,2);assert.equal(reload.phase,'ready');assert.equal(reload.x,0);assert.deepEqual(reload.saved,fresh.saved);
C.play(reload);C.step(reload,.1);assert(!C.select(reload,0),'no stage switching during combat');C.stop(reload);assert.equal(reload.x,0);assert.equal(reload.level,1);assert(C.select(reload,0));
// Deterministic high-drop route also completes, without unbounded rewards or upgrades.
const lucky=C.create(old,()=>0);C.select(lucky,1);C.play(lucky);finish(lucky,500000);C.play(lucky);finish(lucky,700000);
assert(lucky.saved.weapons.concat(lucky.saved.armors).every(x=>x<=C.MAX_UPGRADE));
// A challenge starts when the player departs: stop/reload/replay all count once.
for(const stage of [0,1,2]){
 const manual=C.create({wins:1,stageWins:[1,1,1],selected:stage,started:[false,false,false]},()=>1);
 const initial=C.record(manual,'attempts');C.play(manual);assert.equal(C.record(manual,'attempts'),initial);
 C.stop(manual);assert.equal(C.record(manual,'attempts'),initial,'stopping alone is not a new challenge');
 C.play(manual);assert.equal(C.record(manual,'attempts'),initial+1,'manual restart counted');
 const loaded=C.create(JSON.parse(JSON.stringify(manual.saved)),()=>1);C.play(loaded);
 assert.equal(C.record(loaded,'attempts'),initial+2,'reload and departure counted');
 loaded.phase='fallen';loaded.timer=.01;C.step(loaded,.1);
 assert.equal(C.record(loaded,'attempts'),initial+3,'automatic restart counted exactly once');
 assert.equal(loaded.x,0);assert.equal(loaded.hp,60);
 C.stop(loaded);C.select(loaded,stage===0?1:0);C.select(loaded,stage);C.play(loaded);
 assert.equal(C.record(loaded,'attempts'),initial+4,'stage switching cannot bypass count');
 loaded.phase='won';C.select(loaded,stage);C.play(loaded);
 assert.equal(C.record(loaded,'attempts'),initial+5,'replay from stage selection counted');
}
assert(C.clean({wins:1,best:1000}).started[0],'legacy completed tutorial marked as previously started');
assert.equal(C.clean({wins:1,stageBest:[1000,250,0]}).started[1],true);
assert.equal(C.clean({started:['true',1,null]}).started[0],false,'invalid flags rejected');
console.log('PASS: manual restart, reload, automatic restart, stage switching and replay count each departure once; old saves migrate.');
console.log('PASS: original tutorial unchanged, legacy migration, locked routes, malformed saves, 18 zone bosses, exponential growth, guaranteed gear, no-drop outbound/return completion, death retention and reload.');

// Fixed-step worst-case progression: no random drops, including no bonus rarity.
const balanced=C.create({wins:1,weapon:12,armor:9,selected:1},()=>1);
for(const stage of [1,2]){
 C.select(balanced,stage);C.play(balanced);
 let ticks=0,deaths=0,repeats=0,maxRepeats=0,last=-1;
 while(balanced.phase!=='won'&&ticks<600000){
  const before=balanced.phase;C.step(balanced,1/60);ticks++;
  if(before!=='fallen'&&balanced.phase==='fallen'){
   deaths++;repeats=balanced.lastDeath===last?repeats+1:1;last=balanced.lastDeath;maxRepeats=Math.max(maxRepeats,repeats);
  }
 }
 assert.equal(balanced.phase,'won','fixed-step route completes without random drops');
 assert(deaths<=(stage===1?5:20),'retry budget');
 assert(maxRepeats<=4,'no prolonged identical defeat loop');
 console.log('PASS: stage '+stage+' fixed-step no-random-drop '+(deaths+1)+' attempts, '+(ticks/60/4/60).toFixed(1)+' simulated minutes at 4x, longest repeated defeat '+maxRepeats);
}
for(const stage of [1,2]){
 const foes=C.enemies({...balanced,stage});
 for(let i=1;i<foes.length;i++){
  const a=foes[i-1],b=foes[i];
  if(!a.boss&&!b.boss&&a.zone===b.zone)assert(b.hp/a.hp<=1.26,'smooth regular enemy ramp');
 }
}
