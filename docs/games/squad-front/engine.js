(function(root){
const X=[82,210,338],events=[
 [0,'supply',0],[3,'enemy',1],[6,'weapon',2],[10,'enemy',2],[12,'enemy',0],[15,'supply',1],
 [18,'enemy',0],[20,'enemy',2],[22,'tank',1],[24,'weapon',0],[26,'supply',2],
 [29,'enemy',0],[30,'enemy',1],[31,'enemy',2],[34,'tank',0],[35,'enemy',2],
 [37,'weapon',1],[39,'supply',0],[41,'tank',2],[43,'enemy',0],[44,'enemy',1],[47,'boss',1]
];
function create(){return {time:0,x:210,target:210,hp:8,allies:1,level:1,kills:0,score:0,status:'playing',entities:[],bullets:[],effects:[],events:[],next:0,serial:0,shot:0,boss:false,bossWave:4,shots:0,hits:0,seed:2718};}
function add(s,type,lane){let hp=type==='enemy'?6+Math.floor(s.time/15)*3:type==='tank'?27:type==='boss'?600:type==='supply'?9:12;
 const e={id:++s.serial,type,x:X[lane],y:type==='boss'?-75:-32,hp,max:hp,r:type==='boss'?47:type==='tank'?25:type==='enemy'?19:30,speed:type==='enemy'?45+s.time*.3:type==='tank'?33:0};
 if(type==='supply'||type==='weapon'){e.y=130;e.life=13;e.maxLife=13;}s.entities.push(e);return e;}
function fx(s,x,y,color,n=8){for(let i=0;i<n;i++){s.seed=(s.seed*1664525+1013904223)>>>0;const a=(s.seed/4294967296)*Math.PI*2;s.effects.push({x,y,vx:Math.cos(a)*90,vy:Math.sin(a)*90,life:.4,color});}}
function step(s,dt){if(s.status!=='playing')return;dt=Math.max(0,Math.min(dt,.05));s.time+=dt;s.events=[];s.x+=Math.max(-380*dt,Math.min(380*dt,s.target-s.x));
 while(s.next<events.length&&events[s.next][0]<=s.time){const[,t,l]=events[s.next++];add(s,t,l);if(t==='boss'){s.boss=true;s.events.push('boss');}}
 s.shot-=dt;if(s.shot<=0){s.shot+=Math.max(.14,.32-(s.level-1)*.055);for(let i=0;i<s.allies;i++){s.bullets.push({x:s.x+(i-(s.allies-1)/2)*9,y:671-Math.abs(i-(s.allies-1)/2)*6,damage:s.level});s.shots++;}s.events.push('shot');}
 for(const e of s.entities){if(e.type==='supply'||e.type==='weapon'){e.life-=dt;if(e.life<=0){e.expired=true;s.events.push('missed');}}
 else if(e.type==='boss'){e.y=Math.min(125,e.y+65*dt);}else e.y+=e.speed*dt;}
 if(s.boss){s.bossWave-=dt;if(s.bossWave<=0){s.bossWave=4;add(s,'enemy',Math.floor((s.time/4)%3));}}
 for(const b of s.bullets){const old=b.y;b.y-=650*dt;let hit=null;for(const e of s.entities){if(e.hp<=0||e.expired)continue;if(Math.abs(b.x-e.x)<e.r&&old>=e.y-e.r&&b.y<=e.y+e.r&&(!hit||e.y>hit.y))hit=e;}
 if(hit){b.dead=true;hit.hp-=b.damage;s.hits++;hit.flash=.1;if(hit.hp<=0){fx(s,hit.x,hit.y,hit.type==='supply'?'#73efbd':hit.type==='weapon'?'#ffd078':'#ff7c77',12);
 if(hit.type==='supply'){s.allies=Math.min(7,s.allies+2);s.score+=100;s.events.push('supply');}
 else if(hit.type==='weapon'){s.level=Math.min(4,s.level+1);s.score+=120;s.events.push('weapon');}
 else{s.kills++;s.score+=hit.type==='boss'?1000:hit.type==='tank'?80:40;s.events.push('kill');if(hit.type==='boss'){s.status='won';s.score+=s.hp*100;s.events.push('won');}}
 }}}
 for(const e of s.entities){e.flash=Math.max(0,(e.flash||0)-dt);if(e.hp>0&&!e.expired&&e.y+e.r>=733){s.hp=Math.max(0,s.hp-(e.type==='tank'?2:1));e.hp=0;fx(s,e.x,733,'#ff676f');s.events.push('breach');}}
 s.entities=s.entities.filter(e=>e.hp>0&&!e.expired);s.bullets=s.bullets.filter(b=>!b.dead&&b.y>-20);for(const f of s.effects){f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;}s.effects=s.effects.filter(f=>f.life>0);
 if(s.hp<=0&&s.status==='playing'){s.status='lost';s.events.push('lost');}
 if(s.time>100&&s.status==='playing'){s.hp=0;s.status='lost';s.events.push('lost');}
}
const api={create,step,add,events,X};if(typeof module!=='undefined')module.exports=api;else root.Squad=api;
})(globalThis);
