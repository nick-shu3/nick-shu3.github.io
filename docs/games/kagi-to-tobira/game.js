const levels = [
 {title:'はじめての冒険',intro:'カギをひろって、トビラまで行こう！',map:['#######','#....D#','#..K..#','#.....#','#P....#','#######'],hints:['黄色いカギの上に乗ってみよう。','カギを取ったら、右上の扉へ進もう。']},
 {title:'箱とスイッチ',intro:'鉄格子の先にカギがある。スイッチを調べよう！',map:['#########','#....#.D#','#....A..#','#..a.#.K#','#..C.#..#','#P...#..#','#########'],hints:['丸印①のスイッチに乗って、鉄格子の変化を見よう。','スイッチは、人や箱が載っている間だけ作動する。','箱の下に回りこみ、上へ押してスイッチに載せよう。']},
 {title:'回りこむ道',intro:'箱を運ぶには、押す側へ回りこむ道も必要だ。',map:['#########','#....#.D#','#.a..A.K#','#.#..#..#','#..C.#..#','#P...####','#########'],hints:['スイッチの下には壁がある。どちら側から箱を運べるだろう？','箱を上へ運んでから、左へ押すとスイッチに届く。','まず箱を上へ2回。次に右側へ回りこみ、左へ1回押そう。']},
 {title:'ひとつの箱、ふたつの役目',intro:'①はカギへの道、②は出口への道。箱はひとつ。',map:['#########','#....#K.#','#.a..A..#','#....####','#..C.#.D#','#.b..B..#','#P...####','#########'],hints:['まず①の先のカギを取ろう。その後、箱を使う場所は？','カギを持ち帰れば、①を閉じてもよい。箱を②へ運び直そう。','①に置いた箱の上へ回りこみ、下へ3回押すと②に届く。']},
 {title:'カギを使う順番',intro:'この部屋のカギは使うとなくなる。どの扉から開けよう？',consume:true,map:['#########','#K..LKK##','#...#####','#P..L..D#','#...#####','#########'],hints:['上の扉の先にはカギが2本。出口へ向かう前に何ができる？','最初のカギを出口への通路に使うと、出口を開ける分がなくなる。','上の扉を開けてカギを2本取り、下の扉と出口に1本ずつ使おう。']},
 {"title":"箱の橋","intro":"穴には進めない。箱を落とすと、渡れる橋になる。","map":["#########","#...#..D#","#PC.H.K.#","#...#...#","#########"],"hints":["黒い穴が向こう岸への道をふさいでいる。","箱を穴へ押してみよう。箱が橋に変わる。","箱を右へ2回押すと橋になる。向こう岸でカギを取ろう。"]},
 {"title":"橋にする、その前に","intro":"箱はひとつ。スイッチと橋、どちらから使おう？","map":["#########","#....#K.#","#.a..A..#","#....####","#..C.#.D#","#....H..#","#P...####","#########"],"hints":["橋になった箱は、もう動かせない。先にしておくことは？","①で鉄格子を開けて、先にカギを持ち帰ろう。","箱を①から下へ3回運び、右へ押して穴に落とそう。"]},
 {"title":"氷の運び道","intro":"箱は氷の上を滑る。壁で止めて、押す向きを変えよう。","map":["#########","#....#.D#","#.aIII..#","#.#..I.##","#PCIIIAK#","#.....###","#########"],"hints":["氷で滑るのは箱だけ。自分は一歩ずつ歩ける。","右へ滑らせた箱を、下から上へ押してみよう。","箱を右、上、左の順に押す。最後は箱の右側へ回りこもう。"]},
 {"title":"回収して、滑らせて","intro":"カギを集め、箱を回収。氷の先に最後の使い道がある。","consume":true,"map":["#########","#....#KK#","#.a..A..#","#....####","#..C.##D#","#..IIHL.#","#P...####","#########"],"hints":["向こうの扉と出口に、カギが1本ずつ必要になる。","先に①の鉄格子の先でカギを2本取ろう。","箱を①から下へ3回。右へ押すと氷を滑って橋になる。"]},
 {"title":"最後の部屋・すべてをつなぐ","intro":"2つのスイッチ、消えるカギ、氷と橋。手順をつないで脱出しよう。","consume":true,"map":["###########","#.....#..K#","#.a...A...#","#.....#####","#..C..#####","#.b...BLKK#","#.....#####","#..IIIH.LD#","#P....#####","###########"],"hints":["箱を橋に変えるのは最後。まず①と②の先を調べよう。","①のカギで、②の先の扉を開ける。奥のカギ2本を持ち帰ろう。","箱を①から②へ運び直してカギを回収。その後、箱を②から下へ2回、右へ押して橋にしよう。"]}
];
// Introductions describe the situation; hints reveal the plan in stages.
levels[2].intro='スイッチの手前には壁。箱を運ぶ道は見つかる？';
levels[7].intro='氷の上では、箱だけが滑る。';
levels[8].intro='箱はひとつ。鍵と出口は、別々の場所にある。';
levels[9].intro='10階・総合問題。今までの仕掛けが集まった部屋。';
levels[0].hints=['黄色い鍵と、右上の扉を探そう。','鍵のあるマスへ歩くと、鍵を持てる。','鍵を拾ったら、右上の出口へ進もう。'];
function initial(index){const l=levels[index];let p,b=null;l.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='P')p={x,y};if(c==='C')b={x,y}}));return {index,p,b,keys:0,picked:[],opened:[],bridged:[],won:false,steps:0,message:index===0?'まずは黄色いカギを探そう':'部屋の仕掛けを調べよう'};}
function tile(s,x,y){return levels[s.index].map[y]?.[x]||'#';}
function coord(p){return p.x+','+p.y;}
function onPlate(s,id){return tile(s,s.p.x,s.p.y)===id || !!(s.b&&tile(s,s.b.x,s.b.y)===id);}
function transition(s,dx,dy){
 if(s.won)return null;
 const n=JSON.parse(JSON.stringify(s)),x=s.p.x+dx,y=s.p.y+dy,t=tile(s,x,y),at=x+','+y,l=levels[s.index];
 if(t==='#'||(t==='H'&&!s.bridged.includes(at))||(['A','B'].includes(t)&&!gateOpen(s,t)))return null;
 if((t==='D'||t==='L'&&!s.opened.includes(at))&&s.keys===0)return null;
 let pushed=false,slid=false,madeBridge=false;
 if(s.b&&s.b.x===x&&s.b.y===y){
  let bx=x+dx,by=y+dy;
  if(!boxPassable(s,bx,by))return null;
  while(true){
   const bt=tile(s,bx,by),bp=bx+','+by;
   if(bt==='H'&&!n.bridged.includes(bp)){n.bridged.push(bp);n.b=null;madeBridge=true;break;}
   n.b={x:bx,y:by};
   if(bt!=='I')break;
   const nx=bx+dx,ny=by+dy;if(!boxPassable(s,nx,ny))break;
   bx=nx;by=ny;slid=true;
  }
  pushed=true;
 }
 n.p={x,y};n.steps++;n.message='';
 if(pushed)n.message=madeBridge?'箱が橋になった！ 上を歩いて渡れる':n.b&&['a','b'].includes(tile(n,n.b.x,n.b.y))?'箱がスイッチを押さえている。鉄格子は開いたままだ！':slid?'箱が氷を滑った！ 次はどちらから押そう？':'箱を押した';
 for(const id of ['a','b']){if(onPlate(s,id)&&!onPlate(n,id))n.message='離れたら鉄格子が閉じた。何かを置けないだろうか？';else if(!onPlate(s,id)&&onPlate(n,id)&&!pushed)n.message='足で踏むと鉄格子が開いた！ 離れたらどうなる？';}
 if(t==='K'&&!n.picked.includes(at)){n.picked.push(at);n.keys++;n.message='カギをひろった！';}
 if(t==='L'&&!n.opened.includes(at)){n.keys--;n.opened.push(at);n.message='カギを1本使って扉を開けた';}
 if(t==='D'){if(l.consume)n.keys--;n.won=true;n.message='出口の扉が開いた！';}
 return n;
}

