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
const V=require('../docs/games/hero-again/scenery.js'),M=require('../docs/games/hero-again/motion.js'),C=require('../docs/games/hero-again/campaign.js');
const enemy=E.ENEMIES[0];
assert.equal(M.enemyX({phase:'walk',x:0},enemy),830,'enemy enters from right edge');
assert(M.enemyX({phase:'walk',x:50},enemy)<M.enemyX({phase:'walk',x:0},enemy));
assert.equal(M.enemyX({phase:'walk',x:100},enemy),M.enemyX({phase:'fight',x:100},enemy),'no teleport at contact');
assert.equal(M.enemyX({phase:'walk',x:100},E.ENEMIES[1]),830,'next enemy also enters at right edge');
assert.equal(M.enemyX({phase:'fallen',x:100},enemy),245,'enemy stays at contact after death');
assert.notEqual(M.stride(.1),M.stride(.3));
const fs=require('node:fs'),vm=require('node:vm'),elements={},handlers={};let raf;
const images=[],drawn=[];
class TestImage{
 constructor(){this.naturalWidth=1254;this.naturalHeight=1254;images.push(this);}
 set src(value){this.path=value;
 if(value.endsWith('hero-reverse.webp')){this.naturalWidth=1536;this.naturalHeight=1024;}
 if(value.endsWith('journey-atlas.webp')){this.naturalWidth=1932;this.naturalHeight=814;}
 if(value.endsWith('moon-forest.webp')){this.naturalWidth=1942;this.naturalHeight=809;}
 }
}

const ctx=new Proxy({drawImage:(...args)=>{drawn.push(args);}}, {get:(o,k)=>o[k]||((...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'finite Canvas argument: '+k);}),set:(o,k,v)=>(o[k]=v,true)});
function el(id){return elements[id]||(elements[id]={textContent:'',disabled:false,setAttribute:()=>{},getContext:()=>ctx,addEventListener:(key,fn)=>{handlers[id+':'+key]=fn;}});}
const doc={hidden:false,getElementById:el,addEventListener:(key,fn)=>{handlers[key]=fn;}};
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:TestImage,window:{HeroAgain:C,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:doc,localStorage:{getItem:()=>'{bad json',setItem:()=>{}},requestAnimationFrame:fn=>{raf=fn;},console});
assert(elements['save-note'].textContent.includes('読み込めません'));handlers['start:click']();raf(100);raf(1100);const shown=elements.distance.textContent;
doc.hidden=true;handlers.visibilitychange();raf(100000);assert.equal(elements.distance.textContent,shown);assert.equal(elements.phase.textContent,'一時停止中');
doc.hidden=false;raf(200000);assert.equal(elements.distance.textContent,shown);handlers['pause:click']();raf(300000);assert.equal(elements.distance.textContent,shown,'resume must not catch up elapsed hidden time');raf(300100);assert.notEqual(elements.distance.textContent,shown);
console.log('PASS: bounded/corrupt saves, death/restart and retained equipment, level/HP reset, attainable goal, damage formula, one-hit kill, terminal state, background pause and explicit resume without catch-up.');

function playback(multiplier){
 const nodes={},events={};let frame,current;
 function node(id){return nodes[id]||(nodes[id]={textContent:'',disabled:false,setAttribute:(k,v)=>{nodes[id][k]=v;},getContext:()=>ctx,addEventListener:(k,fn)=>{events[id+':'+k]=fn;}});}
 const engine={...C,step:(state,dt)=>{current=state;C.step(state,dt);}};
 const document={hidden:false,getElementById:node,addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:TestImage,window:{HeroAgain:engine,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document,localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>{frame=fn;}});
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

// Exercise the real PNG dimensions, loading, crop bounds and the fallback after failure.
const png=fs.readFileSync('docs/games/hero-again/assets/hero-v2.png');
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),1254);assert.equal(png.readUInt32BE(20),1254);
assert.equal(png[25],6,'RGBA sprite preserves transparency');
assert.equal(images[0].path,'assets/hero-v2.png');
for(const image of images.slice(0,3))image.onload();raf(400200);assert(drawn.length>0,'loaded image rendered');
for(const [image,sx,sy,sw,sh,dx,dy,dw,dh] of drawn){
 assert(sx>=0&&sy>=0&&sx+sw<=image.naturalWidth&&sy+sh<=image.naturalHeight,'sprite stays within PNG');
 assert([dx,dy,dw,dh].every(Number.isFinite));assert(dw>0&&dh>0);
}
const count=drawn.length;images[0].onerror();raf(400300);
assert.equal(drawn.length,count,'failed image falls back without drawing broken image');
console.log('PASS: local transparent PNG, finite sprite rendering, bounded source frames, image failure fallback.');

