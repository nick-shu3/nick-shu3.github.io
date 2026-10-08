'use strict';
(()=> {
const HERO_X=185,CONTACT_X=245,SPAWN_X=830;
function enemyX(state,enemy){
 if(state.phase==='fight'||state.phase==='fallen')return CONTACT_X;
 const progress=Math.max(0,Math.min(1,(state.x-(enemy.x-(enemy.approach||100)))/(enemy.approach||100)));
 return SPAWN_X+(CONTACT_X-SPAWN_X)*progress;
}
function layout(stage){
 const direction=stage===2||stage===5?-1:1;
 return {direction,heroX:direction<0?800-HERO_X:HERO_X,stairs:stage>=3&&stage<=5};
}
function screenX(stage,x){return layout(stage).direction<0?800-x:x;}
function groundY(stage,x){const view=layout(stage);return 266-(view.stairs?(x-view.heroX)*.08:0);}
function sceneEnemyX(state,enemy){return screenX(state.stage,enemyX(state,enemy));}
function stride(time){return Math.sin(time*14)*.7;}
function runFrame(time){return Math.floor(time*10)%4;}
const api={HERO_X,CONTACT_X,SPAWN_X,enemyX,layout,screenX,groundY,sceneEnemyX,stride,runFrame};
if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
window.HeroMotion=api;
})();