function gateOpen(s,id){return onPlate(s,id.toLowerCase())||tile(s,s.p.x,s.p.y)===id||!!(s.b&&tile(s,s.b.x,s.b.y)===id);}
function boxPassable(s,x,y){const t=tile(s,x,y);return t!=='#'&&(!['A','B'].includes(t)||gateOpen(s,t))&&(t!=='L'||s.opened.includes(x+','+y))&&(t!=='D'||s.keys>0);}
function rotateMap(map){return [...map[0]].map((_,x)=>map.map(r=>r[x]).reverse().join(''));}
levels[6].map=rotateMap(levels[6].map);
levels[6].hints=['橋にした箱は、スイッチには戻せない。','鉄格子の先でカギを取り、箱のところまで戻ろう。','箱をスイッチから穴と同じ列まで運び、穴の反対側から押そう。'];
levels[8].map=rotateMap(levels[8].map);
levels[8].hints=['出口までに扉が2枚。カギは何本必要？','鉄格子の奥でカギを2本取ってから、箱を回収しよう。','箱を氷の通路に合わせ、穴へ向かって押そう。'];
levels[9]={title:'はじまりの扉',intro:'目の前にある出口。部屋を巡り、最後はここへ戻ってこよう。',consume:true,map:['###########','#K..#.....#','#...A...a.#','#####.....#','#####...C.#','#KKLB.b...#','#####.....#','#DL.HIII..#','#####...P.#','###########'],hints:['箱を橋にするのは最後。①と②の先で、まずカギを集めよう。','①で得たカギを②の先の扉に使うと、カギが2本手に入る。','箱を②から回収し、氷の右側まで運ぶ。左へ滑らせて、はじめに見えた扉への橋にしよう。']};
if(typeof module!=='undefined')module.exports={levels,initial,transition,onPlate,gateOpen,boxPassable};
