// A challenge card always shows the initial board, never a solution.
function installPuzzleCard({button,status,getLevel,getIndex,chapter,audio}){
 button.onclick=async()=>{button.disabled=true;try{
  const l=getLevel(),c=document.createElement('canvas');c.width=1000;c.height=1200;const g=c.getContext('2d');
  g.fillStyle='#132936';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#e7c982';g.lineWidth=4;g.strokeRect(22,22,956,1156);
  g.fillStyle='#f6dfaa';g.font='bold 46px sans-serif';g.fillText('カギとトビラ',54,90);g.font='26px sans-serif';g.fillText('第'+chapter+'章  ·  '+(getIndex()+1)+'階「'+l.title+'」',54,140);
  g.fillStyle='#d5e9df';g.font='25px sans-serif';g.fillText('鍵を集めて、出口へ。あなたならどう解く？',54,190);
  const art=new Image();art.src='assets/sprites.png';await art.decode();
  const size=Math.min(76,860/l.map[0].length,720/l.map.length),left=(1000-size*l.map[0].length)/2,top=235;
  const sprite=(q,x,y)=>g.drawImage(art,(q%2)*art.width/2,Math.floor(q/2)*art.height/2,art.width/2,art.height/2,x,y,size,size);
  l.map.forEach((row,y)=>[...row].forEach((t,x)=>{const px=left+x*size,py=top+y*size,bridge=t==='O'||t==='-'&&!l.vertical||t==='|'&&l.vertical;
   g.fillStyle=t==='#'?'#637a76':t==='H'||t==='~'||(['-','|'].includes(t)&&!bridge)?'#081723':bridge?'#bd9250':t==='I'?'#a9dceb':'#52714d';g.fillRect(px+1,py+1,size-2,size-2);
   g.fillStyle='#fff0c8';g.font='bold '+Math.round(size*.46)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';const labels={a:'①',b:'②',A:'①',B:'②',X:'◆',Y:'◇',T:'切',R:'回',H:'穴'};if(labels[t]){if('ABXY'.includes(t)){g.strokeStyle='#d59483';g.lineWidth=3;g.strokeRect(px+5,py+5,size-10,size-10);}g.fillText(labels[t],px+size/2,py+size/2);}
   if(t==='P')sprite(0,px,py);if(t==='C'||l.box?.x===x&&l.box?.y===y)sprite(1,px,py);if(t==='K')sprite(2,px,py);if(t==='D'||t==='L')sprite(3,px,py);
  }));
  g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#d5e9df';g.font='25px sans-serif';
  const lines=['箱は押せる。人や箱で①②を押すと、同じ番号の道が開く。',...(chapter>=2?['「切」で◆◇を切り替え。操作はそのマスで。']:[]),...(chapter===3?['「回」で橋を回す。箱が橋の上にある間は回せない。']:[]),'時間制限なし。一手戻して、何度でも。'];
  lines.forEach((line,i)=>g.fillText(line,54,1010+i*36));
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('image');const url=window.URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kagi-to-tobira-floor-'+(getIndex()+1)+'.png';audio.reset();a.click();setTimeout(()=>window.URL.revokeObjectURL(url),10000);status.textContent='解答を含まない、開始時の問題画像を保存しました。';
 }catch{status.textContent='問題画像を作れませんでした。もう一度お試しください。';}finally{button.disabled=false;}};
}
