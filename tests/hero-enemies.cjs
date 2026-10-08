'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),N=require('../docs/games/hero-again/enemies.js'),E=require('../docs/games/hero-again/expedition.js');
const expected=[['スライム','slime'],['毒スライム','slime'],['覚醒 森のゴブリン','goblin'],['石の魔人','stone'],['骸骨兵','skeleton'],['氷狼','wolf'],['火トカゲ','lizard'],['溶岩兵','magma'],['青影の竜','dragon'],['魔王の近衛','knight']];
for(const [name,key] of expected)assert.equal(N.family({name,type:0,boss:false},3),key,name);
assert.equal(N.family({name:'魔王',type:3,boss:true},1),null,'dedicated and ordinary bosses remain unchanged');
assert.equal(N.family({name:'unknown',type:NaN},0),null);assert.equal(N.family({name:[],type:100},0),null);
let count=0;for(const stage of [0,1,2,3,4,5,6]){
 const s=E.create();s.stage=stage;
 for(const enemy of E.enemies(s)){
  const v=N.variant(enemy,stage);
  if(enemy.boss){assert.equal(v,null);continue;}
  assert(v&&Object.hasOwn(N.FAMILIES,v.key),'every real ordinary enemy has artwork');assert(v.tier>=0&&v.tier<4);count++;
 }
}
assert(count>500);
assert.deepEqual(Array.from({length:9},(_,rank)=>N.tier({rank},1)),[0,0,0,1,1,1,2,2,2]);
assert.equal(N.tier({rank:9},2),2);assert.equal(N.tier({rank:17},2),3);assert.equal(N.tier({rank:18},3),2);assert.equal(N.tier({rank:34},6),3);
let draws=0;
const context=new Proxy({drawImage:(im,sx,sy,sw,sh,dx,dy,dw,dh)=>{draws++;assert(sx>=0&&sy>=0&&sx+sw<=im.naturalWidth&&sy+sh<=im.naturalHeight);assert(dw>0&&dh>0&&dw<=180&&dh<=140);}}, {get:(o,k)=>o[k]||((...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k);}),set:(o,k,v)=>(o[k]=v,true)});
for(const [key,item] of Object.entries(N.FAMILIES)){
 const bytes=fs.readFileSync('docs/games/hero-again/assets/enemy-'+key+'.webp');assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 assert.equal(bytes.subarray(12,16).toString(),'VP8X');assert(bytes[20]&16,'transparent alpha');
 const width=1+bytes.readUIntLE(24,3),height=1+bytes.readUIntLE(27,3);assert(bytes.length<160000);
 assert.equal(N.FRAMES[key].length,4);const image={naturalWidth:width,naturalHeight:height},images={[key]:{image,ready:true}};
 for(let tier=0;tier<4;tier++)for(const reduced of [false,true]){
  const enemy={name:expected.find(x=>x[1]===key)[0],boss:false,type:0,rank:tier*3};
  // Each atlas tier is exercised directly regardless of campaign rank mapping.
  const stage=tier===3?2:1;if(tier===3)enemy.rank=17;
  for(const phase of ['walk','fight','fallen'])assert(N.draw(context,images,enemy,245,stage,.4,phase,.14,reduced));
 }
 images[key].ready=false;assert.equal(N.draw(context,images,{name:expected.find(x=>x[1]===key)[0],type:0},245,1,0,'walk',0,false),false,'asset failure uses existing renderer');
 const still=N.pose(item.style,0,true,.14,true);assert.deepEqual(still,N.pose(item.style,50,false,0,true),'reduced motion stays still');
}
assert.equal(draws,9*4*2*3);
const html=fs.readFileSync('docs/games/hero-again/index.html','utf8');assert(html.indexOf('enemies.js')<html.indexOf('game.js'));
console.log('PASS: all actual ordinary enemies, nine families/four tiers, blue slime identity, bounded transparent crops, finite motion, boss preservation and asset failure fallback.');
const vm=require('node:vm'),M=require('../docs/games/hero-again/motion.js'),V=require('../docs/games/hero-again/scenery.js');
const state=E.create();state.phase='fight';state.x=100;state.enemyHP=22;
const elements={},paths=[],filters=[];let nextFrame;
class TestImage{constructor(){this.naturalWidth=480;this.naturalHeight=480;}set src(path){this.path=path;if(path.includes('enemy-')&&this.onload)this.onload();}}
const ctx=new Proxy({drawImage:(image)=>paths.push(image.path)}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>{if(k==='filter')filters.push(v);o[k]=v;return true;}});
function element(id){return elements[id]||(elements[id]={textContent:'',setAttribute:()=>{},getContext:()=>ctx,addEventListener:()=>{}});}
const root={HeroAgain:{...E,create:()=>state,step:()=>{}},HeroMotion:M,HeroScenery:V,addEventListener:()=>{}};
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/enemies.js','utf8'),{window:root,Image:TestImage});
vm.runInNewContext(fs.readFileSync('docs/games/hero-again/game.js','utf8'),{window:root,document:{hidden:false,getElementById:element,addEventListener:()=>{}},Image:TestImage,localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>{nextFrame=fn;}});
nextFrame(100);assert(paths.includes('assets/enemy-slime.webp'),'real game draws loaded ordinary sprite');
assert(!filters.some(v=>v.includes('hue-rotate')),'blue slime is not recolored');
console.log('PASS: ordinary sprite loader and renderer are connected in the actual game.');
