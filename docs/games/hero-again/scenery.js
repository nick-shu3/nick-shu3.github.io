'use strict';
(()=>{
// Presentation only: this module never reads or writes saved progress.
const THEMES=[
 {name:'草原',color:'#e4cf8a',road:'#baa578',particle:'petal'},
 {name:'森',color:'#a6dbc0',road:'#746b53',particle:'light'},
 {name:'岩山',color:'#b7cad3',road:'#93958b',particle:'dust'},
 {name:'遺跡',color:'#dcbe88',road:'#a59b86',particle:'dust'},
 {name:'氷峠',color:'#b7eeff',road:'#c9e1e8',particle:'snow'},
 {name:'火山',color:'#ffb074',road:'#705f61',particle:'ember'},
 {name:'砦',color:'#c4a2a1',road:'#8b858f',particle:'dust'},
 {name:'城道',color:'#c2b2f5',road:'#9992b1',particle:'light'},
 {name:'魔王城',color:'#f292ad',road:'#806473',particle:'ember'}
];
function realm(stage,index){return stage===2?8-index:index;}
function crop(index,width,height,progress,returning){
 const w=width/3,h=height/3,p=Math.max(0,Math.min(1,progress));
 return {sx:index%3*w+2+(w-4)*.12*(returning?1-p:p),sy:Math.floor(Math.floor(index/3)*h)+2,sw:(w-4)*.88,sh:Math.floor(h)-4};
}
function zoneProgress(x,index){const begin=index*5000,end=Math.min(42195,begin+5000);return Math.max(0,Math.min(1,(x-begin)/(end-begin)));}
function gearColor(index){return index<0?'#d8c193':THEMES[index<9?index:17-index].color;}
const api={THEMES,realm,crop,zoneProgress,gearColor};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}window.HeroScenery=api;
})();
