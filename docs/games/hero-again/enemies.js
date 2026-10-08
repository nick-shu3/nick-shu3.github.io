'use strict';
(() => {
const FAMILIES=Object.freeze({
 slime:{style:'bounce',height:48,width:95},goblin:{style:'stride',height:79,width:96},stone:{style:'heavy',height:78,width:107},lizard:{style:'stride',height:55,width:118},skeleton:{style:'stride',height:88,width:99},
 wolf:{style:'stride',height:57,width:115},magma:{style:'heavy',height:79,width:111},dragon:{style:'float',height:72,width:118},knight:{style:'stride',height:88,width:102}
});
const FRAMES={"slime":[[52,117,146,99],[257,92,180,127],[31,292,198,148],[244,293,231,147]],"skeleton":[[39,69,164,160],[266,47,192,183],[11,280,227,167],[243,259,234,188]],"goblin":[[23,93,192,137],[257,80,208,150],[10,293,226,149],[240,286,238,157]],"stone":[[51,79,158,138],[245,66,208,151],[14,283,226,149],[240,276,233,159]],"lizard":[[43,121,178,98],[252,90,213,134],[17,297,220,141],[242,284,234,159]],"wolf":[[18,75,188,118],[261,74,204,122],[17,296,215,145],[244,291,230,153]],"magma":[[47,93,166,128],[245,72,195,150],[23,285,217,146],[240,263,220,170]],"dragon":[[51,97,160,108],[273,70,187,140],[15,261,225,171],[240,254,237,184]],"knight":[[20,89,205,137],[250,82,221,148],[11,303,220,144],[245,296,230,154]]};
const TYPES=['slime','wolf','stone','goblin','skeleton','lizard'];
function family(e,stage){
 if(!e||e.boss===true)return null;
 const name=typeof e.name==='string'?e.name.slice(0,80):'';
 if(/スライム/.test(name))return 'slime';
 if(/ゴブリン/.test(name))return 'goblin';
 if(/骸骨|亡霊/.test(name))return 'skeleton';
 if(/トカゲ/.test(name))return 'lizard';
 if(/竜|翼/.test(name))return 'dragon';
 if(/狼|獣/.test(name))return 'wolf';
 if(/融鉄|熔岩|溶岩|流岩/.test(name))return 'magma';
 if(/魔人|石像|巨人|岩殻|圧晶|水晶|大地の精/.test(name))return 'stone';
 if(/兵|騎士|近衛|守り手|使い|魔術師|薄気|陽光|氷の番|風切り/.test(name))return 'knight';
 if(stage>=3&&/精/.test(name))return 'dragon';
 return Number.isInteger(e.type)&&e.type>=0&&e.type<TYPES.length?TYPES[e.type]:null;
}
function tier(e,stage){
 if(stage===0)return 0;
 const rank=Number.isInteger(e.rank)&&e.rank>=0&&e.rank<=34?e.rank:0;
 if(stage===1)return Math.min(2,Math.floor(rank/3));
 if(stage===2)return rank<12?2:3;
 return rank<24?2:3;
}
function variant(e,stage){const key=family(e,stage);return key?{key,sheet:key,...FAMILIES[key],tier:tier(e,stage)}:null;}
function pose(style,time,walking,attack,reduced){
 if(reduced)return {dx:0,dy:0,sx:1,sy:1,angle:0};
 const cycle=Math.sin(time*(style==='heavy'?7:12)),hit=Math.sin(Math.PI*Math.min(1,Math.max(0,attack)/.28));
 return {dx:-hit*7,dy:style==='float'?Math.sin(time*3)*3:walking?-Math.abs(cycle)*(style==='bounce'?7:style==='heavy'?1.2:2):0,
 sx:style==='bounce'&&walking?1+cycle*.04:1,sy:style==='bounce'&&walking?1-cycle*.04:1,angle:walking&&style!=='bounce'&&style!=='float'?cycle*.015:-hit*.035};
}
function load(){
 const images=Object.create(null);
 for(const name of Object.keys(FAMILIES)){
  const image=new Image(),asset={image,ready:false};images[name]=asset;
  image.onload=()=>{asset.ready=image.naturalWidth>=2&&image.naturalHeight>=2;};
  image.onerror=()=>{asset.ready=false;};image.src='assets/enemy-'+name+'.webp';
 }
 return images;
}
function draw(g,images,e,x,stage,time,phase,attack,reduced){
 const v=variant(e,stage),asset=v&&images[v.sheet];if(!asset||!asset.ready)return false;
 const image=asset.image,frame=FRAMES[v.key]?.[v.tier];if(!frame)return false;
 const [sx,sy,sw,sh]=frame;if(sx<0||sy<0||sw<=0||sh<=0||sx+sw>image.naturalWidth||sy+sh>image.naturalHeight)return false;
 const p=pose(v.style,time,phase==='walk',attack,reduced),scale=Math.min((v.height+v.tier*3)/sh,(v.width+v.tier*3)/sw),height=sh*scale,width=sw*scale;
 g.save();g.translate(x,266);g.beginPath();g.ellipse(0,0,25+v.tier*2,5,0,0,Math.PI*2);g.fillStyle='#102a3059';g.fill();
 g.translate(p.dx,p.dy);g.rotate(p.angle);g.scale(p.sx,p.sy);
 if(stage===2){g.shadowColor='#b77cfa';g.shadowBlur=reduced?3:4+Math.sin(time*3)*1.5;}
 // Slimes remain blue in every chapter; only named elemental variants shift hue.
 if(v.key!=='slime'){
  if(/氷|霜|凍/.test(e.name))g.filter='saturate(.5) brightness(1.15)';
  else if(/火トカゲ/.test(e.name))g.filter='hue-rotate(300deg) saturate(1.25)';
 }
 g.drawImage(image,sx,sy,sw,sh,-width/2,-height,width,height);
 g.restore();return true;
}
const api={FAMILIES,FRAMES,family,tier,variant,pose,load,draw};
if(typeof module==='object'&&module.exports)module.exports=api;else window.HeroEnemies=api;
})();
