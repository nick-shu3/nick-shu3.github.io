'use strict';
(()=> {
const E=window.HeroAgain,V=window.HeroScenery,M=window.HeroMotion,by=id=>document.getElementById(id),canvas=by('scene'),g=canvas.getContext('2d'),KEY='shu3.hero-again.v1';
const B=window.HeroBosses,bossImages=B?B.load():null;
const N=window.HeroEnemies,enemyImages=N?N.load():null;
const L=window.HeroLandscapes,landscapeImages=L?L.load():null;
let bossActor='',bossEntered=0,bossAttackUntil=0,bossPreviousHP=0;
let saved=null,storageOK=true,backupRaw='';
const gentle=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)').matches:false;
let atlasArt=null,gearStamp='',recapStage=-1,recapProgress=0,growthAge=0,lastGear=null,lastResist='',lastStage=-1,lastNoticeSerial=-1,lastGearStats=null;
const CHAPTER_RECAP=[['旅立ちの一歩','倒れても装備は残る。小さな一歩を重ね、勇者は遠い討伐の旅へ出発します。'],['討伐完了、故郷へ','魔王を討ち、旅の目的を果たしました。しかし魔力は高まり、帰路の魔物は強化されています。残した装備を頼りに、故郷へ帰りましょう。'],['ただいま、勇者','長い往復を終え、故郷の灯りに帰り着きました。めでたし、めでたし……この足元に潜む異変を、勇者はまだ知りません。'],['光の出口、その先へ','熱と岩盤、水音と植物の根を越え、地上へ戻りました。けれど階段は終わらず、今度は雲の向こうへ続いています。'],['青い世界の輪郭','雲を眼下に置き、成層圏へ到達しました。上空では寒さが少し和らいでも、空気は薄いまま。ここから下り切れば、本当のゴールです。'],['おかえり。冒険は達成です。','終門の王を倒し、故郷へ帰還しました。通常クリア成立です。ここで旅を終えても大丈夫。刻印に隠された黒幕への挑戦は、任意の追加目標です。'],['記録の輪を越えて','環の書記官を倒し、永遠の試練から自由になりました。装備と旅の記録を残して、勇者は自分の道を歩き始めます。']];
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=32768){saved=JSON.parse(raw);if(saved&&typeof saved==='object'&&!Array.isArray(saved)&&!saved.expedition)backupRaw=raw;}}catch(_){storageOK=false;}
const s=E.create(saved);let paused=s.stage>=3&&['walk','fight','fallen','falling'].includes(s.phase),last=0,seen=-1,lastSave='',visualTime=0,speed=1,accumulator=0;
function save(){if(E.checkpoint)E.checkpoint(s);const value=JSON.stringify(s.saved);if(value===lastSave)return;try{if(backupRaw){if(!localStorage.getItem(KEY+'.before-expedition'))localStorage.setItem(KEY+'.before-expedition',backupRaw);backupRaw='';}localStorage.setItem(KEY,value);lastSave=value;}catch(_){storageOK=false;by('save-note').textContent='保存できません。この画面を開いている間だけ記録が残ります。';}}
if(!storageOK)by('save-note').textContent='保存を読み込めませんでした。新しい冒険として開始します。';
function number(value){return Math.round(value).toLocaleString('ja-JP');}
function distance(value){return s.stage===0?number(value)+'m':(value/1000).toFixed(3)+'km';}
function distanceResult(n){return (n/1000).toLocaleString('ja-JP',{maximumFractionDigits:3})+'km';}
function update(){
 let clearScroll=false;
 const view=M.layout(s.stage);canvas.setAttribute('aria-label',view.stairs?(s.stage===5?'勇者が左下へ階段を降り、左から来る魔物と戦う風景':'勇者が右上へ階段を登り、右から来る魔物と戦う風景'):view.direction<0?'勇者が左へ帰路を進み、左から来る魔物と戦う風景':'勇者が右へ進み、魔物と戦う横スクロールの風景');
 const st=E.stats(s),active=['walk','fight','fallen','falling'].includes(s.phase),zone=E.zone(s),hiddenRoute=s.stage>=3;
 by('chapter-clear').hidden=s.phase!=='won';
 if(s.phase==='won'){
  if(recapStage!==s.stage){recapStage=s.stage;recapProgress=gentle?1:0;clearScroll=true;}
  const recap=CHAPTER_RECAP[s.stage];by('clear-title').textContent=recap[0];by('clear-story').textContent=recap[1];
  by('clear-distance').textContent=(E.goal(s)/1000*recapProgress).toLocaleString('ja-JP',{minimumFractionDigits:3,maximumFractionDigits:3})+' km';
  by('clear-distance-final').textContent='この章で '+(E.goal(s)/1000).toLocaleString('ja-JP',{maximumFractionDigits:3})+'km 走破';
 }else{recapStage=-1;recapProgress=0;}
 by('progress').hidden=hiddenRoute;by('environment-panel').hidden=!hiddenRoute;
 by('environment').textContent=E.environment?E.environment(s):'';by('resistance').textContent=E.gearEffects?E.gearEffects(s):'';by('stamina').textContent=number(s.stamina||0);
 const result=E.result?E.result(s):null;by('ending-panel').hidden=!result;
 if(result)by('ending-result').textContent=[result.trueClear?'真のエンディング':'通常クリア', '入門 '+distanceResult(result.tutorial),'マラソン往復 '+distanceResult(result.marathon),'落下 '+distanceResult(result.fall),'地底から空への登坂 '+distanceResult(result.ascent),'空からの下降 '+distanceResult(result.descent),'刻印の向こう '+distanceResult(result.secret),'物語の踏破経路合計 '+distanceResult(result.total),'記録開始後の総移動 '+distanceResult(result.totalRecorded),'記録開始後の実歩行（再挑戦含む） '+distanceResult(result.walkRecorded),'活動時間（実時間） '+Math.floor(result.playSeconds/60)+'分 '+Math.floor(result.playSeconds%60)+'秒','記録開始後の撃破 '+number(result.kills)+'体 ／ 死亡 '+number(result.deaths)+'回','ラスボス：撃破 ／ 黒幕：'+(result.trueClear?'撃破':'未撃破'),result.historical?'更新前の活動時間・実歩行・撃破・死亡履歴は復元できません。':''].join('\n');
 by('hp').textContent=number(s.hp)+' / '+number(st.maxHP);by('health').max=st.maxHP;by('health').value=s.hp;
 by('distance').textContent=hiddenRoute?(s.phase==='falling'?'落下中 ／ ゴール ？km':'現在 '+distance(s.x)+' ／ ゴール ？km'):distance(s.x)+' / '+distance(E.goal(s));by('progress').max=hiddenRoute?1:E.goal(s);by('progress').value=hiddenRoute?0:s.x;
 by('level').textContent=s.level;by('attack').textContent=number(st.attack);by('defense').textContent=number(st.defense);by('xp').textContent=(2-s.kills%2)+'体';
 const gears=['weapon','armor'].map(key=>E.equipment(s,key));
 for(let i=0;i<2;i++)by(i===0?'weapon':'armor').textContent=gears[i].name+' +'+gears[i].level;
 const resist=s.saved.expedition?JSON.stringify(s.saved.expedition.resist):'';
 if(lastStage!==s.stage){lastGear=null;lastResist=resist;lastStage=s.stage;by('growth-notice').textContent='';by('defeat-note').textContent='';growthAge=0;}
 const changes=[];
 if(lastGear)for(let i=0;i<2;i++)if(gears[i].name!==lastGear[i].name||gears[i].level!==lastGear[i].level)changes.push((i?'防具':'武器')+'更新：'+gears[i].name+' +'+gears[i].level+' ／ '+(i?'防御力 ':'攻撃力 ')+number(lastGearStats[i?'defense':'attack'])+' → '+number(st[i?'defense':'attack']));
 if(lastResist&&resist!==lastResist&&s.stage>=3)changes.push('環境への備えが成長しました。軽減効果は「環境への備え」で確認できます。');
 if(changes.length){by('growth-notice').textContent=changes.join(' ／ ');growthAge=5;}
 lastGear=gears.map(item=>({...item}));lastResist=resist;lastGearStats={attack:st.attack,defense:st.defense};
 if(s.phase==='fallen'&&lastNoticeSerial!==s.serial){lastNoticeSerial=s.serial;by('defeat-note').textContent='前回の敗因：'+(s.stage>=1?s.event:'敵の反撃でHPがなくなりました。装備を育てて再挑戦しましょう。');}
 const stamp=gears.map(g=>g.name+':'+g.index+':'+g.level).join('|');if(stamp!==gearStamp){gearStamp=stamp;gears.forEach((gear,i)=>gearIcon(i===0?'weapon':'armor',gear));}
 by('attempt').textContent='挑戦 '+E.record(s,'attempts')+'回目';by('best').textContent=hiddenRoute?'最長 '+distance(s.saved.expedition.route[s.stage-3]):'最長 '+distance(E.record(s,'best'));by('wins').textContent='踏破 '+E.record(s,'wins')+'回';
 by('phase').textContent=paused?'一時停止中':({ready:'出発の準備',walk:'ゴールを目指して',fight:'魔物と戦闘中',fallen:'次の勇者へ…',falling:'足元が崩れた！',won:'ゴール到達！'})[s.phase];
 by('pause').disabled=!active;by('pause').textContent=paused?'再開する':'一時停止';by('stop').disabled=!active;
 by('start').disabled=!['ready','won'].includes(s.phase);by('start').textContent=s.phase==='won'?(s.stage===0?'往路42.195kmへ進む':s.stage===1?'討伐を終えて、帰路につく':s.stage===2?'めでたし、めでたし…':s.stage===3?'空へ続く階段へ':s.stage===4?'最後の下り階段へ':s.stage===5?'追加目標：黒幕に挑む（任意）':'装備を引き継いでもう一度'):'冒険をはじめる';
 for(let i=0;i<(E.ZONES_EXTRA?7:3);i++){if(i>=3)by('stage-'+i).hidden=i>E.unlocked(s);by('stage-'+i).disabled=active||i>E.unlocked(s);by('stage-'+i).setAttribute('aria-pressed',String(i===s.stage));}
 by('stage-guide').textContent=E.STAGES[s.stage]+' ／ '+(hiddenRoute?'現在距離と区間番号を表示。ゴールと区間総数は未知。':(E.unlocked(s)===0?'入門クリアで往路が解放。':E.unlocked(s)===1?'往路クリアで裏・復路が解放。':'往路・復路ともに解放済み。'));
 const localZones=hiddenRoute?E.ZONES_EXTRA.filter(z=>z.stage===s.stage):[],localIndex=hiddenRoute?localZones.findIndex(z=>z.rank===zone.rank)+1:0;
 by('route-history').hidden=!hiddenRoute||s.phase==='falling';
 if(hiddenRoute){const completed=localZones.filter(z=>s.saved.expedition.bosses[z.rank-18]);by('completed-sections').textContent=completed.length?completed.map(z=>'区間'+(localZones.indexOf(z)+1)+' · '+z.name+'：'+distance(z.end-z.begin)+' 踏破').join('\n'):'踏破済みの区間はまだありません。';}
 by('zone').textContent=zone?(hiddenRoute?(s.phase==='falling'?'崩れた足元':'区間'+localIndex+' · '+zone.name):'区間'+(zone.index+1)+' / 9 · '+zone.name):'チュートリアル';
 by('boss-distance').textContent=hiddenRoute?zone.hint:zone?zone.boss.name+'まで '+distance(Math.max(0,zone.boss.x-s.x)):'ゴールまで '+distance(Math.max(0,E.goal(s)-s.x));
 by('gear-guide').textContent=s.stage===0?'入門では武器か鎧が +1（各 +12 まで）。':'一番強い装備を自動装備。素材で武器・防具を自動強化（各 +200 まで）。';
 by('materials').textContent='強化素材 '+number(s.saved.materials);
 by('guarantee').textContent=hiddenRoute?'環境装備は累計撃破の確定報酬でも育ちます。':zone?'区間撃破 '+number(s.saved.counts[zone.rank])+'体 ／ 次の確定報酬まで '+(5-s.saved.counts[zone.rank]%5)+'体':'往路から装備ドロップが追加されます。';
 if(clearScroll&&typeof by('chapter-clear').scrollIntoView==='function')by('chapter-clear').scrollIntoView({behavior:gentle?'auto':'smooth',block:'start'});
 if(seen!==s.serial){seen=s.serial;by('message').textContent=(s.stage===1&&s.phase==='won'?'討伐を終え、故郷へ帰ります。しかし、魔力の高まりにより帰り道のモンスターが強化されています。':s.event)||'装備は引き継ぎ。レベルと身体能力は、倒れると初期値に戻ります。';save();}
}
function gearIcon(key,gear){
 const c=by(key+'-art').getContext('2d'),color=gear.index>=18?E.ZONES_EXTRA[gear.index-18].color:V.gearColor(gear.index),rare=gear.name.includes('王印'),tier=gear.index<0?0:1+Math.floor(gear.index/3);
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
 if(s.phase!=='falling')oval(x,266,27,6,'#102a3059');
 g.save();g.translate(x,y);
 if(s.phase==='fallen'){g.translate(0,20);g.rotate(-1.3);}
 if(s.phase==='falling'&&!gentle)g.rotate(Math.sin((1-s.timer/5)*Math.PI*3)*.22);
 g.drawImage(frame.asset.image,frame.sx,frame.sy,frame.sw,frame.sh,-frame.ax*scale,36-frame.feet*scale+bob,frame.sw*scale,frame.sh*scale);
 if(s.flash){line([[40,-35],[51,-25],[57,-13]],'#f8dc93',3);}
 g.restore();
}
function vectorHero(x,y){
 const running=s.phase==='walk',swing=running?window.HeroMotion.stride(visualTime):0;
 if(s.phase!=='falling')oval(x,266,27,6,'#102a3059');y+=running?-Math.abs(Math.sin(visualTime*14))*3:0;
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
 if(B&&B.draw(g,bossImages,e,x,visualTime-bossEntered,visualTime,Math.max(0,bossAttackUntil-visualTime),gentle,Math.min(174,(M.groundY(s.stage,x)-82)/1.03-8)))return;
 if(N&&N.draw(g,enemyImages,e,x,s.stage,visualTime,s.phase,Math.max(0,bossAttackUntil-visualTime),gentle))return;
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
function enemyDetails(x,e){
 if(s.stage<3||(B&&B.design(e)&&bossImages[B.design(e).file].ready))return;
 const normal=N&&N.variant(e,s.stage);if(normal&&enemyImages[normal.sheet].ready)return;
 const z=E.ZONES_EXTRA[e.rank-18],pulse=gentle?0:Math.sin(visualTime*3)*2;
 g.save();if(e.boss){g.translate(x,266);g.scale(1.45,1.45);g.translate(-x,-266);}
 if(z.env[0]>.5){
  for(let i=0;i<3;i++){const dx=x-22+i*20;poly([[dx,209],[dx-10,190],[dx+4,194],[dx+10,214]],'#66333a',z.color);line([[dx,204],[dx+5,216],[dx-2,229]],'#ffd08a',2);}
 }else if(z.env[1]>.5){
  for(let i=0;i<4;i++){const dx=x-27+i*17;poly([[dx-6,211],[dx,181-i%2*10],[dx+7,211]],'#9ed6e6','#e2f7f4');}
 }else if(s.stage===4||s.stage===5){
  poly([[x-25,223],[x-56,191],[x-45,229],[x-25,239]],'#cadce5',z.color);poly([[x+25,223],[x+56,191],[x+45,229],[x+25,239]],'#819cb9',z.color);
 }else{
  for(let i=0;i<3;i++)poly([[x-28+i*24,221],[x-21+i*24,200],[x-10+i*24,227]],'#687b78',z.color);
 }
 oval(x,237,7+pulse*.2,7+pulse*.2,z.color+'88', '#f4e8c5');line([[x-4,237],[x+4,237]],'#f9e9ba',1);
 if(e.boss){for(let i=0;i<3;i++){g.beginPath();g.arc(x,224,42+i*8,Math.PI*1.15,Math.PI*1.85);g.strokeStyle=z.color+(i?'44':'aa');g.lineWidth=2;g.stroke();}}
 g.restore();
}
function realmDetails(z,position){
 const drift=gentle?0:visualTime;
 if(s.stage===3){
  if(z.env[0]>.5){for(let i=0;i<5;i++){const x=i*175+30;poly([[x,340],[x+25,195+i%2*30],[x+53,220],[x+85,340]],'#221b28');line([[x+30,223],[x+43,267],[x+32,309]],'#ef915277',3);}line([[0,316],[140,300],[270,319],[470,303],[800,315]],'#f28e5344',9);}
  else if(z.name.includes('水')){for(let i=0;i<6;i++){const x=i*141+35;poly([[x-20,248],[x,190],[x+20,248]],'#4a8b99','#9bd8de77');oval(x,307,55,4,'#81c7d144');}for(let i=0;i<4;i++)line([[i*220+35,75],[i*220+38,205]],'#89d6e088',2);}
  else{for(let i=0;i<5;i++){const x=i*180+20;line([[x,10],[x+17,76],[x-8,151]],'#638d6399',6);for(let j=0;j<3;j++)oval(x+7+j*9,80+j*14,12,5,'#83b87966');}}
 }else if(s.stage===4||s.stage===5){
  const high=s.stage===4?s.x>11000:s.x<19000;
  if(high){for(let i=0;i<34;i++){const x=(i*173+29)%800,y=(i*53+17)%125;oval(x,y,i%5? .7:1.2,i%5?.7:1.2,'#dfedf477');}g.beginPath();g.ellipse(400,415,470,215,0,Math.PI,Math.PI*2);g.strokeStyle='#bde5eb66';g.lineWidth=7;g.stroke();}
  for(let i=0;i<7;i++){const x=((i*155-drift*(s.stage===5?-9:4))%1100+1100)%1100-130,y=high?225+i%3*14:150+i%3*25;oval(x,y,90,18,'#edf4f144');oval(x+45,y-9,45,15,'#edf4f133');}
  if(s.stage===5&&z.name.includes('故郷')){
   for(let i=0;i<11;i++){const x=30+i*66,y=206+i%3*9;box(x,y,22,15,2,'#52656a');rect(x+6,y+5,3,4,'#f2d497');rect(x+14,y+5,3,4,'#f2d497');}
   poly([[315,269],[335,174],[380,145],[425,174],[443,269]],'#313f4d','#d6ba79');oval(379,188,13,13,'#caaa6944','#dec892');
  }
  if(s.stage===5&&s.phase==='walk'&&!gentle){for(let i=0;i<6;i++){const x=(i*157+drift*90)%880-40,y=82+i*24;line([[x,y],[x+35,y-3]],'#edf3e52b',1);}}
 }
}
function landscape(){
 if(s.stage>=3){expeditionLandscape();return;}
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
  const x=((i*59-s.x*M.layout(s.stage).direction*.85)%1062+1062)%1062-65;
  if(i%3===0){oval(x,290+i%2*12,5,2,'#373e4499');oval(x-1,289+i%2*12,4,1.5,'#b3a58b99');}
  if(i%2===0){line([[x,322],[x-5,314],[x-3,323],[x+5,313]],'#244d44',2);}
 }
 for(let i=0;i<7;i++){
  const x=((i*139-s.x*M.layout(s.stage).direction*.25)%973+973)%973-25;
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
  const x=((i*67-s.x*M.layout(s.stage).direction*.85)%938+938)%938-45;
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
 const theme=s.stage>=3?E.ZONES_EXTRA[e.rank-18]:V.THEMES[V.realm(s.stage,e.zone)],pulse=gentle?0:Math.sin(visualTime*3)*2;
 oval(x,266,44+pulse,9,theme.color+'20',theme.color+'66');
 for(let i=0;i<4;i++){const angle=visualTime*.6+i*Math.PI/2;oval(x+Math.cos(angle)*39,244+Math.sin(angle)*15,2,2,theme.color);}
 // Each boss carries its realm's sigil, not a floating generic crown.
 const top=e.type===3||e.type===4?157:e.type===1?178:e.type===5?176:184;
 poly([[x-12,top],[x-14,top-13],[x-6,top-9],[x,top-19],[x+6,top-9],[x+14,top-13],[x+12,top]],theme.color,'#625041');
 if(e.type===3||e.type===4){line([[x-28,204],[x-35,244]],theme.color,4);line([[x+28,204],[x+35,244]],theme.color,4);}
}
function vectorLandscape(){
 const travel=s.x*M.layout(s.stage).direction;
 rect(0,0,800,340,'#1d354b');rect(0,126,800,80,'#294757');
 for(let i=0;i<20;i++)oval((i*97+43)%800,20+(i*41)%108, i%4===0?1.4:.8,i%4===0?1.4:.8,'#e4d5ad94');
 oval(666,58,47,47,'#e9d6a20a');oval(666,58,36,36,'#e9d6a213');oval(666,58,27,27,'#f0dda8');oval(657,52,5,5,'#cbbd902e');oval(677,66,3,3,'#cbbd9040');
 for(let i=-1;i<6;i++){const x=i*210-travel*.08;poly([[x-130,208],[x-10,102+(i%2)*20],[x+130,208]],'#345364');poly([[x-10,102+(i%2)*20],[x+30,145],[x+3,137],[x-19,145]],'#718a8a');}
 for(let i=0;i<10;i++){const x=((i*114-travel*.22)%1140+1140)%1140-80;pine(x,205,60+i%3*13,true);}
 rect(0,207,800,62,'#32584d');
 for(let i=0;i<7;i++){const x=((i*160-travel*.48)%1120+1120)%1120-110;pine(x,224,106+i%2*26,false);}
 rect(0,250,800,90,'#7d7659');rect(0,250,800,9,'#b8a77a');rect(0,267,800,73,'#8a7d5f');
 for(let i=0;i<23;i++){
  const x=((i*47-travel)%1081+1081)%1081-50;
  oval(x,294+i%3*13,10+i%4,2,'#bbab7a54');
  line([[x,253],[x-4,247],[x-3,254],[x+3,246]],'#73946b',2);
  if(i%5===0){oval(x+7,252,3,2,'#e1c285');}
 }
}
function homeLandmark(){
 for(let i=0;i<3;i++){const x=(s.stage===5?70:510)+i*85,y=229-i%2*16;box(x,y,66,45,3,'#c5b493','#536355');poly([[x-8,y],[x+33,y-31],[x+74,y]],'#91646b','#493e4d');box(x+24,y+21,18,24,3,'#485f62');box(x+8,y+8,12,12,2,'#f1daa0');}
}
function expeditionLandscape(){
 if(s.stage===6&&s.phase==='won'){if(!(L&&L.draw(g,landscapeImages,6,34,1,true))){rect(0,0,800,340,'#849cae');oval(655,88,38,38,'#efd49d');rect(0,210,800,130,'#94a681');homeLandmark();}return;}
 const z=E.zone(s),position=Math.max(0,Math.min(1,(s.x-z.begin)/(z.end-z.begin)));
 const illustrated=L&&L.draw(g,landscapeImages,s.stage,z.rank,position,false);
 if(!illustrated){
 rect(0,0,800,340,z.sky);const prev=E.ZONES_EXTRA[z.index-1];
 if(prev&&prev.stage===s.stage&&position<.08&&!gentle){g.save();g.globalAlpha=1-position/.08;rect(0,0,800,340,prev.sky);g.restore();}
 if(s.stage===3){
  for(let i=0;i<12;i++){const x=(i*89+31)%800;poly([[x-80,0],[x-22,70+(i%3)*35],[x+36,35],[x+80,0]],z.floor);}
  if(z.index<3){for(let i=0;i<10;i++){const x=(i*103+visualTime*9)%800;oval(x,140+(i*23)%100,2,2,z.color+'99');}oval(570,190,80,20,z.color+'44');}
  else if(z.index===3){for(let i=0;i<8;i++)line([[i*113,110],[i*113+10,225]],'#91cdd766',2);}
  else{for(let i=0;i<9;i++)line([[i*104,0],[i*104-15,100],[i*104+12,145]],'#649665',4);oval(640,88,z.index===5?72:28,z.index===5?72:28,'#f3edc05c');}
 }else if(s.stage===6){for(let i=0;i<4;i++){g.beginPath();g.arc(580,145,40+i*24,0,Math.PI*2);g.strokeStyle=z.color+'44';g.lineWidth=2;g.stroke();}}
 else{
  const altitude=s.stage===4?s.x:30000-s.x;
  if(altitude>19000){oval(420,1520,1450,1390,'#559da8','#abcdd7');oval(400,1415,1350,1250,'#346f87');}
  for(let i=0;i<9;i++){const x=((i*131-visualTime*5)%970+970)%970-60,y=altitude>8000?190+i%3*18:70+i%3*25;oval(x,y,74,18,'#e4eff155');}
  if(altitude<8000)for(let i=0;i<5;i++)poly([[i*230-90,250],[i*230+30,130],[i*230+130,250]],'#668b82');
  if(z.env[1]>.5&&!gentle)for(let i=0;i<20;i++)oval((i*73)%800,((i*39+visualTime*20)%250),1,1,'#eaf5ed99');
 }
 realmDetails(z,position);
 }else{
  if(position<.08&&!gentle){const prev=E.ZONES_EXTRA[z.index-1];if(prev&&prev.stage===s.stage){g.save();g.globalAlpha=1-position/.08;L.draw(g,landscapeImages,s.stage,prev.rank,1,false);g.restore();}}
  // Quiet foreground particles retain motion without obscuring painted scenery.
  for(let i=0;i<12;i++){const x=((i*127+(gentle?0:visualTime*8))%900)-50,y=80+(i*43)%160;oval(x,y,i%3?1:1.7,i%3?1:1.7,z.color+'66');}
 }
 const view=M.layout(s.stage);
 if(view.stairs){
  // Physical staircase geometry follows the same actor ground line.
  poly([[0,M.groundY(s.stage,0)+18],[800,M.groundY(s.stage,800)+18],[800,M.groundY(s.stage,800)+30],[0,M.groundY(s.stage,0)+30]],'#1b202c');
  const offset=((z.index+position)*900)%40;
  for(let i=-1;i<22;i++){
   const x=i*40-view.direction*offset,y=M.groundY(s.stage,x),tint=i%2?z.floor:'#49545d';
   poly([[x,y],[x+40,y],[x+40,y+15],[x,y+18]],tint,'#252b35');
   line([[x,y],[x+40,y],[x+40,y-3.2]],'#e5d9bcb3',2.5);
   line([[x+5,y+7],[x+22,y+5],[x+29,y+10]],'#11192355',1);
   line([[x+2,y+17],[x+38,y+14]],z.color+'44',1);
  }
  for(let i=0;i<6;i++){
   const x=i*170-40-view.direction*offset,y=M.groundY(s.stage,x)+18;
   poly([[x-9,y],[x+14,y-1],[x+24,340],[x-15,340]],'#303744','#141b27');
   line([[x+5,y+7],[x+11,337]],'#c2c4b43a',2);
  }
 }else{
  rect(0,264,800,76,z.floor);line([[0,266],[800,266]],'#e4d9c5aa',3);
  const drift=s.x%100;
  for(let row=0;row<3;row++)for(let col=-1;col<10;col++){
   const x=col*100+row%2*50-drift,y=268+row*25;
   box(x,y,98,23,2,row%2?'#4b435e':'#55506a','#30283f');line([[x+7,y+3],[x+85,y+3]],'#bda2cc33',1);
  }
 }
 if(s.stage===5&&s.phase==='won'){rect(0,0,800,340,'#ebd7a31a');homeLandmark();for(let i=0;i<9;i++)oval(35+i*82,90+i%3*24,2,2,'#f3d492');}
 if(s.phase==='falling'){rect(0,0,800,340,'#100c1ed0');for(let i=0;i<8;i++)line([[i*105,0],[i*105,340]],'#f0ce8544',2);g.fillStyle='#f2d5a1';g.font='bold 20px system-ui';g.textAlign='center';g.fillText('めでたし、めでたし……？',400,95);g.textAlign='left';}
}
function fallScene(){
 const p=Math.max(0,Math.min(1,1-s.timer/5)),fall=Math.max(0,(p-.18)/.82);
 rect(0,0,800,340,p<.18?'#23374a':p>.8?'#321826':'#111526');
 if(p<.22){
  if(forestArt.ready)g.drawImage(forestArt.image,0,0,1689,809,0,0,800,340);else oval(666,58,27,27,'#f0dda8');homeLandmark();
  rect(0,255,800,85,'#655944');
  const opening=Math.min(1,p/.2);oval(400,268,35+opening*175,18+opening*40,'#080c18');
  for(let i=0;i<7;i++){const side=i%2?-1:1,x=400+side*(30+i*22);line([[x,255],[x+side*20,270],[x+side*12,282],[x+side*48,294]],'#161a20',2+opening*2);}
 }
 if(p>.12){
  const reveal=Math.min(1,(p-.12)/.15);g.save();g.globalAlpha=reveal;
  poly([[0,0],[175,0],[230,80],[184,145],[220,230],[170,340],[0,340]],'#39343d');
  poly([[800,0],[625,0],[570,80],[616,145],[580,230],[630,340],[800,340]],'#49353c');
  for(let i=0;i<9;i++){
   const y=((i*57-(gentle?0:fall*940))%430+430)%430-50;
   line([[0,y],[90,y+8],[165,y-4],[211,y+20]],'#74606a',3);
   line([[800,y+13],[710,y+22],[632,y+9],[590,y+31]],'#825a57',3);
   if(!gentle){line([[265+i%3*100,y],[260+i%3*100,y+32]],'#a6b8c433',1);}
  }
  g.restore();
 }
 if(p>.6){g.save();g.globalAlpha=Math.min(1,(p-.6)/.3);oval(400,360,220,85,'#ef70412a');oval(400,350,160,48,'#ec95533d');g.restore();}
 if(!gentle&&p>.18)for(let i=0;i<12;i++){
  const side=i%2?-1:1,x=400+side*(115+(i*37)%140),y=((i*47-fall*700)%400+400)%400-30;
  poly([[x,y],[x+12,y-5],[x+21,y+7],[x+6,y+14]],p>.6?'#bf704b':'#7e6d70','#322e3b');
 }
 const y=p<.18?230+Math.pow(p/.18,2)*18:165+Math.min(1,(p-.18)/.82)*28;
 if(p>.12)oval(400,y-18,64,82,'#72cfc817','#b0eee580');
 hero(400,y);
 rect(160,14,480,60,'#111b2ade');g.fillStyle='#f4ddb0';g.textAlign='center';g.font='bold 20px system-ui';
 g.fillText(p<.18?'めでたし、めでたし……？':p<.82?'足元が崩れた！':'護符が、熱と圧力から守っている。',400,39);
 g.font='14px system-ui';g.fillStyle='#c3d5d7';g.fillText(p<.18?'故郷へ帰った、その瞬間。':p<.82?'光が遠ざかり、岩壁が流れていく。':'闇の底に、上へ続く階段が見える。',400,61);g.textAlign='left';
 if(p>.9){const fade=(p-.9)/.1;g.save();g.globalAlpha=fade;line([[290,300],[360,300],[360,288],[430,288],[430,276],[500,276]],'#edcfa6',4);g.restore();}
}
function facing(x,draw){g.save();if(M.layout(s.stage).direction<0){g.translate(x,0);g.scale(-1,1);g.translate(-x,0);}draw();g.restore();}
function render(){
 if(s.phase==='falling'){fallScene();return;}
 landscape();
 // Long-route artwork has a lower road; move actors, never battle coordinates.
 g.save();if(s.stage>0&&s.stage<3&&atlasArt&&atlasArt.ready)g.translate(0,20);
 if(s.stage<3&&s.lastDeath>0){const x=M.screenX(s.stage,185+s.lastDeath-s.x);if(x>-20&&x<820){box(x-2,207,4,60,2,'#d6b780');poly([[x+2,208],[x+26,214],[x+2,223]],'#b86964','#643e45');g.fillStyle='#edd8ad';g.font='12px system-ui';g.fillText('前回',x-12,195);}}
 const goalX=M.screenX(s.stage,185+E.goal(s)-s.x);if(s.stage<3&&goalX>-100&&goalX<870){
  box(goalX+12,158,66,106,3,'#78928c','#344b4e');box(goalX,135,21,129,3,'#8ea49a','#344b4e');box(goalX+68,135,21,129,3,'#8ea49a','#344b4e');
  for(let i=0;i<3;i++){box(goalX+i*8,127,6,14,1,'#acb6a0');box(goalX+68+i*8,127,6,14,1,'#acb6a0');}
  box(goalX+30,213,31,51,14,'#263e46','#b3baa0');box(goalX+37,180,10,18,4,'#f2d597');box(goalX+6,151,8,15,3,'#f2d597');box(goalX+75,151,8,15,3,'#f2d597');
  line([[goalX+10,127],[goalX+10,105]],'#dacba2',3);poly([[goalX+11,105],[goalX+38,108],[goalX+11,119]],'#c77d73');
  g.fillStyle='#f1dcac';g.font='bold 12px system-ui';g.fillText('GOAL',goalX+24,147);
 }
 const e=E.enemies(s)[s.index];
 const actor=e?[s.stage,s.index,e.name].join(':'):'';
 if(actor!==bossActor){bossActor=actor;bossEntered=-1;bossAttackUntil=0;bossPreviousHP=s.hp;}
 else if(s.phase==='fight'&&s.flash>0&&s.hp<bossPreviousHP)bossAttackUntil=visualTime+.28;
 bossPreviousHP=s.hp;
 if(e){const dedicated=B&&B.design(e),size=N&&N.size(e,s.stage),healthY=size?266-size.height-16:e.boss?124:169,labelY=healthY-9;
 const x=M.sceneEnemyX(s,e)+M.layout(s.stage).direction*(e.boss?55:20),rise=M.groundY(s.stage,x)-266;if(x>-70&&x<870){if(bossEntered<0)bossEntered=visualTime;g.save();g.translate(0,rise);facing(x,()=>{drawEnemy(x,231,e);enemyDetails(x,e);});g.fillStyle='#edf0da';g.font='bold 12px system-ui';g.textAlign='center';if(!dedicated)g.fillText((e.boss?'BOSS · ':'')+e.name,x,labelY);g.textAlign='left';if(!dedicated&&s.phase==='fight'){box(x-30,healthY,60,5,2,'#182e3a');box(x-30,healthY,60*s.enemyHP/e.hp,5,2,'#dca07f');}g.restore();}}
 if(s.stage>0){const gear=E.equipment(s,'weapon');if(gear.index>=0){const color=gear.index>=18?E.ZONES_EXTRA[gear.index-18].color:V.gearColor(gear.index);oval(M.layout(s.stage).heroX,266,28,5,color+'33');}}
 const heroX=M.layout(s.stage).heroX;facing(heroX,()=>hero(heroX,s.phase==='falling'?100+130*s.saved.expedition.fall/E.goal(s):230));drawDamage();g.restore();
 if(e&&e.boss&&s.phase==='fight'){const color=s.stage>=3?E.ZONES_EXTRA[e.rank-18].color:V.THEMES[V.realm(s.stage,e.zone)].color;box(216,16,368,48,10,'#142534dd',color+'66');g.fillStyle=color;g.font='bold 13px system-ui';g.textAlign='center';g.fillText((B&&B.design(e)?'BOSS · ':s.stage===2?'覚醒 BOSS · ':'区間 BOSS · ')+e.name,400,36);box(234,45,332,7,3,'#070e19');box(234,45,332*s.enemyHP/e.hp,7,3,color);g.textAlign='left';}
 if(paused||s.phase==='won'){rect(0,0,800,340,'#132031bd');g.fillStyle='#f0d8a2';g.textAlign='center';g.font='bold 30px system-ui';g.fillText(paused?'一時停止中':s.stage>=3?(s.stage===6?'輪を越えた、その先へ。':s.stage===5?'おかえり、勇者。通常クリア！':'階段は、まだ続く。'):s.stage===2?'往復、踏破。':s.stage===1?'討伐完了！ 故郷へ帰ろう':'勇者、ゴールへ。',400,161);g.font='16px system-ui';g.fillText(paused?'下の「再開する」で続けられます':s.stage===1?'魔力が高まり、帰り道の魔物が強化された。':s.stage===5?'冒険は達成。黒幕への挑戦は、任意の追加目標です。':s.stage<6?'下のボタンから、次の冒険へ':'装備は、次の冒険にも残ります。',400,198);g.textAlign='left';}
}
by('start').addEventListener('click',()=>{damageLabels.length=0;paused=false;E.play(s);last=0;accumulator=0;update();});
by('stop').addEventListener('click',()=>{E.stop(s);damageLabels.length=0;paused=false;last=0;accumulator=0;update();});
for(let i=0;i<(E.ZONES_EXTRA?7:3);i++)by('stage-'+i).addEventListener('click',()=>{if(E.select(s,i)){damageLabels.length=0;paused=false;last=0;accumulator=0;update();}});
by('pause').addEventListener('click',()=>{if(document.hidden)return;paused=!paused;last=0;update();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['walk','fight','fallen','falling'].includes(s.phase)){paused=true;last=0;save();update();}});
window.addEventListener('pagehide',save);
for(const value of [1,2,4])by('speed-'+value).addEventListener('click',()=>{
 speed=value;last=0;
 for(const option of [1,2,4])by('speed-'+option).setAttribute('aria-pressed',String(option===speed));
});

