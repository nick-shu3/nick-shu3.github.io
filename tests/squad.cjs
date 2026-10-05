const assert=require('node:assert/strict'),E=require('../docs/games/squad-front/engine.js');
function simulate(policy){const s=E.create();for(let i=0;i<6100&&s.status==='playing';i++){policy(s);E.step(s,1/60);}return s;}
const idle=simulate(()=>{});assert.equal(idle.status,'lost','standing still should fail');
const active=simulate(s=>{let target=s.entities.filter(e=>e.y>360&&!['weapon','supply','boss'].includes(e.type)).sort((a,b)=>b.y-a.y)[0];target??=s.entities.find(e=>e.type==='supply'&&s.allies<7);target??=s.entities.find(e=>e.type==='weapon'&&s.level<4);target??=s.entities.filter(e=>!['weapon','supply'].includes(e.type)).sort((a,b)=>b.y-a.y)[0];if(target)s.target=target.x;});
console.log({idle:idle.status,active:active.status,time:active.time,hp:active.hp,allies:active.allies,weapon:active.level,score:active.score});assert.equal(active.status,'won','upgrading and intercepting can win');assert(active.allies>1&&active.level>1);assert(active.time<95);
const s=E.create();s.next=100;s.shot=999;const box=E.add(s,'supply',1);box.life=.01;E.step(s,.02);assert.equal(s.entities.length,0,'boxes expire');assert.equal(s.allies,1);s.hp=1;const foe=E.add(s,'enemy',1);foe.y=732;E.step(s,.02);assert.equal(s.status,'lost');const t=s.time;E.step(s,.02);assert.equal(s.time,t,'finished game stops');
const p=E.create();p.next=100;p.target=-100;E.step(p,1/60);assert(p.x>200,'movement is bounded by velocity');
console.log('PASS: strategy clear, idle defeat, upgrades, expired supply, breach, terminal state.');
