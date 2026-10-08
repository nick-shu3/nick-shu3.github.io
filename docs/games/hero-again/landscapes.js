'use strict';
(()=>{
// Scene-only artwork. Chapter distances, combat and saves stay in the engine.
const ROUTES={3:{file:'underworld',cells:[0,1,2,3,4,5],first:18},4:{file:'sky',cells:[0,1,2,3,4],first:24},5:{file:'sky',cells:[4,3,2,1,5],first:29},6:{file:'archive',cells:[0],first:34}};
function scene(stage,rank,won){
 if(stage===6&&won)return {file:'sky',cell:5};
 const route=ROUTES[stage],index=route&&rank-route.first;
 return route&&Number.isInteger(index)&&index>=0&&index<route.cells.length?{file:route.file,cell:route.cells[index]}:null;
}
function crop(file,cell,width,height,progress,returning){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<12||height<12)return null;
 const cols=file==='archive'?1:2,rows=file==='archive'?1:3;
 if(!Number.isInteger(cell)||cell<0||cell>=cols*rows)return null;
 const w=width/cols,h=height/rows,p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),view=(w-4)*.9;
 return {sx:(cell%cols)*w+2+(w-4-view)*(returning?1-p:p),sy:Math.floor(cell/cols)*h+2,sw:view,sh:h-4};
}
function load(){
 const assets=Object.create(null);
 for(const file of ['underworld','sky','archive']){
  const image=new Image(),asset={image,ready:false};assets[file]=asset;
  image.onload=()=>{asset.ready=image.naturalWidth>=12&&image.naturalHeight>=12;};image.onerror=()=>{asset.ready=false;};image.src='assets/landscape-'+file+'.webp';
 }
 return assets;
}
function draw(g,assets,stage,rank,progress,won){
 const view=scene(stage,rank,won),asset=view&&assets[view.file];if(!asset||!asset.ready)return false;
 const c=crop(view.file,view.cell,asset.image.naturalWidth,asset.image.naturalHeight,progress,stage===5);if(!c)return false;
 g.drawImage(asset.image,c.sx,c.sy,c.sw,c.sh,0,0,800,340);return true;
}
const api={ROUTES,scene,crop,load,draw};
if(typeof module==='object'&&module.exports)module.exports=api;else window.HeroLandscapes=api;
})();