assert.deepEqual([.01,.11,.21,.31,.41].map(M.runFrame),[0,1,2,3,0],'run cycle includes both strides and passing steps');
const visualNodes={},visualEvents={};let visualRaf;
function visualEl(id){return visualNodes[id]||(visualNodes[id]={textContent:'',disabled:false,setAttribute:()=>{},getContext:()=>ctx,addEventListener:(k,fn)=>{visualEvents[id+':'+k]=fn;}});}
const imageStart=images.length;
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:TestImage,window:{HeroAgain:C,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:{hidden:false,getElementById:visualEl,addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>{visualRaf=fn;}});
const visualImages=images.slice(imageStart);
for(const image of visualImages){
 const file=fs.readFileSync('docs/games/hero-again/'+image.path);
 if(image.path.endsWith('.png')){
  assert.equal(file.readUInt32BE(16),image.naturalWidth);assert.equal(file.readUInt32BE(20),image.naturalHeight);
 }else{
  assert.equal(file.toString('ascii',0,4),'RIFF');assert.equal(file.toString('ascii',8,12),'WEBP');
  const extended=file.toString('ascii',12,16)==='VP8X';
  const width=extended?file.readUIntLE(24,3)+1:file.readUInt16LE(26)&0x3fff;
  const height=extended?file.readUIntLE(27,3)+1:file.readUInt16LE(28)&0x3fff;
  assert.equal(width,image.naturalWidth);assert.equal(height,image.naturalHeight);
  if(!image.path.includes('moon-forest'))assert(file[20]&16,'WebP alpha channel preserved');
 }
 image.onload();
}
const drawStart=drawn.length;visualEvents['start:click']();visualRaf(100);
for(let i=1;i<=36;i++)visualRaf(100+i*1000/60);
const cycle=drawn.slice(drawStart).filter(args=>!args[0].path.includes('moon-forest'));
assert.equal(new Set(cycle.map(a=>a[0].path+':'+a[1]+':'+a[2])).size,4,'all four run images actually reach Canvas');
for(const [im,sx,sy,sw,sh,...dest] of drawn.slice(drawStart)){
 assert(sx>=0&&sy>=0&&sx+sw<=im.naturalWidth&&sy+sh<=im.naturalHeight,'all loaded assets stay in bounds');
 assert(dest.every(Number.isFinite));
}
const failed=visualImages.find(im=>im.path.includes('reverse'));failed.onerror();
const failureStart=drawn.length;visualRaf(800);
assert(!drawn.slice(failureStart).some(a=>a[0].path.includes('hero-')),'missing run image uses animated Canvas fallback');
const bg=visualImages.find(im=>im.path.includes('moon-forest'));bg.onerror();
const bgStart=drawn.length;visualRaf(900);assert.equal(drawn.length,bgStart,'missing forest uses Canvas fallback');
console.log('PASS: four distinct loaded run frames, panorama bounds, asset dimensions, independent animation/background failures.');

require('./hero-campaign.cjs');

// Render every long-route enemy and boss through the production Canvas UI.
for(const stage of [1,2]){
 const state=C.create({wins:1,stageWins:[1,1,0],selected:stage},()=>1),nodes={},events={};let frame;
 function node(id){return nodes[id]||(nodes[id]={textContent:'',disabled:false,setAttribute:()=>{},getContext:()=>ctx,addEventListener:(k,fn)=>{events[id+':'+k]=fn;}});}
 const api={...C,create:()=>state};
 vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{Image:TestImage,window:{HeroAgain:api,HeroMotion:M,HeroScenery:V,addEventListener:()=>{}},document:{hidden:false,getElementById:node,addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>{frame=fn;}});
 const atlas=images.at(-1);assert.equal(atlas.path,'assets/journey-atlas.webp');atlas.onload();
 C.start(state);
 for(let i=0;i<C.enemies(state).length;i++){
  state.index=i;const e=C.enemies(state)[i];state.x=e.x;state.phase='fight';state.enemyHP=e.hp;state.timer=10;frame(100+i*17);
 }
 assert(nodes.distance.textContent.includes('42.195km'));
 events['stop:click']();assert.equal(state.phase,'ready');assert.equal(nodes['stage-0'].disabled,false);events['stage-0:click']();assert.equal(state.stage,0);
}
console.log('PASS: all outbound/return enemy types and bosses render with finite Canvas arguments; stage controls and distance labels.');

// All atlas crops stay inside their own cell, including reverse travel and edges.
for(const index of Array.from({length:9},(_,i)=>i))for(const progress of [0,.5,1])for(const returning of [false,true]){
 const crop=V.crop(index,1932,814,progress,returning),left=index%3*644,top=Math.floor(index/3)*814/3;
 assert(crop.sx>=left&&crop.sx+crop.sw<=left+644);
 assert(crop.sy>=Math.floor(top)&&crop.sy+crop.sh<=top+814/3);
 assert(Object.values(crop).every(Number.isFinite));
}
assert.deepEqual(Array.from({length:9},(_,i)=>V.realm(2,i)),[8,7,6,5,4,3,2,1,0]);
assert.equal(V.zoneProgress(42195,8),1);assert.equal(V.zoneProgress(40000,8),0);
assert.equal(new Set(V.THEMES.map(t=>t.color)).size,9,'nine different realm palettes');
const atlasFile=fs.readFileSync('docs/games/hero-again/assets/journey-atlas.webp');
assert.equal(atlasFile.toString('ascii',0,4),'RIFF');assert.equal(atlasFile.readUInt16LE(26)&0x3fff,1932);assert.equal(atlasFile.readUInt16LE(28)&0x3fff,814);
const atlasDraws=drawn.filter(a=>a[0].path==='assets/journey-atlas.webp');assert(atlasDraws.length>0,'production UI draws the atlas');
assert.equal(new Set(atlasDraws.map(a=>Math.floor(a[1]/644)+3*Math.floor(a[2]/(814/3)))).size,9,'all nine backgrounds actually rendered');
for(const [im,sx,sy,sw,sh,...dest] of atlasDraws){assert(sx>=0&&sy>=0&&sx+sw<=im.naturalWidth&&sy+sh<=im.naturalHeight);assert(dest.every(Number.isFinite));}
console.log('PASS: local nine-realm atlas, outbound/reverse scenery, bounded per-cell crops, equipment icons and all boss scenes.');

require('./hero-expedition.cjs');
