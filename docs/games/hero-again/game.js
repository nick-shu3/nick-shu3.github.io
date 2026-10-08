'use strict';
(()=> {
const E=window.HeroAgain,V=window.HeroScenery,by=id=>document.getElementById(id),canvas=by('scene'),g=canvas.getContext('2d'),KEY='shu3.hero-again.v1';
let saved=null,storageOK=true;
const gentle=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)').matches:false;
let atlasArt=null,gearStamp='';
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=8192)saved=JSON.parse(raw);}catch(_){storageOK=false;}
const s=E.create(saved);let paused=false,last=0,seen=-1,lastSave='',visualTime=0,speed=1,accumulator=0;
function save(){const value=JSON.stringify(s.saved);if(value===lastSave)return;try{localStorage.setItem(KEY,value);lastSave=value;}catch(_){storageOK=false;by('save-note').textContent='保存できません。この画面を開いている間だけ記録が残ります。';}}
if(!storageOK)by('save-note').textContent='保存を読み込めませんでした。新しい冒険として開始します。';
function number(value){return Math.round(value).toLocaleString('ja-JP');}
function distance(value){return s.stage===0?number(value)+'m':(value/1000).toFixed(3)+'km';}
function update(){
 const st=E.stats(s),active=['walk','fight','fallen'].includes(s.phase),zone=E.zone(s);
 by('hp').textContent=number(s.hp)+' / '+number(st.maxHP);by('health').max=st.maxHP;by('health').value=s.hp;
 by('distance').textContent=distance(s.x)+' / '+distance(E.goal(s));by('progress').max=E.goal(s);by('progress').value=s.x;
 by('level').textContent=s.level;by('attack').textContent=number(st.attack);by('defense').textContent=number(st.defense);by('xp').textContent=(2-s.kills%2)+'体';
 const gears=['weapon','armor'].map(key=>E.equipment(s,key));
 for(let i=0;i<2;i++)by(i===0?'weapon':'armor').textContent=gears[i].name+' +'+gears[i].level;
 const stamp=gears.map(g=>g.name+':'+g.index+':'+g.level).join('|');if(stamp!==gearStamp){gearStamp=stamp;gears.forEach((gear,i)=>gearIcon(i===0?'weapon':'armor',gear));}
 by('attempt').textContent='挑戦 '+E.record(s,'attempts')+'回目';by('best').textContent='最長 '+distance(E.record(s,'best'));by('wins').textContent='踏破 '+E.record(s,'wins')+'回';
 by('phase').textContent=paused?'一時停止中':({ready:'出発の準備',walk:'ゴールを目指して',fight:'魔物と戦闘中',fallen:'次の勇者へ…',won:'ゴール到達！'})[s.phase];
 by('pause').disabled=!active;by('pause').textContent=paused?'再開する':'一時停止';by('stop').disabled=!active;
 by('start').disabled=!['ready','won'].includes(s.phase);by('start').textContent=s.phase==='won'?(s.stage===0?'往路42.195kmへ進む':s.stage===1?'裏・復路42.195kmへ進む':'装備を引き継いでもう一度'):'冒険をはじめる';
 for(let i=0;i<3;i++){by('stage-'+i).disabled=active||i>E.unlocked(s);by('stage-'+i).setAttribute('aria-pressed',String(i===s.stage));}
 by('stage-guide').textContent=E.STAGES[s.stage]+' ／ '+(E.unlocked(s)===0?'入門クリアで往路が解放。':E.unlocked(s)===1?'往路クリアで裏・復路が解放。':'往路・復路ともに解放済み。');
 by('zone').textContent=zone?'区間'+(zone.index+1)+' / 9 · '+zone.name:'チュートリアル';
 by('boss-distance').textContent=zone?zone.boss.name+'まで '+distance(Math.max(0,zone.boss.x-s.x)):'ゴールまで '+distance(Math.max(0,E.goal(s)-s.x));
 by('gear-guide').textContent=s.stage===0?'入門では武器か鎧が +1（各 +12 まで）。':'一番強い装備を自動装備。素材で武器・防具を自動強化（各 +200 まで）。';
 by('materials').textContent='強化素材 '+number(s.saved.materials);
 by('guarantee').textContent=zone?'区間撃破 '+number(s.saved.counts[zone.rank])+'体 ／ 次の確定報酬まで '+(5-s.saved.counts[zone.rank]%5)+'体':'往路から装備ドロップが追加されます。';
 if(seen!==s.serial){seen=s.serial;by('message').textContent=s.event||'装備は引き継ぎ。レベルと身体能力は、倒れると初期値に戻ります。';save();}
}
function gearIcon(key,gear){
 const c=by(key+'-art').getContext('2d'),color=V.gearColor(gear.index),rare=gear.name.includes('王印'),tier=gear.index<0?0:1+Math.floor(gear.index/3);
 c.clearRect(0,0,96,96);c.save();c.translate(48,48);
 function shape(points,fill){c.beginPath();c.moveTo(...points[0]);for(const point of points.slice(1))c.lineTo(...point);c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle='#172b36';c.lineWidth=2;c.stroke();}
 c.beginPath();c.arc(0,0,36,0,Math.PI*2);c.strokeStyle=color+'55';c.lineWidth=1;c.stroke();
 if(key==='weapon'){
  c.rotate(.55);shape([[-5,13],[-7,-21],[0,-36],[7,-21],[5,13]],color);
  shape([[0,-31],[-2,10],[3,10],[3,-22]],'#f6f3df');
  c.fillStyle=rare?'#f1ce76':'#b89a65';c.fillRect(-17,11,34,6);c.fillRect(-4,17,8,15);
  shape([[-5,32],[0,37],[5,32],[0,28]],color);
  if(tier>=2){shape([[-17,12],[-20,4],[-12,11]],color);shape([[17,12],[20,4],[12,11]],color);}
  if(tier>=4)shape([[-6,-15],[0,-23],[6,-15],[0,-7]],rare?'#ffe0a1':'#e9c688');
 }else{
  shape([[-16,-28],[-31,-14],[-21,1],[-13,-4],[-17,29],[17,29],[13,-4],[21,1],[31,-14],[16,-28],[7,-20],[-7,-20]],color);
  shape([[-10,-15],[10,-15],[13,15],[0,25],[-13,15]],'#436775');
  shape([[0,-10],[7,1],[0,13],[-7,1]],rare?'#ffe1a1':color);
  c.strokeStyle='#f4e8c2';c.lineWidth=2;c.beginPath();c.moveTo(-22,-15);c.lineTo(-13,-20);c.moveTo(22,-15);c.lineTo(13,-20);c.stroke();
  if(tier>=3){shape([[-21,-20],[-30,-27],[-29,-13],[-18,-13]],'#c9b680');shape([[21,-20],[30,-27],[29,-13],[18,-13]],'#c9b680');}
 }
 if(rare){c.fillStyle='#f2d185';for(const [x,y] of [[-31,-31],[31,-31]]){c.beginPath();c.moveTo(x,y-5);c.lineTo(x+3,y);c.lineTo(x,y+5);c.lineTo(x-3,y);c.closePath();c.fill();}}
 c.restore();
}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);}
function oval(x,y,rx,ry,color,outline){
 g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=color;g.fill();
 if(outline){g.strokeStyle=outline;g.lineWidth=2;g.stroke();}
}
function poly(points,color,outline){
 g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fillStyle=color;g.fill();
 if(outline){g.strokeStyle=outline;g.lineWidth=2;g.lineJoin='round';g.stroke();}
}
function box(x,y,w,h,r,color,outline){
 g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();g.fillStyle=color;g.fill();
 if(outline){g.strokeStyle=outline;g.lineWidth=2;g.stroke();}
}
function line(points,color,width=2){
 g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();
}
function pine(x,y,size,distant){
 const trunk=distant?'#304550':'#30423e',dark=distant?'#2a4752':'#244c49',light=distant?'#35545b':'#396b5c';
 box(x-4,y-size*.12,8,size*.6,2,trunk);
 for(let tier=0;tier<3;tier++){const top=y-size+tier*size*.24,bottom=top+size*.55,wide=size*(.28+tier*.07);
 poly([[x,top],[x-wide,bottom],[x+wide,bottom]],dark);
 poly([[x,top],[x-3,bottom],[x+wide,bottom]],light);}
}
function limb(x,y,angle,length,color,width=10){
 g.save();g.translate(x,y);g.rotate(angle);
 box(-width/2,0,width,length,3,color,'#233442');line([[0,3],[0,length-4]],'#ffffff35',2);
 box(-width/2-2,length-4,width+7,9,3,'#354552','#1b2b38');g.restore();
}
// Images stay local; rejected/failed assets retain the Canvas fallbacks.
function art(path,width,height){
 const image=new Image(),asset={image,ready:false};
 image.onload=()=>{asset.ready=image.naturalWidth===width&&image.naturalHeight===height;};
 image.onerror=()=>{asset.ready=false;};image.src=path;return asset;
}
const heroArt=art('assets/hero-v2.png',1254,1254);
const runArt=art('assets/hero-run.webp',1254,1254);
const reverseArt=art('assets/hero-reverse.webp',1536,1024);
const forestArt=art('assets/moon-forest.webp',1942,809);
const idleFrame={asset:heroArt,sx:0,sy:0,sw:627,sh:627,ax:350,feet:620,scale:.19};
const attackFrame={asset:heroArt,sx:627,sy:627,sw:627,sh:627,ax:300,feet:581,scale:.19};
// Forward stride, passing step, opposite stride, opposite passing step.
const runFrames=[
 {asset:heroArt,sx:627,sy:0,sw:627,sh:627,ax:360,feet:618,scale:.19},
 {asset:runArt,sx:627,sy:0,sw:627,sh:627,ax:350,feet:619,scale:.19},
 {asset:reverseArt,sx:0,sy:0,sw:1536,sh:1024,ax:970,feet:996,scale:.114},
 {asset:runArt,sx:627,sy:627,sw:627,sh:627,ax:305,feet:581,scale:.19}
];
function hero(x,y){
 const running=s.phase==='walk';
 if(!heroArt.ready||(running&&(!runArt.ready||!reverseArt.ready))){vectorHero(x,y);return;}
 const frame=s.flash?attackFrame:running?runFrames[window.HeroMotion.runFrame(visualTime)]:idleFrame;
 const scale=frame.scale,bob=running?-Math.abs(Math.sin(visualTime*Math.PI*5))*2:0;
 oval(x,266,27,6,'#102a3059');
 g.save();g.translate(x,y);
 if(s.phase==='fallen'){g.translate(0,20);g.rotate(-1.3);}
 g.drawImage(frame.asset.image,frame.sx,frame.sy,frame.sw,frame.sh,-frame.ax*scale,36-frame.feet*scale+bob,frame.sw*scale,frame.sh*scale);
 if(s.flash){line([[40,-35],[51,-25],[57,-13]],'#f8dc93',3);}
 g.restore();
}
function vectorHero(x,y){
 const running=s.phase==='walk',swing=running?window.HeroMotion.stride(visualTime):0;
 oval(x,266,27,6,'#102a3059');y+=running?-Math.abs(Math.sin(visualTime*14))*3:0;
 g.save();g.translate(x,y);if(s.phase==='fallen')g.rotate(-1.3);
 // Cape trails behind the runner, independent of the collision/engine state.
 const flutter=running?Math.sin(visualTime*12)*4:0;
 poly([[-14,-29],[-37,-18+flutter],[-45,12+flutter],[-25,6],[-12,16]],'#a9575d','#542f42');
 poly([[-14,-24],[-31,-13+flutter],[-33,7],[-21,3]],'#d57972');
 limb(-9,9,swing,22,'#97b7c1');limb(10,9,-swing,22,'#bdd0d3');
 box(-18,-24,37,38,9,'#a4c2ca','#263e4c');
 poly([[-15,-17],[1,-9],[16,-17],[12,6],[-12,6]],'#6e99ad');
 line([[-12,-17],[-1,-11],[12,-17]],'#e0ece2',2);
 box(-17,5,34,6,2,'#614b42');box(-4,4,8,8,1,'#e5bd75','#7e6646');
 oval(-17,-18,9,8,'#bdd0d3','#263e4c');oval(17,-18,9,8,'#bdd0d3','#263e4c');
 // Face and helmet; the eye looks towards the incoming monsters.
 oval(0,-35,18,18,'#e9bf95','#443e42');
 oval(10,-29,5,3,'#cf917f');oval(7,-37,2.6,3.2,'#203744');oval(8,-38,1,1,'#fff1d0');
 line([[7,-26],[12,-26]],'#8b5a50',1.5);
 g.beginPath();g.moveTo(-20,-35);g.quadraticCurveTo(-23,-61,0,-63);g.quadraticCurveTo(21,-62,21,-42);g.lineTo(9,-43);g.lineTo(3,-50);g.lineTo(-7,-44);g.lineTo(-10,-29);g.lineTo(-21,-30);g.closePath();g.fillStyle='#afcbd5';g.fill();g.strokeStyle='#2a4153';g.lineWidth=2;g.stroke();
 line([[-13,-47],[-11,-56],[0,-59],[12,-55]],'#edf1dd',3);
 box(-23,-45,46,7,3,'#e3c78b','#5f6760');box(-21,-39,8,19,3,'#8eaeba','#2a4153');
 poly([[-3,-61],[-6,-72],[3,-79],[19,-78],[11,-67],[3,-63]],'#b86369','#542f42');
 line([[0,-67],[8,-73],[14,-75]],'#e29a86',2);
 // Arm and sword keep the existing attack pulse and running swing.
 g.save();g.translate(21,-14);g.rotate(s.flash?.45:swing*.45);
 oval(0,8,7,7,'#adbec6','#263e4c');
 poly([[-2,5],[-3,-32],[1,-43],[6,-33],[5,5]],'#e1eddf','#425663');
 line([[1,-31],[1,2]],'#fffce3',2);
 box(-10,4,24,5,2,'#e9c27c','#755d43');box(-1,9,6,13,2,'#78594c','#263e4c');oval(2,22,4,3,'#e9c27c');g.restore();
 g.save();g.translate(-22,-8);g.rotate(-swing*.35);
 poly([[-12,-8],[11,-8],[13,7],[0,24],[-13,9]],'#d4aa64','#3a4550');
 poly([[-8,-3],[7,-3],[9,6],[0,18],[-9,7]],'#4e8790');
 poly([[0,0],[4,6],[0,12],[-4,6]],'#e9dca6');g.restore();
 if(s.flash){line([[30,-35],[42,-29],[47,-16]],'#f8dc93',3);oval(39,-24,2,2,'#fff3bb');}
 g.restore();
}
function drawEnemy(x,y,e){
 g.save();if(e.tint)g.filter='hue-rotate('+e.tint+'deg)';
 if(e.boss){g.translate(x,266);g.scale(1.45,1.45);g.translate(-x,-266);}
 if(e.type<3){monster(x,y,e);}else{
  const bob=s.phase==='walk'?Math.abs(Math.sin(visualTime*14))*3:0;
  oval(x,266,26,5,'#102a3070');g.save();g.translate(x,y-bob);g.scale(-1,1);
  const swing=s.phase==='walk'?window.HeroMotion.stride(visualTime+1):0;
  if(e.type===5){
   poly([[-5,-10],[-33,-40],[-38,-4],[-20,5]],'#78526a','#273944');
   poly([[4,-10],[25,-37],[30,-1],[15,7]],'#af7068','#273944');
   poly([[-20,9],[-41,19],[-26,18],[-14,13]],'#547d70','#273944');
   limb(-10,10,swing,21,'#6d9684',9);limb(10,10,-swing,21,'#91ab88',9);
   oval(0,0,22,21,'#64927b','#273944');oval(14,-22,16,13,'#8ba77f','#273944');
   poly([[11,-31],[6,-44],[20,-32]],'#dec192','#273944');box(24,-26,16,13,5,'#8ba77f','#273944');oval(37,-23,3,3,'#273944');oval(19,-26,3,3,'#ecc56c');
  }else{
   const skeleton=e.type===4,skin=skeleton?'#d2d1b4':'#7fac72';
   limb(-10,10,swing,21,skeleton?'#d2d1b4':'#7d6553',8);limb(10,10,-swing,21,skeleton?'#d2d1b4':'#7d6553',8);
   box(-18,-22,36,34,5,skeleton?'#47545b':'#79584f','#263c44');
   if(skeleton)for(let i=0;i<3;i++)line([[-13,-15+i*8],[13,-15+i*8]],'#d2d1b4',3);
   oval(0,-35,20,16,skin,'#273944');
   if(!skeleton){poly([[-17,-37],[-30,-45],[-23,-26]],skin,'#273944');poly([[15,-37],[28,-44],[22,-26]],skin,'#273944');}
   oval(-7,-37,4,4,'#283b43');oval(8,-37,4,4,skeleton?'#283b43':'#ecc56c');
   line([[-7,-26],[9,-26]],'#4b4b41',2);
   poly([[22,-5],[31,-38],[37,-30],[28,4]],'#d7d6c1','#273944');box(15,0,17,5,1,'#c7a669');
  }g.restore();
 }
 g.restore();if(e.boss)bossAura(x,e);
}
function monster(x,y,e){
 oval(x,266,e.type===1?31:28,6,'#102a3059');
 const running=s.phase==='walk',swing=running?window.HeroMotion.stride(visualTime+1):0;
 g.save();g.translate(x,y);g.scale(-1,1);
 if(e.type===0){
  g.translate(0,running?-Math.abs(Math.sin(visualTime*14))*11:0);
  g.beginPath();g.moveTo(-27,19);g.quadraticCurveTo(-32,-14,-10,-23);g.quadraticCurveTo(7,-35,23,-13);g.quadraticCurveTo(33,6,27,19);g.quadraticCurveTo(1,27,-27,19);g.closePath();g.fillStyle='#76b9a2';g.fill();g.strokeStyle='#28575b';g.lineWidth=2;g.stroke();
  oval(-8,-12,10,5,'#bde7c4');oval(-15,-8,3,3,'#eaf4d1');oval(-8,2,3,4,'#203e47');oval(11,2,3,4,'#203e47');
  line([[-2,11],[3,13],[8,10]],'#305866',2);oval(-16,9,5,2,'#5f9e99');oval(17,9,5,2,'#5f9e99');
 }else if(e.type===1){
  // Warm grey wolf with pointed ears, fur, snout and articulated paws.
  g.save();g.translate(-25,-6);g.rotate(swing*.3);poly([[0,0],[-22,-11],[-38,-8],[-19,5]],'#7e919c','#344a5b');g.restore();
  limb(-19,12,swing,20,'#8e9da2',8);limb(18,12,-swing,20,'#b6b5a8',8);
  oval(-1,0,31,20,'#8e9da2','#344a5b');poly([[-24,-7],[-11,-17],[8,-17],[13,-5],[-4,9]],'#b6b5a8');
  poly([[8,-13],[9,-33],[17,-24],[28,-38],[33,-14]],'#8e9da2','#344a5b');
  poly([[12,-29],[15,-22],[11,-20]],'#c9a18a');poly([[26,-32],[28,-23],[23,-21]],'#c9a18a');
  oval(22,-13,16,16,'#a4b0b0','#344a5b');box(27,-12,18,12,5,'#d0c7ad','#344a5b');oval(43,-8,4,4,'#2a3c4b');
  line([[13,-18],[21,-15]],'#344a5b',3);oval(21,-12,2.5,3,'#e5ba73');oval(22,-12,1.2,2.5,'#243e4c');
  line([[30,-1],[40,-2]],'#344a5b',2);poly([[32,-1],[35,5],[38,-2]],'#f2e7c6');
 }else{
  limb(-15,12,swing*.65,21,'#83948f',15);limb(15,12,-swing*.65,21,'#a9b5a1',15);
  g.save();g.translate(-25,-18);g.rotate(-swing*.5);box(-16,0,17,37,5,'#82948f','#344b4e');line([[-13,6],[-5,13],[-11,22]],'#bfc6ac',2);g.restore();
  g.save();g.translate(25,-18);g.rotate(swing*.5);box(0,0,17,37,5,'#9daaa0','#344b4e');g.restore();
  poly([[-23,-31],[-12,-40],[16,-38],[25,-24],[21,15],[-21,15]],'#9daaa0','#344b4e');
  poly([[-23,-31],[-12,-40],[0,-35],[-4,9],[-21,15]],'#7a908b');
  box(-19,-53,38,31,6,'#a9b5a1','#344b4e');line([[-13,-49],[-3,-44],[-8,-36],[-2,-30]],'#596f6c',2);
  box(-11,-41,8,4,1,'#efc770');box(6,-41,8,4,1,'#efc770');line([[-7,-30],[9,-30]],'#405657',3);
  poly([[-3,-13],[3,-19],[8,-11],[3,-3]],'#e5bf72','#6c7f70');line([[10,-20],[16,-14],[11,-7],[17,5]],'#607a73',2);
  oval(-16,-51,6,3,'#6b8e6c');oval(12,-52,5,3,'#7e9d6c');
 }
 g.restore();
}
function landscape(){
 if(s.stage>0){
  if(!atlasArt)atlasArt=art('assets/journey-atlas.webp',1932,814);
  if(atlasArt.ready){journeyLandscape();return;}
 }
 if(!forestArt.ready){vectorLandscape();return;}
 // Pan inside the panorama: no repeated moon, seam or jump at a tile boundary.
 const progress=Math.max(0,Math.min(1,s.x/E.goal(s)));
 g.drawImage(forestArt.image,253*(s.stage===2?1-progress:progress),0,1689,809,0,0,800,340);
 const zone=E.zone(s);if(zone){
  const shades=['#8ca35608','#2b734a22','#9eaaaf15','#af986e15','#9dd4f92b','#cc65212a','#80457b20','#452b7133','#471a633d'];
  rect(0,0,800,340,shades[s.stage===2?8-zone.index:zone.index]);
 }
 // The nearest details move faster than the forest to give the road depth.
 for(let i=0;i<18;i++){
  const x=((i*59-s.x*.85)%1062+1062)%1062-65;
  if(i%3===0){oval(x,290+i%2*12,5,2,'#373e4499');oval(x-1,289+i%2*12,4,1.5,'#b3a58b99');}
  if(i%2===0){line([[x,322],[x-5,314],[x-3,323],[x+5,313]],'#244d44',2);}
 }
 for(let i=0;i<7;i++){
  const x=((i*139-s.x*.25)%973+973)%973-25;
  oval(x,170+(i*29)%65+Math.sin(visualTime*.9+i)*3,1.2,1.2,'#f0d080b0');
 }
}
function journeyLandscape(){
 const zone=E.zone(s),realm=V.realm(s.stage,zone.index),theme=V.THEMES[realm],progress=V.zoneProgress(s.x,zone.index);
 function panel(index,p){const crop=V.crop(index,1932,814,p,s.stage===2);g.drawImage(atlasArt.image,crop.sx,crop.sy,crop.sw,crop.sh,0,0,800,340);}
 panel(realm,progress);
 // A distance-based dissolve avoids jumping or using wall-clock catch-up after pause.
 const blend=Math.min(1,Math.max(0,(s.x-zone.index*5000)/120));
 if(!gentle&&zone.index>0&&blend<1){g.save();g.globalAlpha=1-blend;panel(V.realm(s.stage,zone.index-1),1);g.restore();}
 // Small foreground details scroll faster than the distant panorama.
 for(let i=0;i<14;i++){
  const x=((i*67-s.x*.85)%938+938)%938-45;
  oval(x,290+i%3*13,4+i%2,1.5,theme.road+'55');
 }
 if(!gentle)for(let i=0;i<14;i++){
  const x=(i*137+Math.sin(visualTime*.6+i)*18)%800;
  const drift=theme.particle==='snow'?visualTime*17:theme.particle==='ember'?-visualTime*22:visualTime*4;
  const y=((i*37+drift)%240+240)%240+35;
  if(theme.particle==='snow'){line([[x-2,y],[x+2,y]],'#eaf8fc99',1);line([[x,y-2],[x,y+2]],'#eaf8fc99',1);}
  else oval(x,y,theme.particle==='petal'?2.2:1.2,theme.particle==='petal'?1:1.2,theme.color+'99');
 }
 if(s.stage===2){rect(0,0,800,340,'#30234616');}
}
function bossAura(x,e){
 const theme=V.THEMES[V.realm(s.stage,e.zone)],pulse=gentle?0:Math.sin(visualTime*3)*2;
 oval(x,266,44+pulse,9,theme.color+'20',theme.color+'66');
 for(let i=0;i<4;i++){const angle=visualTime*.6+i*Math.PI/2;oval(x+Math.cos(angle)*39,244+Math.sin(angle)*15,2,2,theme.color);}
 // Each boss carries its realm's sigil, not a floating generic crown.
 const top=e.type===3||e.type===4?157:e.type===1?178:e.type===5?176:184;
 poly([[x-12,top],[x-14,top-13],[x-6,top-9],[x,top-19],[x+6,top-9],[x+14,top-13],[x+12,top]],theme.color,'#625041');
 if(e.type===3||e.type===4){line([[x-28,204],[x-35,244]],theme.color,4);line([[x+28,204],[x+35,244]],theme.color,4);}
}
function vectorLandscape(){
 rect(0,0,800,340,'#1d354b');rect(0,126,800,80,'#294757');
 for(let i=0;i<20;i++)oval((i*97+43)%800,20+(i*41)%108, i%4===0?1.4:.8,i%4===0?1.4:.8,'#e4d5ad94');
 oval(666,58,47,47,'#e9d6a20a');oval(666,58,36,36,'#e9d6a213');oval(666,58,27,27,'#f0dda8');oval(657,52,5,5,'#cbbd902e');oval(677,66,3,3,'#cbbd9040');
 for(let i=-1;i<6;i++){const x=i*210-s.x*.08;poly([[x-130,208],[x-10,102+(i%2)*20],[x+130,208]],'#345364');poly([[x-10,102+(i%2)*20],[x+30,145],[x+3,137],[x-19,145]],'#718a8a');}
 for(let i=0;i<10;i++){const x=((i*114-s.x*.22)%1140+1140)%1140-80;pine(x,205,60+i%3*13,true);}
 rect(0,207,800,62,'#32584d');
 for(let i=0;i<7;i++){const x=((i*160-s.x*.48)%1120+1120)%1120-110;pine(x,224,106+i%2*26,false);}
 rect(0,250,800,90,'#7d7659');rect(0,250,800,9,'#b8a77a');rect(0,267,800,73,'#8a7d5f');
 for(let i=0;i<23;i++){
  const x=((i*47-s.x)%1081+1081)%1081-50;
  oval(x,294+i%3*13,10+i%4,2,'#bbab7a54');
  line([[x,253],[x-4,247],[x-3,254],[x+3,246]],'#73946b',2);
  if(i%5===0){oval(x+7,252,3,2,'#e1c285');}
 }
}
function render(){
 landscape();
 if(s.lastDeath>0){const x=185+s.lastDeath-s.x;if(x>-20&&x<820){box(x-2,207,4,60,2,'#d6b780');poly([[x+2,208],[x+26,214],[x+2,223]],'#b86964','#643e45');g.fillStyle='#edd8ad';g.font='12px system-ui';g.fillText('前回',x-12,195);}}
 const goalX=185+E.goal(s)-s.x;if(goalX<870){
  box(goalX+12,158,66,106,3,'#78928c','#344b4e');box(goalX,135,21,129,3,'#8ea49a','#344b4e');box(goalX+68,135,21,129,3,'#8ea49a','#344b4e');
  for(let i=0;i<3;i++){box(goalX+i*8,127,6,14,1,'#acb6a0');box(goalX+68+i*8,127,6,14,1,'#acb6a0');}
  box(goalX+30,213,31,51,14,'#263e46','#b3baa0');box(goalX+37,180,10,18,4,'#f2d597');box(goalX+6,151,8,15,3,'#f2d597');box(goalX+75,151,8,15,3,'#f2d597');
  line([[goalX+10,127],[goalX+10,105]],'#dacba2',3);poly([[goalX+11,105],[goalX+38,108],[goalX+11,119]],'#c77d73');
  g.fillStyle='#f1dcac';g.font='bold 12px system-ui';g.fillText('GOAL',goalX+24,147);
 }
 const e=E.enemies(s)[s.index];if(e){const x=window.HeroMotion.enemyX(s,e);if(x<870){drawEnemy(x,231,e);g.fillStyle='#edf0da';g.font='bold 12px system-ui';g.textAlign='center';g.fillText((e.boss?'BOSS · ':'')+e.name,x,e.boss?116:160);g.textAlign='left';if(s.phase==='fight'){box(x-30,e.boss?124:169,60,5,2,'#182e3a');box(x-30,e.boss?124:169,60*s.enemyHP/e.hp,5,2,'#dca07f');}}}
 if(s.stage>0){const gear=E.equipment(s,'weapon');if(gear.index>=0){const color=V.gearColor(gear.index);oval(window.HeroMotion.HERO_X,266,28,5,color+'33');}}
 hero(window.HeroMotion.HERO_X,230);
 if(e&&e.boss&&s.phase==='fight'){const color=V.THEMES[V.realm(s.stage,e.zone)].color;box(216,16,368,48,10,'#142534dd',color+'66');g.fillStyle=color;g.font='bold 13px system-ui';g.textAlign='center';g.fillText((s.stage===2?'覚醒 BOSS · ':'区間 BOSS · ')+e.name,400,36);box(234,45,332,7,3,'#070e19');box(234,45,332*s.enemyHP/e.hp,7,3,color);g.textAlign='left';}
 if(paused||s.phase==='won'){rect(0,0,800,340,'#132031bd');g.fillStyle='#f0d8a2';g.textAlign='center';g.font='bold 30px system-ui';g.fillText(paused?'一時停止中':s.stage===2?'往復、踏破。':'勇者、ゴールへ。',400,161);g.font='16px system-ui';g.fillText(paused?'下の「再開する」で続けられます':s.stage<2?'下のボタンから、次のステージへ':'装備は、次の冒険にも残ります。',400,198);g.textAlign='left';}
}
by('start').addEventListener('click',()=>{paused=false;E.play(s);last=0;accumulator=0;update();});
by('stop').addEventListener('click',()=>{E.stop(s);paused=false;last=0;accumulator=0;update();});
for(let i=0;i<3;i++)by('stage-'+i).addEventListener('click',()=>{if(E.select(s,i)){paused=false;last=0;accumulator=0;update();}});
by('pause').addEventListener('click',()=>{if(document.hidden)return;paused=!paused;last=0;update();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['walk','fight','fallen'].includes(s.phase)){paused=true;last=0;save();update();}});
window.addEventListener('pagehide',save);
for(const value of [1,2,4])by('speed-'+value).addEventListener('click',()=>{
 speed=value;last=0;
 for(const option of [1,2,4])by('speed-'+option).setAttribute('aria-pressed',String(option===speed));
});

function frame(now){const dt=last?Math.min(.1,Math.max(0,(now-last)/1000)):0;last=now;if(!paused&&!document.hidden){accumulator=Math.min(.4,accumulator+dt*speed);
 // Fixed simulation ticks keep battle outcomes identical at each playback speed.
 for(let ticks=0;accumulator>=1/60-1e-9&&ticks<24;ticks++){E.step(s,1/60);accumulator=Math.max(0,accumulator-1/60);visualTime+=1/60;}}update();render();requestAnimationFrame(frame);}
update();render();requestAnimationFrame(frame);
})();
