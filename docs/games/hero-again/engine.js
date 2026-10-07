'use strict';
(()=> {
const GOAL=1000;
const ENEMIES=Array.from({length:9},(_,i)=>({x:(i+1)*100,name:['スライム','牙オオカミ','石の魔人'][i%3],hp:22+i*7,attack:12+i*3,type:i%3}));
function clean(raw){
 const d={weapon:0,armor:0,best:0,attempts:1,wins:0};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return d;
 for(const [k,max] of [['weapon',12],['armor',12],['best',GOAL],['attempts',1000000],['wins',1000000]])if(Number.isInteger(raw[k])&&raw[k]>= (k==='attempts'?1:0)&&raw[k]<=max)d[k]=raw[k];
 return d;
}
function create(saved){return {saved:clean(saved),phase:'ready',x:0,index:0,kills:0,level:1,hp:60,enemyHP:0,timer:0,flash:0,lastDeath:0,event:'',serial:0};}
function stats(s){return {maxHP:60+(s.level-1)*8,attack:8+(s.level-1)*2+s.saved.weapon*3,defense:2+(s.level-1)+s.saved.armor*2};}
function event(s,text){s.event=text;s.serial++;}
function start(s){s.x=0;s.index=0;s.kills=0;s.level=1;s.hp=60;s.enemyHP=0;s.timer=0;s.phase='walk';event(s,'新しい冒険へ。装備が、この勇者を支えます。');}
function step(s,dt){
 if(!Number.isFinite(dt)||dt<=0||!['walk','fight','fallen'].includes(s.phase))return;
 dt=Math.min(dt,.1);s.flash=Math.max(0,s.flash-dt);
 if(s.phase==='fallen'){s.timer-=dt;if(s.timer<=0){s.saved.attempts=Math.min(1000000,s.saved.attempts+1);start(s);}return;}
 if(s.phase==='walk'){
  const next=ENEMIES[s.index];s.x=Math.min(next?next.x:GOAL,s.x+dt*65);s.saved.best=Math.max(s.saved.best,Math.floor(s.x));
  if(next&&s.x>=next.x){s.phase='fight';s.enemyHP=next.hp;s.timer=.35;event(s,next.name+'が現れた！');}
  else if(s.x>=GOAL){s.phase='won';s.saved.wins=Math.min(1000000,s.saved.wins+1);event(s,'ゴール到達！ 引き継いだ装備が道を切り開きました。');}
  return;
 }
 s.timer-=dt;if(s.timer>0)return;s.timer=.7;s.flash=.18;
 const e=ENEMIES[s.index],st=stats(s);s.enemyHP=Math.max(0,s.enemyHP-st.attack);
 if(s.enemyHP===0){
  s.kills++;const key=s.index%2===0?'weapon':'armor';const before=s.saved[key];s.saved[key]=Math.min(12,before+1);
  let text=e.name+'を倒した。'+(before<12?(key==='weapon'?'武器':'鎧')+' +1 を獲得！':'装備は最大強化です。');
  if(s.kills%2===0){s.level++;s.hp=Math.min(stats(s).maxHP,s.hp+8);text+=' Lv'+s.level+'へ成長。HP +8';}
  s.index++;s.phase='walk';event(s,text);return;
 }
 const damage=Math.max(1,e.attack-st.defense);s.hp=Math.max(0,s.hp-damage);event(s,e.name+'へ '+st.attack+' ダメージ ／ 反撃で '+damage+' ダメージ');
 if(s.hp===0){s.lastDeath=s.x;s.phase='fallen';s.timer=3;event(s,Math.floor(s.x)+'mで力尽きた。装備はそのまま、3秒後に再出発。');}
}
const api={GOAL,ENEMIES,clean,create,stats,start,step};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
window.HeroAgain=api;
})();
