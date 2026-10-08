'use strict';
(()=> {
const T=typeof module!=='undefined'&&module.exports?require('./engine.js'):window.HeroAgain;
const DISTANCE=42195,MAX_UPGRADE=200,STAGES=['チュートリアル','往路 · 42.195km','復路 · 裏42.195km'];
const ZONES=[
 ['旅立ちの草原',['スライム','野生の狼'],[0,1],'大牙の狼',1,'鉄の剣','鉄の鎧',0],
 ['深い森',['毒スライム','森のゴブリン'],[0,3],'森の番人',3,'狩人の剣','革鋼の鎧',30],
 ['岩山',['岩トカゲ','石の魔人'],[5,2],'岩山の巨人',2,'岩砕きの剣','重装鎧',0],
 ['古代遺跡',['骸骨兵','動く石像'],[4,2],'遺跡の守護騎士',4,'古代の剣','守護の鎧',0],
 ['凍った峠',['氷狼','氷の魔人'],[1,2],'氷牙の獣王',1,'氷晶の剣','耐寒鎧',150],
 ['火山地帯',['火トカゲ','溶岩兵'],[5,2],'炎の巨竜',5,'炎鋼の剣','竜鱗の鎧',310],
 ['魔物の砦',['重装兵','魔術師'],[4,3],'魔物の将軍',4,'将軍の剣','黒鋼の鎧',280],
 ['魔王城への道',['魔獣','暗黒騎士'],[1,4],'黒翼の竜',5,'聖銀の剣','聖銀の鎧',260],
 ['魔王城',['精鋭ゴブリン','魔王の近衛'],[3,4],'魔王',3,'勇者の剣','勇者の鎧',300]
];
const BACK_BOSSES=['覚醒魔王','黒翼竜の真体','帰還を阻む将軍','煉獄の巨竜','氷牙の真王','遺跡の亡霊王','岩山の古代巨人','深森の主','災厄の王'];
function makeEnemies(stage){
 const list=[];for(let zone=0;zone<9;zone++){
  const rank=(stage-1)*9+zone,z=ZONES[stage===2?8-zone:zone],begin=zone*5000,end=Math.min(DISTANCE,(zone+1)*5000);
  const hp=Math.round(80*1.65**rank),attack=Math.round(34*1.55**rank),defense=Math.round(3*1.5**rank);
  for(let x=begin+250,n=0;x<end;x+=250,n++){
   // Five scouts teach the new tier; then difficulty rises without a sudden jump.
   const factor=n<5?.65:.65+.5*(n-4)/Math.max(1,Math.ceil((end-begin)/250)-6);
   list.push({x,name:(stage===2?'覚醒 ': '')+z[1][n%2],type:z[2][n%2],hp:Math.round(hp*factor),attack:Math.round(attack*factor),defense:Math.round(defense*factor),rank,zone,boss:false,tint:z[7],approach:250});
  }
  list.push({x:end,name:stage===2?BACK_BOSSES[zone]:z[3],type:stage===2&&zone===8?5:z[4],hp:hp*5,attack:Math.round(attack*1.4),defense:Math.round(defense*1.3),rank,zone,boss:true,tint:z[7],approach:end-(list[list.length-1]?.x||begin)});
 }return list;
}
const LISTS=[T.ENEMIES,makeEnemies(1),makeEnemies(2)];
function integer(value,min,max,fallback){return Number.isInteger(value)&&value>=min&&value<=max?value:fallback;}
function numbers(raw,length,min,max,fallback){return Array.from({length},(_,i)=>integer(Array.isArray(raw)?raw[i]:undefined,min,max,fallback));}
function flags(raw){return Array.from({length:18},(_,i)=>Array.isArray(raw)&&raw[i]===true);}
function clean(raw){
 const base=T.clean(raw),r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const wins=numbers(r.stageWins,3,0,1000000,0);wins[0]=base.wins;
 if(base.wins===0){wins[1]=0;wins[2]=0;}else if(wins[1]===0)wins[2]=0;
 const unlocked=wins[1]>0?2:base.wins>0?1:0;
 return {...base,version:2,selected:integer(r.selected,0,unlocked,0),stageWins:wins,
  stageBest:[base.best,...numbers(r.stageBest,3,0,DISTANCE,0).slice(1)],
  stageAttempts:[base.attempts,...numbers(r.stageAttempts,3,1,1000000,1).slice(1)],
  started:Array.from({length:3},(_,i)=>Array.isArray(r.started)&&typeof r.started[i]==='boolean'?r.started[i]:i===0?base.best>0||base.wins>0||base.attempts>1:(Array.isArray(r.stageBest)&&Number.isFinite(r.stageBest[i])&&r.stageBest[i]>0)||wins[i]>0),
  death:numbers(r.death,3,0,DISTANCE,0),materials:integer(r.materials,0,1000000000,0),
  weapons:numbers(r.weapons,18,-1,MAX_UPGRADE,-1),armors:numbers(r.armors,18,-1,MAX_UPGRADE,-1),
  rareWeapons:flags(r.rareWeapons),rareArmors:flags(r.rareArmors),bosses:flags(r.bosses),counts:numbers(r.counts,18,0,1000000,0)};
}
function unlocked(s){return s.saved.stageWins[1]>0?2:s.saved.wins>0?1:0;}
function goal(s){return s.stage===0?T.GOAL:DISTANCE;}
function enemies(s){return LISTS[s.stage];}
function record(s,key){if(s.stage===0)return s.saved[key];return s.saved[{best:'stageBest',attempts:'stageAttempts',wins:'stageWins'}[key]][s.stage];}
function emit(s,text){s.event=text;s.serial++;}
function create(raw,random=Math.random){
 const saved=clean(raw),s=T.create(saved);s.saved=saved;s.stage=saved.selected;s.random=random;s.lastDeath=saved.death[s.stage];return s;
}
function gearName(index,key,rare){
 const z=ZONES[index<9?index:17-index],name=z[key==='weapon'?5:6];
 return (index>=9?'覚醒 ': '')+(rare?'王印の':'')+name;
}
function equipment(s,key){
 const legacy={power:s.saved[key]*(key==='weapon'?3:2),index:-1,level:s.saved[key],name:key==='weapon'?'旅立ちの剣':'旅立ちの鎧'};
 if(s.stage===0)return legacy;
 const items=s.saved[key==='weapon'?'weapons':'armors'],rare=s.saved[key==='weapon'?'rareWeapons':'rareArmors'];let best=legacy;
 for(let i=0;i<18;i++)if(items[i]>=0){
  const power=Math.round((key==='weapon'?36:24)*1.55**i*(1+items[i]*.10)*(rare[i]?1.25:1));
  if(power>=best.power)best={power,index:i,level:items[i],name:gearName(i,key,rare[i])};
 }return best;
}
function stats(s){if(s.stage===0)return T.stats(s);return {maxHP:60+(s.level-1)*8,attack:8+(s.level-1)*2+equipment(s,'weapon').power,defense:2+(s.level-1)+equipment(s,'armor').power};}
function start(s){
 if(s.saved.started[s.stage]){
  if(s.stage===0){s.saved.attempts=Math.min(1000000,s.saved.attempts+1);s.saved.stageAttempts[0]=s.saved.attempts;}
  else s.saved.stageAttempts[s.stage]=Math.min(1000000,record(s,'attempts')+1);
 }
 s.saved.started[s.stage]=true;
 if(s.stage===0){T.start(s);s.lastDeath=s.saved.death[0];return;}
 s.x=0;s.index=0;s.kills=0;s.level=1;s.hp=60;s.enemyHP=0;s.timer=0;s.flash=0;s.phase='walk';s.lastDeath=s.saved.death[s.stage];emit(s,STAGES[s.stage]+'へ出発。装備・素材・撃破記録を引き継ぎます。');
}
function select(s,id){
 if(!Number.isInteger(id)||id<0||id>unlocked(s)||!['ready','won'].includes(s.phase))return false;
 s.stage=id;s.saved.selected=id;s.phase='ready';s.x=0;s.index=0;s.kills=0;s.level=1;s.hp=60;s.enemyHP=0;s.flash=0;s.lastDeath=s.saved.death[id];emit(s,STAGES[id]+'を選びました。');return true;
}
function play(s){
 if(!['ready','won'].includes(s.phase))return;
 if(s.phase==='won'&&s.stage<2){select(s,s.stage+1);start(s);return;}
 start(s);
}
function stop(s){if(!['walk','fight','fallen'].includes(s.phase))return; s.phase='ready';s.x=0;s.index=0;s.kills=0;s.level=1;s.hp=60;s.enemyHP=0;s.flash=0;emit(s,'冒険を中断しました。装備と素材は保存され、再出発はステージ入口からです。');}
function material(s,n){s.saved.materials=Math.min(1000000000,s.saved.materials+n);}
function drop(s,rank,key,rare=false){
 const items=s.saved[key==='weapon'?'weapons':'armors'],flags=s.saved[key==='weapon'?'rareWeapons':'rareArmors'];
 if(rare){flags[rank]=true;items[rank]=Math.max(0,items[rank]);return gearName(rank,key,true)+'を獲得！';}
 if(items[rank]<0){items[rank]=0;return gearName(rank,key,false)+'を獲得！';}
 material(s,5);return '重複装備を素材5個に変換。';
}
function refine(s){
 let changed=false;for(let pass=0;pass<4;pass++){
  const choices=[];for(const list of [s.saved.weapons,s.saved.armors]){
   for(let i=17;i>=0;i--)if(list[i]>=0&&list[i]<MAX_UPGRADE){choices.push({list,index:i,level:list[i]});break;}
  }
  choices.sort((a,b)=>a.level-b.level);const c=choices[0];if(!c||s.saved.materials<5+c.level*2)break;
  s.saved.materials-=5+c.level*2;c.list[c.index]++;changed=true;
 }return changed;
}
function reward(s,e){
 material(s,e.boss?10:2);let text=e.name+'を倒した。素材 +'+(e.boss?10:2)+'。';
 if(e.boss&&!s.saved.bosses[e.rank]){s.saved.bosses[e.rank]=true;text+=' '+drop(s,e.rank,e.rank%2===0?'weapon':'armor',true);}
 if(!e.boss){
  const count=s.saved.counts[e.rank]=Math.min(1000000,s.saved.counts[e.rank]+1);
  if(count%5===0){const key=s.saved.weapons[e.rank]<0?'weapon':s.saved.armors[e.rank]<0?'armor':count%10===0?'armor':'weapon';text+=' 確定報酬：'+drop(s,e.rank,key);}
  if(s.random()<.2)text+=' '+drop(s,e.rank,s.random()<.5?'weapon':'armor');
 }
 if(refine(s))text+=' 装備を自動強化。';return text;
}
function step(s,dt){
 if(!Number.isFinite(dt)||dt<=0||!['walk','fight','fallen'].includes(s.phase))return;
 if(s.stage===0){
  const previous=s.phase;T.step(s,dt);s.saved.stageBest[0]=s.saved.best;s.saved.stageAttempts[0]=s.saved.attempts;s.saved.stageWins[0]=s.saved.wins;
  if(s.phase==='fallen')s.saved.death[0]=s.lastDeath;
  if(previous!=='won'&&s.phase==='won')emit(s,'チュートリアル踏破！ 往路42.195kmが解放されました。');return;
 }
 dt=Math.min(dt,.1);s.flash=Math.max(0,s.flash-dt);
 if(s.phase==='fallen'){s.timer-=dt;if(s.timer<=0){start(s);}return;}
 const e=enemies(s)[s.index];
 if(s.phase==='walk'){
  s.x=Math.min(e?e.x:DISTANCE,s.x+dt*65);s.saved.stageBest[s.stage]=Math.max(record(s,'best'),Math.floor(s.x));
  if(e&&s.x>=e.x){s.phase='fight';s.enemyHP=e.hp;s.timer=.35;emit(s,(e.boss?'区間ボス：':'')+e.name+'が現れた！');}
  else if(s.x>=DISTANCE){s.phase='won';s.saved.stageWins[s.stage]=Math.min(1000000,record(s,'wins')+1);emit(s,s.stage===1?'往路踏破！ 復路の裏ステージが解放されました。':'往復84.390kmを踏破！ 災厄の王を倒し、故郷へ帰り着きました。');}
  return;
 }
 s.timer-=dt;if(s.timer>0)return;s.timer=.7;s.flash=.18;const st=stats(s),hit=Math.max(1,st.attack-e.defense);s.enemyHP=Math.max(0,s.enemyHP-hit);
 if(s.enemyHP===0){
  s.kills++;let text=reward(s,e);if(s.kills%2===0){s.level++;s.hp=Math.min(stats(s).maxHP,s.hp+8);text+=' Lv'+s.level+'へ成長。';}
  s.index++;s.phase='walk';emit(s,text);return;
 }
 const damage=Math.max(1,e.attack-st.defense);s.hp=Math.max(0,s.hp-damage);emit(s,e.name+'へ '+hit.toLocaleString('ja-JP')+' ダメージ ／ 反撃 '+damage.toLocaleString('ja-JP'));
 if(s.hp===0){s.lastDeath=s.x;s.saved.death[s.stage]=s.x;s.phase='fallen';s.timer=3;emit(s,(s.x/1000).toFixed(3)+'kmで力尽きた。装備・強化・素材は残り、3秒後に入口から再出発。');}
}
function zone(s){if(s.stage===0)return null;const e=enemies(s)[s.index],index=e?e.zone:8,z=ZONES[s.stage===2?8-index:index];return {index,name:z[0],boss:enemies(s).find(e=>e.zone===index&&e.boss),rank:(s.stage-1)*9+index};}
const api={...T,DISTANCE,MAX_UPGRADE,STAGES,ZONES,clean,create,stats,start,step,select,play,stop,goal,enemies,record,equipment,unlocked,zone};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}window.HeroAgain=api;
})();