let saveClock=0;
const damageLabels=[];
function damageLabel(target,value,x,y,continuous){
 if(!Number.isFinite(value)||value<=0)return;
 const recent=damageLabels.at(-1);
 if(continuous&&recent&&recent.continuous&&recent.target===target&&visualTime-recent.time<.35){recent.value+=value;return;}
 damageLabels.push({target,value,x,y,time:visualTime,continuous});
 if(damageLabels.length>12)damageLabels.shift();
}
function battleStep(dt){
 const before={stage:s.stage,index:s.index,phase:s.phase,hp:s.hp,enemyHP:s.enemyHP},enemy=E.enemies(s)[s.index];
 const x=enemy?M.sceneEnemyX(s,enemy)+M.layout(s.stage).direction*(enemy.boss?55:20):0;
 E.step(s,dt);
 if(s.stage!==before.stage||!['walk','fight'].includes(before.phase))return;
 const hit=before.phase==='fight'?Math.max(0,before.enemyHP-s.enemyHP):0;
 if(hit&&enemy){const size=N&&N.size(enemy,s.stage);damageLabel('enemy',hit,x,Math.max(106,(B&&B.design(enemy)?108:size?266-size.height-38:enemy.boss?104:148)+M.groundY(s.stage,x)-266),false);}
 const loss=Math.max(0,before.hp-s.hp);
 if(loss)damageLabel('hero',loss,M.layout(s.stage).heroX,150,!hit);
}
function drawDamage(){
 for(let i=damageLabels.length-1;i>=0;i--)if(visualTime-damageLabels[i].time>.85)damageLabels.splice(i,1);
 g.save();g.font='bold 21px system-ui';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#251219';g.fillStyle='#ff6868';
 for(const label of damageLabels){
  const age=visualTime-label.time,y=label.target==='enemy'?Math.max(92,label.y-(gentle?0:age*24)):label.y-(gentle?0:age*24),value=label.value>=1?Math.round(label.value).toLocaleString('ja-JP'):label.value.toFixed(2);
  if(value==='0.00')continue;
  g.globalAlpha=gentle?1:Math.min(1,(.85-age)/.2);g.strokeText('−'+value,label.x,y);g.fillText('−'+value,label.x,y);
 }
 g.restore();
}
function frame(now){const elapsed=last?Math.max(0,(now-last)/1000):0,dt=Math.min(.1,elapsed);last=now;if(!document.hidden){if(s.phase==='won')recapProgress=gentle?1:Math.min(1,recapProgress+dt/1.8);if(!paused&&growthAge>0){growthAge=Math.max(0,growthAge-dt);if(!growthAge)by('growth-notice').textContent='';}}if(!paused&&!document.hidden){if(E.tickTime)E.tickTime(s,elapsed);saveClock+=elapsed;if(saveClock>=5){save();saveClock=0;}accumulator=Math.min(.4,accumulator+dt*(s.phase==='falling'?1:speed));
 // Fixed simulation ticks keep battle outcomes identical at each playback speed.
 for(let ticks=0;accumulator>=1/60-1e-9&&ticks<24;ticks++){battleStep(1/60);accumulator=Math.max(0,accumulator-1/60);visualTime+=1/60;}}update();render();requestAnimationFrame(frame);}
update();render();requestAnimationFrame(frame);
})();
