'use strict';
(()=> {
const E=window.HeroAgain,by=id=>document.getElementById(id),canvas=by('scene'),g=canvas.getContext('2d'),KEY='shu3.hero-again.v1';
let saved=null,storageOK=true;
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=2048)saved=JSON.parse(raw);}catch(_){storageOK=false;}
const s=E.create(saved);let paused=false,last=0,seen=-1,lastSave='',visualTime=0;
function save(){const value=JSON.stringify(s.saved);if(value===lastSave)return;try{localStorage.setItem(KEY,value);lastSave=value;}catch(_){storageOK=false;by('save-note').textContent='保存できません。この画面を開いている間だけ記録が残ります。';}}
if(!storageOK)by('save-note').textContent='保存を読み込めませんでした。新しい冒険として開始します。';
function update(){
 const st=E.stats(s);by('hp').textContent=s.hp+' / '+st.maxHP;by('health').max=st.maxHP;by('health').value=s.hp;
 by('distance').textContent=Math.floor(s.x)+' / 1,000 m';by('progress').value=s.x;
 by('level').textContent=s.level;by('attack').textContent=st.attack;by('defense').textContent=st.defense;by('xp').textContent=(2-s.kills%2)+'体';
 by('weapon').textContent='旅立ちの剣 +'+s.saved.weapon;by('armor').textContent='旅立ちの鎧 +'+s.saved.armor;
 by('attempt').textContent='挑戦 '+s.saved.attempts+'回目';by('best').textContent='最長 '+s.saved.best+' m';by('wins').textContent='踏破 '+s.saved.wins+'回';
 by('phase').textContent=paused?'一時停止中':({ready:'出発の準備',walk:'ゴールを目指して',fight:'魔物と戦闘中',fallen:'次の勇者へ…',won:'ゴール到達！'})[s.phase];
 by('pause').disabled=['ready','won'].includes(s.phase);by('pause').textContent=paused?'再開する':'一時停止';
 by('start').disabled=!['ready','won'].includes(s.phase);by('start').textContent=s.phase==='won'?'装備を引き継いでもう一度':'冒険をはじめる';
 if(seen!==s.serial){seen=s.serial;by('message').textContent=s.event||'装備は引き継ぎ。レベルと身体能力は、倒れると初期値に戻ります。';save();}
}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);}
function circle(x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
function tree(x,y,size){rect(x-5,y,10,size*.7,'#41575a');g.fillStyle='#2f5860';g.beginPath();g.moveTo(x,y-size);g.lineTo(x-size*.55,y+10);g.lineTo(x+size*.55,y+10);g.fill();}
function hero(x,y){
 const bob=s.phase==='walk'?Math.sin(visualTime*10)*2:0;y+=bob;
 g.save();g.translate(x,y);if(s.phase==='fallen')g.rotate(-1.3);
 rect(-17,-47,34,24,'#b7c7d2');rect(-22,-51,44,9,'#e4e6cf');rect(-14,-41,28,18,'#eac392');rect(1,-34,4,4,'#243746');
 rect(-18,-21,36,33,'#72969c');rect(-23,-18,11,38,'#ce746a');rect(-15,12,11,18,'#d1c7aa');rect(5,12,11,18,'#d1c7aa');
 rect(-18,28,17,6,'#384351');rect(4,28,17,6,'#384351');
 rect(20,-37-(s.flash?8:0),5,44,'#e3e4d6');rect(12,-1-(s.flash?8:0),21,5,'#e5bb68');rect(21,4,4,12,'#977456');
 rect(-28,-10,17,25,'#e5bb68');rect(-24,-6,9,17,'#567783');
 g.restore();
}
function monster(x,y,e){if(e.type===0){circle(x,y,25,'#9ac592');rect(x-25,y,50,17,'#9ac592');}
 else if(e.type===1){rect(x-30,y-16,56,36,'#b99b8a');rect(x+13,y-31,21,24,'#b99b8a');rect(x+14,y-40,8,15,'#b99b8a');rect(x-24,y+20,10,14,'#9c8278');rect(x+15,y+20,10,14,'#9c8278');}
 else{rect(x-24,y-41,48,58,'#9aa9a6');rect(x-37,y-15,13,35,'#788d8b');rect(x+24,y-15,13,35,'#788d8b');rect(x-23,y+17,16,17,'#788d8b');rect(x+7,y+17,16,17,'#788d8b');}
 rect(x-10,y-7,5,5,'#26394a');rect(x+8,y-7,5,5,'#26394a');}
function render(){
 rect(0,0,800,340,'#22394d');circle(668,54,28,'#e6d8a0');
 for(let i=0;i<8;i++){let x=((i*150-s.x*.18)%1200+1200)%1200-100;tree(x,205,80+i%3*12);}
 rect(0,238,800,102,'#435d4e');rect(0,266,800,74,'#736b50');rect(0,266,800,7,'#c0ac75');
 for(let i=0;i<15;i++)rect(((i*72-s.x)%1080+1080)%1080-80,296+(i%3)*12,19,3,'#8c8260');
 if(s.lastDeath>0){const x=185+s.lastDeath-s.x;if(x>-20&&x<820){rect(x,205,3,62,'#e0b078');g.fillStyle='#e0b078';g.font='12px system-ui';g.fillText('前回',x-12,193);}}
 const goalX=185+E.GOAL-s.x;if(goalX<830){rect(goalX,115,7,152,'#dacdae');rect(goalX+7,119,55,34,'#e5bb68');g.fillStyle='#233448';g.font='bold 12px system-ui';g.fillText('GOAL',goalX+15,141);}
 const e=E.ENEMIES[s.index];if(e){let x=s.phase==='fight'?280:185+e.x-s.x;if(x<840){monster(x,231,e);g.fillStyle='#e7ebd5';g.font='13px system-ui';g.fillText(e.name,x-34,166);if(s.phase==='fight'){rect(x-30,176,60,5,'#131d30');rect(x-30,176,60*s.enemyHP/e.hp,5,'#d99d7e');}}}
 hero(185,230);
 if(paused||s.phase==='won'){rect(0,0,800,340,'#132031b8');g.fillStyle='#e5d8ac';g.textAlign='center';g.font='bold 30px system-ui';g.fillText(paused?'一時停止中':'勇者、ゴールへ。',400,161);g.font='16px system-ui';g.fillText(paused?'下の「再開する」で続けられます':'装備は、次の冒険にも残ります。',400,198);g.textAlign='left';}
}
by('start').addEventListener('click',()=>{if(s.phase==='won')s.saved.attempts=Math.min(1000000,s.saved.attempts+1);paused=false;E.start(s);last=0;update();});
by('pause').addEventListener('click',()=>{if(document.hidden)return;paused=!paused;last=0;update();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['walk','fight','fallen'].includes(s.phase)){paused=true;last=0;save();update();}});
window.addEventListener('pagehide',save);
function frame(now){const dt=last?Math.min(.1,Math.max(0,(now-last)/1000)):0;last=now;if(!paused&&!document.hidden){E.step(s,dt);visualTime+=dt;}update();render();requestAnimationFrame(frame);}
update();render();requestAnimationFrame(frame);
})();
