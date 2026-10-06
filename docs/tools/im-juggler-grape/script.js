'use strict';
(()=>{
 const M=window.GrapeMath,$=id=>document.getElementById(id),fmt=n=>n.toLocaleString('ja-JP'),prob=x=>x===0?'0%':x<.0005?'<0.1%':x>.9995?'約100%':(100*x).toFixed(1)+'%';
 let mode='direct',negative=false,current=null,simulation=null;
 const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
 function metric(parent,title,value,sub,cls){const box=node('div','',cls);box.append(node('span',title),node('strong',value));if(sub)box.append(node('small',sub));parent.append(box);}
 function invalidate(){current=null;$('result').replaceChildren(node('p','入力後に「ブドウ確率を計算」を押してください'),node('strong','—'));$('bonus-results').hidden=true;$('comparison').textContent='計算すると、実戦値との比較を表示します。';$('tail-context').textContent='実戦データを計算すると表示します。';$('tails').replaceChildren();$('use-games').disabled=true;$('input-error').textContent='';draw();}
 function setMode(next){mode=next;$('mode-direct').setAttribute('aria-pressed',String(mode==='direct'));$('mode-reverse').setAttribute('aria-pressed',String(mode==='reverse'));$('grapes-label').hidden=mode!=='direct';$('reverse-fields').hidden=mode!=='reverse';invalidate();}
 $('mode-direct').addEventListener('click',()=>setMode('direct'));$('mode-reverse').addEventListener('click',()=>setMode('reverse'));
 for(const id of ['games','grapes','big','reg','delta','cherry'])$(id).addEventListener('input',()=>{if(id==='delta'&&$('delta').value.startsWith('-')){negative=true;$('delta-sign').textContent='−';$('delta-sign').setAttribute('aria-pressed','true');$('delta').value=$('delta').value.slice(1);}if(id==='cherry')$('cherry-state').textContent=$('cherry').checked?'ON':'OFF';invalidate();});
 $('delta-sign').addEventListener('click',()=>{negative=!negative;$('delta-sign').textContent=negative?'−':'＋';$('delta-sign').setAttribute('aria-pressed',String(negative));if($('delta').value.startsWith('-'))$('delta').value=$('delta').value.slice(1);invalidate();});
 $('cherry-help-button').addEventListener('click',()=>{const open=$('cherry-help').hidden;$('cherry-help').hidden=!open;$('cherry-help-button').setAttribute('aria-expanded',String(open));});
 $('calculate').addEventListener('click',()=>{
  invalidate();try{
   const n=M.integer($('games').value,'総ゲーム数',1);
   if(mode==='direct')current=M.direct(n,M.integer($('grapes').value,'ブドウ回数',0,n));
   else{const b=M.integer($('big').value,'BIG回数',0,n),r=M.integer($('reg').value,'REG回数',0,n);let d=M.integer($('delta').value,'差枚数',-50000000,50000000);if(negative)d=-Math.abs(d);current=M.reverse(n,b,r,d,$('cherry').checked);}
   renderResult();
  }catch(e){$('input-error').textContent=e.message;}
 });
 function renderResult(){
  const x=current,label=x.estimated?'推定ブドウ確率':'実測ブドウ確率',den=x.denominator===null?'0回（確率未算出）':'1/'+x.denominator.toFixed(2);
  $('result').replaceChildren(node('p',label),node('strong',den),node('small',fmt(x.n)+'G ／ '+(x.estimated?'推定 '+x.k.toLocaleString('ja-JP',{maximumFractionDigits:1}):fmt(x.k))+'回'));
  if(x.estimated)$('result').append(node('p','差枚からの推定です。実際のカウントとは異なります。'));
  $('bonus-results').replaceChildren();$('bonus-results').hidden=!x.estimated;
  if(x.estimated){for(const [name,k] of [['BIG',x.b],['REG',x.r],['合算',x.b+x.r]])metric($('bonus-results'),name,fmt(k)+'回',k?'1/'+(x.n/k).toFixed(1):'0回（確率未算出）');metric($('bonus-results'),'差枚',(x.d>0?'+':'')+fmt(x.d)+'枚');}
  const da=Math.abs(x.k/x.n-M.P[0]),db=Math.abs(x.k/x.n-M.P[1]);
  $('comparison').textContent=(x.estimated?'あなたの推定値 ':'あなたの実測値 ')+den+'。'+(x.k===0?'0回のため1/xは表示しません。':Math.abs(da-db)<1e-12?'両基準の中間です。':'出現率（回数/G）では'+(da<db?'1/6.02':'1/5.78')+'側に近い結果です。');
  const tails=M.tails(x.n,x.k);$('tail-context').textContent=fmt(x.n)+'G・'+(x.estimated?'推定':'実測')+'ブドウ '+(x.estimated?x.k.toFixed(1):fmt(x.k))+'回を基準に計算';
  metric($('tails'),'1/6.02を仮定：今回以上に良くなる確率',prob(tails[0]),'ブドウ回数が今回以上','purple');metric($('tails'),'1/5.78を仮定：今回以下になる確率',prob(tails[1]),'ブドウ回数が今回以下','teal');
  $('use-games').disabled=false;draw();
 }
 $('sim-preset').addEventListener('change',()=>{$('custom-label').hidden=$('sim-preset').value!=='custom';});
 $('use-games').addEventListener('click',()=>{if(!current)return;$('sim-preset').value='custom';$('custom-label').hidden=false;$('sim-custom').value=current.n;run();});$('run').addEventListener('click',run);
 function run(){
  $('sim-error').textContent='';let n,trials;
  try{n=M.integer($('sim-preset').value==='custom'?$('sim-custom').value:$('sim-preset').value,'シミュレーションのゲーム数',1);trials=M.integer($('trials').value,'試行回数',1,50000);}catch(e){$('sim-error').textContent=e.message;return;}
  $('run').disabled=true;$('use-games').disabled=true;$('sim-status').textContent='計算中…';
  setTimeout(()=>{try{
   const dist=M.P.map(p=>M.distribution(n,p)),samples=dist.map(d=>M.simulate(d,trials));
   const low=dist.map(d=>M.quantile(d,.001)),high=dist.map(d=>M.quantile(d,.999));
   let xmin=Math.min(...high.map(k=>n/Math.max(1,k))),xmax=Math.max(...low.map(k=>n/Math.max(1,k)));const pad=Math.max(.08,(xmax-xmin)*.08);xmin=Math.max(1,xmin-pad);xmax+=pad;
   simulation={n,trials,dist,samples,xmin,xmax};$('sim-status').textContent=fmt(n)+'G × 各'+fmt(trials)+'回';$('sim-summary').replaceChildren();
   dist.forEach((d,i)=>{const a=M.quantile(d,.025),b=M.quantile(d,.975);metric($('sim-summary'),i?'1/5.78想定：中央約95%':'1/6.02想定：中央約95%',(n/Math.max(1,b)).toFixed(2)+' ～ '+(a?(n/a).toFixed(2):'上限なし'),'1/xの分母。二項分布による理論範囲',i?'teal':'purple');});draw();
  }catch(e){$('sim-error').textContent='計算できませんでした。入力を確認してください。';$('sim-status').textContent='未完了';}finally{$('run').disabled=false;$('use-games').disabled=!current;}},0);
 }
 function draw(){
  if(!simulation)return;const s=simulation,canvas=$('chart'),rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w)return;
  const dpr=Math.min(window.devicePixelRatio||1,3);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const c=canvas.getContext('2d');c.scale(dpr,dpr);
  const left=43,right=w-12,top=48,bottom=h-35,width=right-left,height=bottom-top,bins=Math.max(24,Math.min(55,Math.floor(width/8))),step=(s.xmax-s.xmin)/bins;
  const outside=[],hist=s.samples.map(sample=>{const a=new Uint32Array(bins);let extra=0;for(let k=0;k<sample.length;k++){if(!sample[k])continue;const value=k?s.n/k:Infinity,idx=Math.floor((value-s.xmin)/step);if(idx>=0&&idx<bins)a[idx]+=sample[k];else extra+=sample[k];}outside.push(extra);return a;});
  const max=Math.max(1,...hist[0],...hist[1])*1.12,px=x=>left+(x-s.xmin)/(s.xmax-s.xmin)*width,py=y=>bottom-y/max*height;
  c.font='11px -apple-system,sans-serif';c.fillStyle='#686174';c.textAlign='left';c.fillText('発生頻度（回）',0,16);
  for(let i=0;i<=4;i++){const y=top+height*i/4;c.strokeStyle='#eee9f3';c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();c.textAlign='right';c.fillText(String(Math.round(max*(1-i/4))),left-6,y+4);}
  for(let i=0;i<=4;i++){const x=s.xmin+(s.xmax-s.xmin)*i/4;c.textAlign=i===0?'left':i===4?'right':'center';c.fillText('1/'+x.toFixed(s.xmax>30?0:2),px(x),bottom+23);}
  hist.forEach((a,j)=>{c.beginPath();c.moveTo(left,bottom);for(let i=0;i<bins;i++){c.lineTo(left+width*(i+.5)/bins,py(a[i]));}c.lineTo(right,bottom);c.closePath();c.fillStyle=j?'#087f8330':'#794db035';c.fill();c.beginPath();for(let i=0;i<bins;i++){const x=left+width*(i+.5)/bins,y=py(a[i]);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle=j?'#087f83':'#794db0';c.lineWidth=2;c.setLineDash(j?[5,3]:[]);c.stroke();c.setLineDash([]);});
  let marker='実戦データを計算すると、あなたの値を縦線で表示します。';
  if(current){const type=current.estimated?'推定':'実測';if(current.denominator===null)marker='あなたの実測は0回です。1/xが定義できないため、縦線は表示しません。';else{
   const v=current.denominator,x=Math.max(left,Math.min(right,px(v))),inside=v>=s.xmin&&v<=s.xmax;
   c.strokeStyle='#292134';c.lineWidth=1.5;c.setLineDash([4,3]);c.beginPath();c.moveTo(x,top-7);c.lineTo(x,bottom);c.stroke();c.setLineDash([]);c.fillStyle='#292134';c.textAlign='center';c.font='bold 12px -apple-system,sans-serif';const text=(inside?'▼':'範囲外 ')+(current.estimated?'推定 ':'あなた ')+'1/'+v.toFixed(2),tw=c.measureText(text).width;c.fillText(text,Math.max(tw/2,Math.min(w-tw/2,x)),top-17);
   marker='縦線：あなたの'+type+' 1/'+v.toFixed(2)+'（'+fmt(current.n)+'G）。'+(inside?'':'表示範囲外のため端に表示。')+(current.n!==s.n?'グラフは'+fmt(s.n)+'Gの分布です。比較するには「実戦と同じゲーム数にする」を押してください。':'実戦と同じゲーム数の分布です。');
  }}
  $('marker-note').textContent=marker;$('chart-note').textContent='分布の中央付近を拡大表示。範囲外（0回を含む）：1/6.02想定 '+fmt(outside[0])+'回、1/5.78想定 '+fmt(outside[1])+'回。';canvas.setAttribute('aria-label',fmt(s.n)+'Gを各'+fmt(s.trials)+'回試したブドウ実測確率の分布。紫は1/6.02想定、青緑の破線は1/5.78想定。'+marker);
 }
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(draw).observe($('chart'));else window.addEventListener('resize',draw);
 run();
})();
