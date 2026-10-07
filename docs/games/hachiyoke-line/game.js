'use strict';
(function(root){
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const nests=stage=>stage.nests||[stage.nest];
function pointDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;
  const t=l?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l,0,1):0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
function segmentDistance(a,b,c,d){
  const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
  if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return 0;
  return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b));
}
class Walls{
  constructor(width){this.width=width;this.segments=[];this.buckets=new Map();}
  keys(a,b,pad){const keys=[];for(let y=Math.floor((Math.min(a.y,b.y)-pad)/32);y<=Math.floor((Math.max(a.y,b.y)+pad)/32);y++)for(let x=Math.floor((Math.min(a.x,b.x)-pad)/32);x<=Math.floor((Math.max(a.x,b.x)+pad)/32);x++)keys.push(x+','+y);return keys;}
  add(a,b){const s={a:{...a},b:{...b}};this.segments.push(s);for(const k of this.keys(a,b,this.width/2)){if(!this.buckets.has(k))this.buckets.set(k,[]);this.buckets.get(k).push(s);}}
  clear(a,b,r){const seen=new Set();for(const k of this.keys(a,b,r)){for(const s of this.buckets.get(k)||[]){if(seen.has(s))continue;seen.add(s);if(segmentDistance(a,b,s.a,s.b)<=r+this.width/2+.02)return false;}}return true;}
}
// A small navigation grid supplies routes; exact swept capsule tests remain authoritative.
function navigation(model){
  const cell=10,w=Math.floor(model.stage.width/cell),h=Math.floor(model.stage.height/cell),size=w*h,r=model.stage.bees.radius;
  const pos=i=>({x:(i%w+.5)*cell,y:(Math.floor(i/w)+.5)*cell});
  const index=p=>clamp(Math.floor(p.y/cell),0,h-1)*w+clamp(Math.floor(p.x/cell),0,w-1);
  const free=new Uint8Array(size),edges=Array.from({length:size},()=>[]);
  for(let i=0;i<size;i++){const p=pos(i);free[i]=p.x>=r&&p.x<=model.stage.width-r&&p.y>=r&&p.y<=model.stage.height-r&&model.walls.clear(p,p,r);}
  for(let i=0;i<size;i++)if(free[i])for(const [dx,dy] of [[1,0],[0,1],[1,1],[-1,1]]){
    const x=i%w+dx,y=Math.floor(i/w)+dy;if(x<0||x>=w||y<0||y>=h)continue;
    const j=y*w+x;if(free[j]&&model.walls.clear(pos(i),pos(j),r)){edges[i].push(j);edges[j].push(i);}
  }
  const routes=new Int32Array(size).fill(-1),queue=[];
  for(let i=0;i<size;i++)if(free[i]&&model.stage.targets.some(t=>distance(pos(i),t)<=t.radius+r)){routes[i]=i;queue.push(i);}
  for(let q=0;q<queue.length;q++)for(const j of edges[queue[q]])if(routes[j]===-1){routes[j]=queue[q];queue.push(j);}
  return {pos,index,free,edges,routes,size};
}
class Model{
  constructor(stage){this.stage=stage;this.reset();}
  reset(){this.phase='ready';this.elapsed=0;this.usedLength=0;this.walls=new Walls(this.stage.lineWidth);for(const s of this.stage.obstacles)this.walls.add(s.a,s.b);this.bees=[];this.last=null;this.nav=null;}
  allowed(a,b){return [ ...this.stage.targets, ...nests(this.stage) ].every(c=>pointDistance(c,a,b)>c.radius+this.stage.lineWidth/2+8);}
  pen(point,start=false){
    if(!['ready','draw'].includes(this.phase))return false;
    const p={x:clamp(point.x,4,this.stage.width-4),y:clamp(point.y,4,this.stage.height-4)};
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
    if(start)this.last=null;
    if(!this.allowed(p,p)){this.last=null;return false;}
    if(this.stage.maxLength!==undefined&&this.usedLength>=this.stage.maxLength-1e-8)return false;
    if(this.phase==='ready'){this.phase='draw';this.elapsed=0;}
    const a=this.last||p;
    const length=distance(a,p);
    if(this.last&&length<2)return true;
    const remaining=this.stage.maxLength===undefined?Infinity:this.stage.maxLength-this.usedLength;
    const end=length>remaining?{x:a.x+(p.x-a.x)*remaining/length,y:a.y+(p.y-a.y)*remaining/length}:p;
    if(!this.allowed(a,end)){this.last=null;return false;}
    // Bounding segment count prevents unusually dense input from freezing mobile browsers.
    if(this.walls.segments.length>=6000)return false;
    this.walls.add(a,end);this.usedLength+=distance(a,end);this.last=end;return true;
  }
  endPen(){this.last=null;}
  attack(){
    if(!['ready','draw'].includes(this.phase))return;
    this.endPen();this.phase='defend';this.elapsed=0;this.nav=navigation(this);
    const homes=nests(this.stage);
    this.bees=Array.from({length:this.stage.bees.count},(_,i)=>({x:homes[i%homes.length].x,y:homes[i%homes.length].y,radius:this.stage.bees.radius,speed:this.stage.bees.speed*(1+i*.055),delay:i*.18,route:[],searching:false,angle:i}));
    for(const b of this.bees)this.routeBee(b);
  }
  routeBee(b){
    const n=this.nav;
    let start=-1,best=Infinity;
    // Connect spawn to the nearest grid point using the same exact collision test.
    for(let i=0;i<n.size;i++)if(n.free[i]){const d=distance(b,n.pos(i));if(d<best&&this.walls.clear(b,n.pos(i),b.radius)){start=i;best=d;}}
    if(start<0)return;
    let path=[start];
    if(n.routes[start]>=0){let i=start;while(n.routes[i]!==i&&path.length<n.size){i=n.routes[i];path.push(i);}}
    else{
      // A closed shelter has no path: approach its closest reachable boundary.
      const prev=new Int32Array(n.size).fill(-1),q=[start];prev[start]=start;let closest=start;
      const score=i=>Math.min(...this.stage.targets.map(t=>distance(n.pos(i),t)));
      for(let z=0;z<q.length;z++){const i=q[z];if(score(i)<score(closest))closest=i;for(const j of n.edges[i])if(prev[j]<0){prev[j]=i;q.push(j);}}
      path=[];for(let i=closest;;i=prev[i]){path.push(i);if(i===start)break;}path.reverse();b.searching=true;
    }
    b.route=path.map(n.pos);b.waypoint=0;
  }
  step(dt){
    if(!Number.isFinite(dt)||dt<=0)return;
    if(this.phase==='draw'){this.elapsed+=dt;if(this.elapsed>=this.stage.drawSeconds)this.attack();return;}
    if(this.phase!=='defend')return;
    const duration=Math.min(dt,this.stage.defendSeconds-this.elapsed);
    const ticks=Math.max(1,Math.ceil(duration/(1/120))),slice=duration/ticks;
    for(let k=0;k<ticks&&this.phase==='defend';k++){
      this.elapsed+=slice;
      for(const b of this.bees){
        if(this.elapsed<b.delay)continue;
        const target=this.stage.targets.reduce((a,t)=>distance(b,t)<distance(b,a)?t:a);
        let dest;
        if(this.walls.clear(b,target,b.radius))dest=target;
        else if(b.waypoint<b.route.length){dest=b.route[b.waypoint];if(distance(b,dest)<1){b.waypoint++;dest=b.route[b.waypoint];}}
        if(!dest){b.angle+=slice*(b.speed/20);dest={x:b.x+Math.cos(b.angle)*10,y:b.y+Math.sin(b.angle)*10};}
        const len=distance(b,dest),step=Math.min(b.speed*slice,len);
        if(len>0){const next={x:b.x+(dest.x-b.x)/len*step,y:b.y+(dest.y-b.y)/len*step};
          if(next.x>=b.radius&&next.x<=this.stage.width-b.radius&&next.y>=b.radius&&next.y<=this.stage.height-b.radius&&this.walls.clear(b,next,b.radius)){
            if(this.stage.targets.some(t=>pointDistance(t,b,next)<=t.radius+b.radius)){this.phase='lost';return;}
            b.x=next.x;b.y=next.y;
          }
        }
      }
      if(this.elapsed>=this.stage.defendSeconds-1e-8){this.elapsed=this.stage.defendSeconds;this.phase='won';}
    }
  }
}
const api={Model,Walls,pointDistance,segmentDistance};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
root.Hachiyoke=api;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),stages=root.HachiyokeStages;
const $=id=>document.getElementById(id),stageButtons=[...document.querySelectorAll('#stages button')];
let unlocked=1;
try{const saved=Number(root.localStorage.getItem('hachiyoke-unlocked-v1'));if(Number.isInteger(saved))unlocked=clamp(saved,1,stages.length);}catch(_error){/* Private browsing may disable storage. */}
let stageIndex=0,stage=stages[stageIndex],model=new Model(stage);
let pointer=null,previous=0,paused=false,shownPhase='',lastSecond=-1;
function updateStageUI(){
  $('stage-title').textContent=stage.id+' · '+stage.title;
  $('stage-hint').textContent=stage.hint||'森の子を囲ってみよう。';
  for(const [i,button] of stageButtons.entries()){
    button.disabled=i>=unlocked;
    if(i===stageIndex)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    button.title=i>=unlocked?'前のステージをクリアすると解放':stages[i].title;
  }
}
function selectStage(i){
  if(!Number.isInteger(i)||i<0||i>=unlocked||i>=stages.length)return;
  end();stageIndex=i;stage=stages[i];model=new Model(stage);shownPhase='';previous=0;
  updateStageUI();updateUI();
}
for(const [i,button] of stageButtons.entries())button.addEventListener('click',()=>selectStage(i));
function updateUI(){
  const phase=model.phase;
  $('pause-overlay').hidden=!paused||['won','lost'].includes(phase);
  if(shownPhase!==phase){
    shownPhase=phase;lastSecond=-1;
    if(phase==='won'&&stageIndex+2>unlocked){
      unlocked=Math.min(stages.length,stageIndex+2);
      try{root.localStorage.setItem('hachiyoke-unlocked-v1',String(unlocked));}catch(_error){/* In-memory progress still works. */}
      updateStageUI();
    }
    $('phase').textContent={ready:'線を描いて守ろう',draw:'描いています',defend:'森の子を守ろう',won:'守りきった！',lost:'蜂が届いてしまった…'}[phase];
    $('message').textContent={ready:stageIndex===0?'描き始めると5秒スタート。森の子を囲ってみよう。':stage.hint+' 描き始めると'+stage.drawSeconds+'秒スタート。',draw:'指を離しても続けて描けます。隙間をふさごう。',defend:'線が壁になりました。'+stage.defendSeconds+'秒間、見守ろう。',won:'成功！次のステージが解放されました。',lost:'隙間や壁の端から蜂が来たかも。囲い方を変えてみよう。'}[phase];
    $('finish').disabled=!['ready','draw'].includes(phase);
    $('result').hidden=!['won','lost'].includes(phase);
    $('next').hidden=phase!=='won'||stageIndex===stages.length-1;
    if(['won','lost'].includes(phase)){$('result-tag').textContent=phase==='won'?'SHELTER COMPLETE':'TRY ANOTHER LINE';$('result-title').textContent=phase==='won'?stage.defendSeconds+'秒、守りきった！':'もうひと工夫！';$('result-detail').textContent=phase==='won'?(stageIndex===stages.length-1?'全5ステージクリア！みんなを守れました。':'森の子は無事。次のステージへ進めます。'):'蜂が森の子に触れました。隙間なく囲ってみよう。';}
  }
  const value=phase==='draw'?Math.max(0,stage.drawSeconds-model.elapsed):phase==='defend'?Math.max(0,stage.defendSeconds-model.elapsed):phase==='ready'?stage.drawSeconds:0;
  const tenth=Math.ceil(value*10);if(tenth!==lastSecond){lastSecond=tenth;$('timer').textContent=(phase==='ready'||phase==='draw'?'描画 ':'防衛 ')+(tenth/10).toFixed(1)+'秒';}
  $('ink-remaining').textContent=stage.maxLength===undefined?'線の長さ：制限なし':'線のこり '+Math.max(0,Math.floor(stage.maxLength-model.usedLength));
  $('ink-fill').style.width=stage.maxLength===undefined?'100%':Math.max(0,100-model.usedLength/stage.maxLength*100)+'%';
}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function ellipse(x,y,rx,ry,rot,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function render(now){
  const dpr=Math.min(2,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect();
  const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  ctx.setTransform(canvas.width/stage.width,0,0,canvas.height/stage.height,0,0);
  ctx.fillStyle='#f0f2e5';ctx.fillRect(0,0,360,480);
  for(let y=16;y<480;y+=20)for(let x=10;x<360;x+=20)circle(x,y,.7,'#dce2d0');
  for(const [x,y,r] of [[-12,55,42],[360,210,30],[5,430,24],[350,445,48]]){circle(x,y,r,'#dbe6cc');circle(x+10,y-8,r*.7,'#d0dfbd');}
  // Visual no-draw rings match the protected geometric regions.
  if(['ready','draw'].includes(model.phase))for(const c of [...stage.targets,...nests(stage)]){ctx.beginPath();ctx.arc(c.x,c.y,c.radius+stage.lineWidth/2+8,0,Math.PI*2);ctx.strokeStyle='#abbba1';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);}
  for(const n of nests(stage)){
    ellipse(n.x,n.y,25,29,0,'#d69d48');for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(n.x-20,n.y+i*9);ctx.quadraticCurveTo(n.x,n.y+i*9+5,n.x+20,n.y+i*9);ctx.strokeStyle='#b37f35';ctx.lineWidth=2;ctx.stroke();}ellipse(n.x,n.y+9,8,10,0,'#52452e');
    ctx.font='10px system-ui';ctx.fillStyle='#6d785e';ctx.textAlign='center';ctx.fillText('蜂の巣',n.x,n.y-43);
  }
  ctx.strokeStyle='#315e66';ctx.lineWidth=stage.lineWidth;ctx.lineCap='round';ctx.lineJoin='round';
  for(const s of model.walls.segments){ctx.beginPath();ctx.moveTo(s.a.x,s.a.y);ctx.lineTo(s.b.x,s.b.y);ctx.stroke();if(distance(s.a,s.b)<.01)circle(s.a.x,s.a.y,stage.lineWidth/2,'#315e66');}
  for(const t of stage.targets){
    const x=t.x,y=t.y;ellipse(x,y+20,23,5,0,'#d0dac4');circle(x-12,y-13,9,'#b4815b');circle(x+12,y-13,9,'#b4815b');circle(x,y,18,'#c99a70');ellipse(x,y+6,13,11,0,'#f2dfbd');circle(x-7,y-1,2,'#35483c');circle(x+7,y-1,2,'#35483c');ellipse(x,y+5,3,2,0,'#35483c');ellipse(x+4,y-22,10,5,-.5,'#648552');
    ctx.fillStyle='#52684b';ctx.font='10px system-ui';ctx.fillText('森の子',x,y+43);
  }
  for(const b of model.bees){if(model.elapsed<b.delay)continue;const flutter=Math.sin(now*.04+b.delay)*.3;ellipse(b.x-4,b.y-7,6,4,-.6+flutter,'#ffffffd9');ellipse(b.x+4,b.y-7,6,4,.6-flutter,'#ffffffd9');ellipse(b.x,b.y,8,6,0,'#efbd47');ctx.fillStyle='#59452d';ctx.fillRect(b.x-3,b.y-5,2.5,10);ctx.fillRect(b.x+2,b.y-5,2.5,10);circle(b.x+6,b.y-1,1.2,'#243e3b');}
  if(model.phase==='ready'&&stageIndex===0){ctx.fillStyle='#718267';ctx.font='13px system-ui';ctx.fillText('ここに線を描いてみよう',180,215);ctx.font='10px system-ui';ctx.fillText('森の子をぐるっと囲むと…？',180,237);}
}
function position(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*stage.width/r.width,y:(e.clientY-r.top)*stage.height/r.height};}
canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;if(paused){e.preventDefault();resume();return;}if(pointer!==null||!['ready','draw'].includes(model.phase))return;e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(pointer);if(!model.pen(position(e),true))$('message').textContent='点線の外から描いてください。';updateUI();});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();const events=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():[];for(const p of events.length?events:[e])model.pen(position(p));});
function end(){pointer=null;model.endPen();}
canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
$('finish').addEventListener('click',()=>{end();model.attack();updateUI();});
function reset(){end();model.reset();shownPhase='';previous=0;updateUI();}
$('retry').addEventListener('click',reset);$('again').addEventListener('click',reset);
$('next').addEventListener('click',()=>{if(model.phase==='won')selectStage(stageIndex+1);});
function pause(){paused=document.hidden||!document.hasFocus();end();previous=0;updateUI();}
// Safari edge gestures can blur a visible page without delivering a later focus event.
// An explicit action may resume only a visible page; do not catch up elapsed time.
function resume(){if(document.hidden)return;paused=false;end();previous=0;updateUI();}
$('resume').addEventListener('click',resume);
document.addEventListener('visibilitychange',pause);window.addEventListener('blur',pause);window.addEventListener('focus',pause);
function frame(now){if(previous&&!paused)model.step(Math.min((now-previous)/1000,.05));previous=now;updateUI();render(now);requestAnimationFrame(frame);}
updateStageUI();updateUI();requestAnimationFrame(frame);
})(typeof globalThis==='undefined'?this:globalThis);
