'use strict';
(()=>{
const B=typeof module!=='undefined'&&module.exports?require('./campaign.js'):window.HeroAgain;
const DEPTH=6351000,SKY=30000,MAX=200;
// Fictional protected stairway. Physical displacement and traversal pacing are separate.
const zones=[
 {stage:3,end:2200000,name:'赤く響く空洞',color:'#e58a55',sky:'#321826',floor:'#5b3631',env:[1,0,0,1],gear:'heat',enemy:['融鉄の獣','圧晶の巨人'],boss:'核の門番',hint:'熱い岩盤の向こうに、同じ輪の刻印がある。'},
 {stage:3,end:5200000,name:'流れる岩の回廊',color:'#e4a16a',sky:'#392934',floor:'#755144',env:[.85,0,0,.8],gear:'pressure',enemy:['熔岩の精','岩殻の兵'],boss:'流岩の守護者',hint:'誰かが先に、通れる道を造っている。'},
 {stage:3,end:6200000,name:'重い岩盤',color:'#b3aaa5',sky:'#293440',floor:'#66666a',env:[.55,0,0,.5],gear:'pressure',enemy:['岩盤騎士','黒曜の獣'],boss:'大地の番人',hint:'石の階段には、足跡のない場所だけ摩耗がある。'},
 {stage:3,end:6330000,name:'地下水の洞窟',color:'#82c9d0',sky:'#183c48',floor:'#47656c',env:[.15,0,0,.2],gear:'heat',enemy:['水晶の兵','水脈の獣'],boss:'水脈の主',hint:'水音がする。熱を逃がす風も感じられる。'},
 {stage:3,end:6349000,name:'根の届く天井',color:'#a8d796',sky:'#254736',floor:'#5e7350',env:[0,0,0,0],gear:'pressure',enemy:['根絡みの兵','苔の守護獣'],boss:'根の門番',hint:'天井を破る植物の根。草の匂いが、近づいている。'},
 {stage:3,end:DEPTH,name:'光の出口',color:'#eddca6',sky:'#96c8d4',floor:'#8da867',env:[0,0,0,0],gear:'cold',enemy:['陽光の番兵','門の石像'],boss:'出口の守護者',hint:'外の光だ。これで帰れる……はずだった。'},
 {stage:4,end:3000,name:'地上から続く段',color:'#d3e9b4',sky:'#77b8d2',floor:'#a5b59c',env:[0,.1,.1,0],gear:'oxygen',enemy:['風の狼','羽の番兵'],boss:'風の門番',hint:'地上へ出た。だが、階段は空へ伸びている。'},
 {stage:4,end:8000,name:'雲を渡る道',color:'#dceaf8',sky:'#548bb9',floor:'#c7d5df',env:[0,.65,.45,0],gear:'cold',enemy:['霜羽の獣','氷の番兵'],boss:'雲海の王',hint:'息が弾む。雲の隙間に、さっきまでいた地上が見える。'},
 {stage:4,end:11000,name:'凍った雲の果て',color:'#b6e6f4',sky:'#345778',floor:'#d2e5ec',env:[0,1,.7,0],gear:'oxygen',enemy:['氷翼の精','薄気の守護者'],boss:'氷空の巨竜',hint:'息が浅い。雲は足元にあり、雪が段に残っている。'},
 {stage:4,end:20000,name:'風の止む空',color:'#bcbfee',sky:'#233750',floor:'#a4b4d0',env:[0,1,.85,0],gear:'oxygen',enemy:['静空の兵','青影の竜'],boss:'無風の王',hint:'荒れた雲を抜けた。風が静まり、空の層が変わった。ここは成層圏だ。'},
 {stage:4,end:SKY,name:'青の輪郭',color:'#c2b8e9',sky:'#15233b',floor:'#adbed9',env:[0,.8,1,0],gear:'all',enemy:['天蓋の兵','環の使い'],boss:'天蓋の門番',hint:'冷え方は少し和らいだが、空気はさらに薄い。青い地平が弧を描いている。'},
 {stage:5,end:10000,name:'帰りの蒼い段',color:'#c6c5eb',sky:'#20324c',floor:'#aabbd8',env:[0,.9,1,0],gear:'all',enemy:['環の番兵','蒼い竜'],boss:'蒼穹の守護者',hint:'この階段を下り切れば、今度こそ本当のゴールです。'},
 {stage:5,end:19000,name:'静かな寒気',color:'#b7def0',sky:'#365576',floor:'#cbdde6',env:[0,1,.75,0],gear:'all',enemy:['氷影の兵','霜の巨人'],boss:'寒気の王',hint:'青い地上が少しずつ大きくなる。輪の刻印は帰り道にもある。'},
 {stage:5,end:22000,name:'雲の中へ',color:'#dae9ec',sky:'#6696b5',floor:'#bed1db',env:[0,.65,.45,0],gear:'all',enemy:['雲の獣','風切りの兵'],boss:'雲海の守り手',hint:'風が戻った。雲を通り抜け、下に街の灯りが見える。'},
 {stage:5,end:27000,name:'緑の見える空',color:'#b9d8bb',sky:'#88bacb',floor:'#a9baa0',env:[0,.15,.15,0],gear:'all',enemy:['落日の騎士','大地の精'],boss:'落日の守護者',hint:'草の色が分かる。息も、いつもの深さに戻ってきた。'},
 {stage:5,end:SKY,name:'故郷の最後の門',color:'#efc99a',sky:'#9caec2',floor:'#a99475',env:[0,0,0,0],gear:'all',enemy:['終門の騎士','封環の竜'],boss:'終門の王',hint:'帰り道を閉ざす王。これが最後の階段だ。'},
 {stage:6,end:100,name:'刻印の向こう',color:'#c7a9ed',sky:'#211d37',floor:'#665978',env:[.35,.35,.35,.35],gear:'all',enemy:['記録の守り手','環の使い'],boss:'環の書記官',hint:'旅のあちこちにあった刻印がつながる。試練を記録していた者が待っている。'}
].map((z,i)=>({...z,rank:18+i,type:i%6,begin:0}));
// Begin positions are local to each stage, never exposed by the presentation API.
for(let i=0;i<zones.length;i++)zones[i].begin=i&&zones[i-1].stage===zones[i].stage?zones[i-1].end:0;
const names=['チュートリアル','往路 · 42.195km','復路 · 裏42.195km','地底からの脱出','空へ続く階段','最後の下り階段','刻印の向こう'];
const labels={heat:'耐熱の護符',cold:'防寒の外套',oxygen:'息吹の器',pressure:'耐圧の帯',all:'環境調和の鎧'};
const lists=Array.from({length:7},(_,stage)=>stage<3?null:zones.filter(z=>z.stage===stage).flatMap(z=>{
 const span=z.end-z.begin;
 const normal=Array.from({length:19},(_,i)=>({x:z.begin+span*(i+1)/20,approach:span/20,name:z.enemy[i%2],type:(z.type+i%2)%6,rank:z.rank,zone:z.rank-18,boss:false,tint:0,hp:Math.round(80*1.65**z.rank*(i<5?.22:.22+.63*(i-4)/14)),attack:Math.round(34*1.55**z.rank*(i<5?.22:.22+.63*(i-4)/14)),defense:Math.round(3*1.5**z.rank),trait:i%3,weak:z.gear}));
 return [...normal,{x:z.end,approach:span/20,name:z.boss,type:z.type,rank:z.rank,zone:z.rank-18,boss:true,tint:0,hp:Math.round(80*1.65**z.rank*(stage===6?12:6)),attack:Math.round(34*1.55**z.rank*1.4),defense:Math.round(3*1.5**z.rank*1.3),trait:2,weak:z.gear}];
}));
const num=(v,min,max,d=0)=>Number.isFinite(v)&&v>=min&&v<=max?v:d;
const int=(v,min,max,d=0)=>Number.isInteger(v)&&v>=min&&v<=max?v:d;
const arr=(r,len,min,max,d)=>Array.from({length:len},(_,i)=>int(Array.isArray(r)?r[i]:undefined,min,max,d));
function clean(raw){
 const saved=B.clean(raw),r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},x=r.expedition&&typeof r.expedition==='object'&&!Array.isArray(r.expedition)?r.expedition:{};
 const wins=arr(x.wins,4,0,1000000,0);if(!saved.stageWins[2])wins.fill(0);for(let i=1;i<4;i++)if(!wins[i-1])wins[i]=0;
 const unlocked=!saved.stageWins[2]?B.unlocked({saved}):wins[2]?6:wins[1]?5:wins[0]?4:3;
 const res={};for(const k of Object.keys(labels))res[k]=int(x.resist?.[k],0,4);
 saved.expedition={schema:2,selected:int(x.selected,0,unlocked,saved.selected),wins,attempts:arr(x.attempts,4,1,1000000,1),checkpoints:arr(x.checkpoints,4,0,16,0),weapons:arr(x.weapons,17,-1,MAX,-1),armors:arr(x.armors,17,-1,MAX,-1),counts:arr(x.counts,17,0,1000000,0),bosses:Array.from({length:17},(_,i)=>x.bosses?.[i]===true),resist:res,fall:num(x.fall,0,DEPTH),time:num(x.time,0,1e10),walk:num(x.walk,0,1e12),climb:num(x.climb,0,1e12),descent:num(x.descent,0,1e12),kills:int(x.kills,0,1e9),deaths:int(x.deaths,0,1e9),route:[DEPTH,SKY,SKY,100].map((end,i)=>num(x.route?.[i],0,end)),historical:x.historical===true||(!r.expedition&&(saved.best>0||saved.wins>0)),snapshot:null,snapshots:[null,null,null,null]};
 const e=saved.expedition;
 for(let i=0;i<4;i++){
  const local=zones.filter(z=>z.stage===i+3).map(z=>z.rank-18);
  if(!local.includes(e.checkpoints[i]))e.checkpoints[i]=local[0];
  const chosen=e.checkpoints[i];for(const previous of local.filter(v=>v<chosen))if(!e.bosses[previous]){e.checkpoints[i]=previous;break;}
 }
 function snapshot(v,stage){
  if(!v||typeof v!=='object'||Array.isArray(v)||v.stage!==stage||stage>unlocked||!['walk','fight','fallen','falling','won'].includes(v.phase))return null;
  const list=lists[stage],index=int(v.index,0,list.length,-1),z=zones.find(z=>z.stage===stage&&num(v.x,0,1e8,-1)>=z.begin&&v.x<=z.end);
  const valid=index>=0&&z&&Number.isFinite(v.x)&&v.x>=(index?list[index-1].x:0)&&v.x<=(list[index]?.x??z.end)&&(!(v.phase==='fight')||v.x===list[index]?.x)&&(!(v.phase==='won')||(index===list.length&&wins[stage-3]>0));
  if(!valid)return null;
  const state={stage,phase:v.phase,x:v.x,index,level:int(v.level,1,1+Math.floor(list.length/2),1),kills:int(v.kills,0,list.length),hp:num(v.hp,0,8052,60),enemyHP:num(v.enemyHP,0,list[index]?.hp??0),timer:num(v.timer,0,5),stamina:num(v.stamina,0,100,100)};
  if(state.level!==1+Math.floor(state.kills/2)||(state.phase==='fight'&&state.enemyHP<=0)||(state.phase==='fallen'?state.hp!==0:state.hp<=0))return null;
  if(state.phase==='falling'&&(stage!==3||state.x!==0||index!==0||e.fall>=DEPTH))return null;
  const current=list[index]?.zone??zones.filter(z=>z.stage===stage).at(-1).rank-18;
  for(const previous of zones.filter(z=>z.stage===stage&&z.rank-18<current))if(!e.bosses[previous.rank-18])return null;
  return state;
 }
 for(let i=0;i<4;i++){
  const stage=i+3,rawSlot=Array.isArray(x.snapshots)?x.snapshots[i]:null;
  e.snapshots[i]=snapshot(rawSlot,stage)||snapshot(x.snapshot,stage);
 }
 e.snapshot=e.selected>=3?e.snapshots[e.selected-3]:null;
 return saved;
}
function unlocked(s){const e=s.saved.expedition;return !s.saved.stageWins[2]?B.unlocked(s):e.wins[2]?6:e.wins[1]?5:e.wins[0]?4:3;}
function create(raw,random=Math.random){
 const saved=clean(raw),s=B.create(saved,random);s.saved=saved;s.stage=saved.expedition.selected;s.stamina=100;
 const snap=saved.expedition.snapshot;if(snap&&snap.stage===s.stage)Object.assign(s,snap);s.lastDeath=s.stage<3?saved.death[s.stage]:0;
 if(s.stage>=3){s.hp=Math.min(s.hp,stats(s).maxHP);s.event=s.phase==='ready'?'刻印の先に、新しい道が待っています。':'保存した冒険です。「再開する」で続けられます。';}
 return s;
}
function emit(s,t){s.event=t;s.serial++;}
function enemies(s){return s.stage<3?B.enemies(s):lists[s.stage];}
function goal(s){return s.stage<3?B.goal(s):zones.filter(z=>z.stage===s.stage).at(-1).end;}
function zone(s){if(s.stage<3)return B.zone(s);const z=zones.find(z=>z.rank===enemies(s)[s.index]?.rank)||zones.filter(z=>z.stage===s.stage).at(-1);return {...z,index:z.rank-18,boss:enemies(s).find(e=>e.rank===z.rank&&e.boss)};}
function equipment(s,key){
 if(s.stage<3)return B.equipment(s,key);const old=B.equipment({...s,stage:2},key),items=s.saved.expedition[key==='weapon'?'weapons':'armors'];let best=old;
 for(let i=0;i<17;i++)if(items[i]>=0){const power=Math.round((key==='weapon'?36:24)*1.55**(i+18)*(1+items[i]*.1));if(power>=best.power)best={power,index:i+18,level:items[i],name:zones[i].name+(key==='weapon'?'の剣':'の鎧')};}return best;
}
function protection(s){const r=s.saved.expedition.resist;return Object.fromEntries(['heat','cold','oxygen','pressure'].map(k=>[k,Math.min(.96,(r[k]+r.all)*.24)]));}
function stats(s){if(s.stage<3)return B.stats(s);const p=protection(s),z=zone(s);return {maxHP:60+(s.level-1)*8,attack:8+(s.level-1)*2+equipment(s,'weapon').power,defense:Math.round((2+s.level-1+equipment(s,'armor').power)*(1-z.env[3]*(1-p.pressure)*.3))};}
function record(s,key){return s.stage<3?B.record(s,key):key==='wins'?s.saved.expedition.wins[s.stage-3]:key==='attempts'?s.saved.expedition.attempts[s.stage-3]:0;}
function checkpoint(s){
 if(s.stage<3){s.saved.expedition.selected=s.stage;s.saved.expedition.snapshot=null;return;}
 s.saved.expedition.selected=s.stage;if(s.phase==='ready'){s.saved.expedition.snapshot=s.saved.expedition.snapshots[s.stage-3];return;}s.saved.expedition.snapshot=Object.fromEntries(['stage','phase','x','index','level','kills','hp','enemyHP','timer','stamina'].map(k=>[k,s[k]]));s.saved.expedition.snapshots[s.stage-3]=s.saved.expedition.snapshot;
}
function select(s,id){
 if(!Number.isInteger(id)||id<0||id>unlocked(s)||!['ready','won'].includes(s.phase))return false;
 if(id<3){B.select({...s,phase:s.phase},id);s.saved.selected=id;}
 s.stage=id;s.phase='ready';s.x=0;s.index=0;s.kills=0;s.level=1;s.hp=60;s.enemyHP=0;s.timer=0;s.flash=0;s.stamina=100;s.lastDeath=id<3?s.saved.death[id]:0;emit(s,names[id]+'を選びました。');checkpoint(s);return true;
}
function start(s){
 if(s.stage<3){B.start(s);checkpoint(s);return;}
 const e=s.saved.expedition,z=zones[e.checkpoints[s.stage-3]];
 s.x=z.begin;s.index=enemies(s).findIndex(n=>n.rank===z.rank);s.kills=0;s.level=1;s.hp=60;s.enemyHP=0;s.timer=0;s.flash=0;s.stamina=100;s.phase='walk';s.lastDeath=0;
 if(s.stage===3&&e.fall<DEPTH){s.phase='falling';s.timer=5*(1-e.fall/DEPTH);emit(s,'めでたし、めでたし。……足元が崩れた！ 闇の底へ落ちていく。');}
 else emit(s,z.hint);checkpoint(s);
}
function play(s){
 if(!['ready','won'].includes(s.phase))return;
 const snap=s.saved.expedition.snapshot;if(s.stage>=3&&s.phase==='ready'&&snap?.stage===s.stage&&['walk','fight','fallen','falling'].includes(snap.phase)){Object.assign(s,snap);emit(s,'保存した冒険を同じ位置から再開します。');return;}
 if(s.phase==='won'&&s.stage<6){select(s,s.stage+1);start(s);return;}
 if(s.stage<3){B.play(s);checkpoint(s);return;}start(s);
}
function stop(s){if(s.stage<3){B.stop(s);checkpoint(s);return;}if(!['walk','fight','fallen','falling'].includes(s.phase))return;checkpoint(s);s.phase='ready';emit(s,'冒険を保存しました。同じ位置・戦闘状態から再開できます。');}
function refine(s){const e=s.saved.expedition;for(let k=0;k<4;k++){const a=[e.weapons,e.armors].map(list=>({list,i:list.findLastIndex(v=>v>=0&&v<MAX)})).filter(a=>a.i>=0).sort((a,b)=>a.list[a.i]-b.list[b.i]);const q=a[0];if(!q||s.saved.materials<5+q.list[q.i]*2)break;s.saved.materials-=5+q.list[q.i]*2;q.list[q.i]++;}}
function reward(s,n){
 const e=s.saved.expedition,i=n.rank-18,z=zones[i];e.kills=Math.min(1e9,e.kills+1);e.counts[i]=Math.min(1000000,e.counts[i]+1);s.saved.materials=Math.min(1e9,s.saved.materials+(n.boss?20:4));
 if(e.counts[i]%3===0||n.boss)e.resist[z.gear]=Math.min(4,e.resist[z.gear]+1);
 if(e.counts[i]%5===0||n.boss||s.random()<.2){const key=e.weapons[i]<0?'weapons':e.armors[i]<0?'armors':e.counts[i]%10?'weapons':'armors';if(e[key][i]<0)e[key][i]=0;else s.saved.materials=Math.min(1e9,s.saved.materials+8);}
 if(n.boss){e.bosses[i]=true;const next=zones[i+1];if(next?.stage===s.stage)e.checkpoints[s.stage-3]=i+1;}
 refine(s);return n.name+'を倒した。素材と装備、環境への備えが次の勇者へ残る。';
}
function defeat(s){s.saved.expedition.deaths=Math.min(1e9,s.saved.expedition.deaths+1);s.phase='fallen';s.timer=3;emit(s,'力尽きた。装備と素材は残り、この環境区間から再挑戦する。');}
function tickTime(s,dt){if(Number.isFinite(dt)&&dt>0&&['walk','fight','fallen','falling'].includes(s.phase))s.saved.expedition.time=Math.min(1e10,s.saved.expedition.time+dt);}
function step(s,dt){
 if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.1,dt);const ledger=s.saved.expedition;
 if(s.stage<3){const x=s.x,phase=s.phase;B.step(s,dt);if(s.x>x)ledger.walk=Math.min(1e12,ledger.walk+s.x-x);if(phase!=='fallen'&&s.phase==='fallen')ledger.deaths=Math.min(1e9,ledger.deaths+1);if(s.index>0&&phase==='fight'&&s.phase==='walk')ledger.kills=Math.min(1e9,ledger.kills+1);checkpoint(s);return;}
 if(!['walk','fight','fallen','falling'].includes(s.phase))return;s.flash=Math.max(0,s.flash-dt);
 if(s.phase==='falling'){ledger.fall=Math.min(DEPTH,ledger.fall+DEPTH*dt/5);s.timer=Math.max(0,s.timer-dt);if(s.timer<1e-8){ledger.fall=DEPTH;s.phase='walk';emit(s,'地球の中心近くまで落ちた。護符が熱と圧力を和らげている。地上へ続く階段を見つけた。');ledger.resist.heat=Math.max(1,ledger.resist.heat);ledger.resist.pressure=Math.max(1,ledger.resist.pressure);}checkpoint(s);return;}
 if(s.phase==='fallen'){s.timer-=dt;if(s.timer<=0){ledger.attempts[s.stage-3]=Math.min(1000000,ledger.attempts[s.stage-3]+1);start(s);}checkpoint(s);return;}
 const z=zone(s),p=protection(s),st=stats(s),n=enemies(s)[s.index];
 s.stamina=Math.min(100,s.stamina+dt*(12-9*z.env[2]*(1-p.oxygen)));
 s.hp=Math.max(0,s.hp-dt*st.maxHP*.004*z.env[0]*(1-p.heat));
 if(s.hp===0){defeat(s);checkpoint(s);return;}
 if(s.phase==='walk'){
  const before=s.x;s.x=Math.min(n?n.x:goal(s),s.x+dt*(z.end-z.begin)/90*(1-.25*z.env[1]*(1-p.cold)));
  const move=s.x-before;ledger.walk=Math.min(1e12,ledger.walk+move);ledger.route[s.stage-3]=Math.max(ledger.route[s.stage-3],s.x);if(s.stage<6){const key=s.stage===5?'descent':'climb';ledger[key]=Math.min(1e12,ledger[key]+move);}
  if(n&&s.x>=n.x){s.phase='fight';s.enemyHP=n.hp;s.timer=.35;emit(s,(n.boss?'強敵：':'')+n.name+'。'+(['堅い殻を持つ。','息吹を奪う攻撃。','連撃を狙っている。'][n.trait])+' '+labels[n.weak]+'で弱点を突ける。');}
  else if(s.x>=goal(s)){s.phase='won';ledger.wins[s.stage-3]=Math.min(1000000,ledger.wins[s.stage-3]+1);emit(s,s.stage===3?'地上へ出た！ だが、階段はそのまま空へ続いている。':s.stage===4?'成層圏の門が開いた。「この階段を下り切れば、今度こそ本当のゴールです。」':s.stage===5?'終門の王を倒し、故郷へ帰還した。通常クリア！ 刻印の向こうに、試練を仕組んだ者の気配がある。':'環の書記官を倒した。「勇者を記録に閉じ込め、永遠に試していた」と告げる。輪は消え、今度こそ自由な道へ。真のエンディング。');}
 }else{
  s.timer-=dt;if(s.timer<=0&&s.stamina>=10){
   s.timer=.7*(1+.4*z.env[1]*(1-p.cold));s.stamina-=10;s.flash=.18;
   const weak=n.weak==='all'?ledger.resist.all:ledger.resist[n.weak]+ledger.resist.all;const hit=Math.max(1,Math.round(st.attack*(weak>0?1.15:1)-n.defense*(n.trait===0?1.5:1)));s.enemyHP=Math.max(0,s.enemyHP-hit);
   if(!s.enemyHP){s.kills++;let t=reward(s,n);if(s.kills%2===0){s.level++;s.hp=Math.min(stats(s).maxHP,s.hp+8);}s.index++;s.phase='walk';const next=enemies(s)[s.index];if(next&&next.rank!==n.rank)t+=' '+zone(s).hint;emit(s,t);}
   else{const damage=Math.min(st.maxHP*(n.boss?.45:.35),Math.max(1,n.attack-st.defense)*(n.trait===2?1.2:1));s.hp=Math.max(0,s.hp-damage);if(n.trait===1)s.stamina=Math.max(0,s.stamina-8);emit(s,n.name+'に '+hit.toLocaleString('ja-JP')+' ダメージ。環境装備が勇者を支える。');}
  }
 }
 if(s.hp<=0&&s.phase!=='won')defeat(s);checkpoint(s);
}
function environment(s){if(s.stage<3)return '';const z=zone(s),p=protection(s);return ['熱','寒気','薄い空気','圧力'].map((label,i)=>z.env[i]>0?(z.env[i]<=.2?'軽い':'')+label+'：'+(p[['heat','cold','oxygen','pressure'][i]]>=.72?'備えあり':'対策を育成中'):'').filter(Boolean).join(' ／ ')||'穏やかな空気';}
function gearEffects(s){
 const items=Object.entries(s.saved.expedition.resist).filter(([,v])=>v>0).map(([k,v])=>labels[k]+' +'+v+(k==='all'?'（全環境）':''));
 if(!items.length)return '環境装備は確定報酬でも手に入ります。';
 const p=protection(s),effects=['熱','寒気','低酸素','圧力'].map((label,i)=>label+'の影響 '+Math.round(p[['heat','cold','oxygen','pressure'][i]]*100)+'%軽減');
 return items.join(' ／ ')+'\n'+effects.join(' ／ ');
}
function result(s){const e=s.saved.expedition;if(!e.wins[2])return null;return {marathon:84390,fall:e.fall,tutorial:1000,secret:e.route[3],ascent:e.route[0]+e.route[1],descent:e.route[2],total:85390+e.fall+e.route.reduce((a,b)=>a+b,0),totalRecorded:e.walk+e.fall,walkRecorded:e.walk,climbRecorded:e.climb,descentRecorded:e.descent,playSeconds:e.time,kills:e.kills,deaths:e.deaths,normalClear:e.wins[2]>0,trueClear:e.wins[3]>0,historical:e.historical};}
const api={...B,STAGES:names,clean,create,enemies,goal,zone,equipment,stats,record,unlocked,select,start,play,stop,step,tickTime,checkpoint,environment,gearEffects,result,ZONES_EXTRA:zones};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}window.HeroAgain=api;
})();
