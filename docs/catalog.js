(()=>{
const buttons=[...document.querySelectorAll('[data-category]')],works=[...document.querySelectorAll('[data-type]')];
function filter(category){let count=0;for(const card of works){card.hidden=category!=='all'&&card.dataset.type!==category;if(!card.hidden)count++;}for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.category===category));document.getElementById('count').textContent=count+'作品';document.getElementById('empty').hidden=count!==0;}
buttons.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.category)));document.getElementById('showAll').onclick=()=>filter('all');
// Static illustration using the game's own palette and robot shapes.
const c=document.getElementById('squadPreview'),g=c.getContext('2d');g.fillStyle='#142a34';g.fillRect(0,0,1000,525);g.strokeStyle='#2d4b55';for(let x=550;x<1000;x+=140){g.beginPath();g.moveTo(x,0);g.lineTo(x,525);g.stroke();}
g.fillStyle='#e5f3eb';g.font='900 65px system-ui';g.fillText('SQUAD',42,165);g.fillStyle='#75edba';g.fillText('FRONT',42,239);g.font='bold 24px system-ui';g.fillText('ふやして、守れ。',46,297);
function robot(x,y,color){g.fillStyle=color;g.fillRect(x-17,y-25,34,18);g.fillRect(x-20,y-4,40,32);g.fillRect(x-20,y+28,11,13);g.fillRect(x+9,y+28,11,13);g.fillStyle='#162b32';g.fillRect(x-11,y-20,22,5);g.fillStyle='#badfce';g.fillRect(x-4,y-39,8,15);}
for(const x of [645,696,747,798,849])robot(x,407,'#75edba');for(const x of [645,747,849]){for(let y=215;y<345;y+=31){g.fillStyle='#caffdd';g.fillRect(x-2,y,4,16);}}robot(645,125,'#ff7c77');robot(849,76,'#ff7c77');g.strokeStyle='#75edba';g.strokeRect(707,110,80,65);g.fillStyle='#75edba';g.font='bold 21px system-ui';g.fillText('援軍',726,136);g.font='bold 26px system-ui';g.fillText('+2',729,164);g.fillStyle='#75edba';g.fillRect(530,470,425,2);
})();
