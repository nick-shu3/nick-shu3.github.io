'use strict';
(() => {
const DESIGNS = Object.freeze({
 '魔王': {file:'demon-king',color:'#f15b59',height:154,width:142,kind:'sword'},
 '覚醒魔王': {file:'awakened-king',color:'#cf77ff',height:160,width:152,kind:'sword'},
 '終門の王': {file:'gate-king',color:'#edc582',height:151,width:155,kind:'shield'},
 '環の書記官': {file:'ring-scribe',color:'#8bdcff',height:145,width:150,kind:'magic'}
});
function design(enemy){return enemy && enemy.boss===true && Object.hasOwn(DESIGNS,enemy.name)?DESIGNS[enemy.name]:null;}
function pose(kind,age,time,attack,reduced){
 if(reduced)return {alpha:1,dx:0,dy:0,scale:1,angle:0,pulse:0};
 const entry=Math.min(1,Math.max(0,age)/.65),hit=Math.sin(Math.PI*Math.min(1,Math.max(0,attack)/.28));
 return {alpha:.35+.65*entry,dx:(1-entry)*22-hit*(kind==='shield'?7:13),dy:kind==='magic'?Math.sin(time*2.2)*3:Math.sin(time*3)*.7,scale:1+(1-entry)*.08,angle:hit*(kind==='sword'?-.075:kind==='shield'?.035:0),pulse:(Math.sin(time*3)+1)/2};
}
function load(){
 const images=Object.create(null);
 for(const item of Object.values(DESIGNS)){
  const image=new Image(),entry={image,ready:false};images[item.file]=entry;
  image.onload=()=>{entry.ready=image.naturalWidth>0&&image.naturalHeight>0;};
  image.onerror=()=>{entry.ready=false;};image.src='assets/boss-'+item.file+'.webp';
 }
 return images;
}
function draw(g,images,enemy,x,age,time,attack,reduced){
 const item=design(enemy),asset=item&&images[item.file];if(!asset||!asset.ready)return false;
 const p=pose(item.kind,age,time,attack,reduced),image=asset.image;
 const ratio=Math.min(item.width/image.naturalWidth,item.height/image.naturalHeight),w=image.naturalWidth*ratio,h=image.naturalHeight*ratio;
 g.save();g.translate(x,266);g.globalAlpha=p.alpha;
 g.beginPath();g.ellipse(0,0,40+p.pulse*3,7,0,0,Math.PI*2);g.fillStyle=item.color+'33';g.fill();
 g.translate(p.dx,p.dy);g.rotate(p.angle);g.scale(p.scale,p.scale);
 g.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,-w/2,-h,w,h);
 if(item.kind==='magic'){
  g.save();g.translate(0,-h*.58);g.rotate(reduced?0:time*.25);g.strokeStyle=item.color+'88';g.lineWidth=1.5;
  for(let i=0;i<4;i++){const a=i*Math.PI/2;g.beginPath();g.arc(0,0,48,a,a+.9);g.stroke();}g.restore();
 }
 if(attack>0&&!reduced){
  g.strokeStyle=item.color;g.lineWidth=item.kind==='shield'?5:3;g.beginPath();
  if(item.kind==='magic'){g.moveTo(-35,-h*.45);g.lineTo(-62,-h*.46);g.lineTo(-75,-h*.32);}
  else if(item.kind==='shield'){g.moveTo(-w*.44,-h*.6);g.lineTo(-w*.48,-h*.18);}
  else g.arc(-12,-h*.42,49,Math.PI*.65,Math.PI*1.4);
  g.stroke();
 }
 g.restore();return true;
}
const api={DESIGNS,design,pose,load,draw};
if(typeof module==='object'&&module.exports)module.exports=api;else window.HeroBosses=api;
})();
