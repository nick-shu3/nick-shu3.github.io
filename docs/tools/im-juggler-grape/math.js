'use strict';
(function(root){
 const LIMIT=100000, P=[1/6.02,1/5.78];
 function integer(raw,label,min=0,max=LIMIT){
  const s=String(raw).trim();
  if(!s)throw Error(label+'を入力してください。');
  if(!/^-?\d+$/.test(s))throw Error(label+'は整数で入力してください。');
  const v=Number(s);
  if(!Number.isSafeInteger(v)||v<min||v>max)throw Error(label+'は'+min.toLocaleString()+'～'+max.toLocaleString()+'で入力してください。');
  return v;
 }
 function direct(n,k){if(!Number.isSafeInteger(n)||n<1||n>LIMIT||!Number.isSafeInteger(k)||k<0||k>n)throw Error('ゲーム数・ブドウ回数を確認してください。');return {n,k,denominator:k?n/k:null,estimated:false};}
 function reverse(n,b,r,d,on){
  [n,b,r,d].forEach(v=>{if(!Number.isSafeInteger(v))throw Error('整数を入力してください。');});
  if(n<1||n>LIMIT||b<0||r<0||b+r>n)throw Error('ゲーム数・ボーナス回数を確認してください。');
  if(d< -3*n||d>14*n+252*b+96*r)throw Error('差枚数が入力データと整合しません。');
  const k=(d+3*n-251.25*b-95.25*r-.411*n-(on?.06068:.040475)*n)/8;
  if(!Number.isFinite(k)||k<=0||k>n-b-r)throw Error('推定回数が成立しません。ゲーム数・差枚・ボーナス回数を確認してください。');
  return {n,k,denominator:n/k,estimated:true,b,r,d,on};
 }
 // Binomial PMF by recurrence from its mode; avoids factorial overflow and per-spin simulation.
 function distribution(n,p){
  if(!Number.isSafeInteger(n)||n<1||n>LIMIT||!(p>0&&p<1))throw Error('分布の条件が範囲外です。');
  const mass=new Float64Array(n+1),cdf=new Float64Array(n+1),mode=Math.floor((n+1)*p);
  mass[mode]=1;
  for(let k=mode;k>0;k--)mass[k-1]=mass[k]*k/(n-k+1)*(1-p)/p;
  for(let k=mode;k<n;k++)mass[k+1]=mass[k]*(n-k)/(k+1)*p/(1-p);
  let sum=0;for(const v of mass)sum+=v;
  let acc=0;for(let k=0;k<=n;k++){mass[k]/=sum;acc+=mass[k];cdf[k]=acc;}cdf[n]=1;
  return {n,p,mass,cdf};
 }
 function quantile(dist,u){let lo=0,hi=dist.n;while(lo<hi){const mid=(lo+hi)>>>1;if(dist.cdf[mid]>=u)hi=mid;else lo=mid+1;}return lo;}
 function simulate(dist,trials=10000,rng=Math.random){
  if(!Number.isSafeInteger(trials)||trials<1||trials>100000)throw Error('試行回数が範囲外です。');
  const counts=new Uint32Array(dist.n+1);
  for(let t=0;t<trials;t++)counts[quantile(dist,rng())]++;
  return counts;
 }
 function tails(n,k){
  if(!Number.isFinite(k)||k<0||k>n)throw Error('ブドウ回数が範囲外です。');
  // Fractional reverse estimates stay fractional: ceil for >=, floor for <=.
  const atLeast=Math.ceil(k-1e-10),atMost=Math.floor(k+1e-10);
  const a=distribution(n,P[0]),b=distribution(n,P[1]);let upper=0,lower=0;
  for(let i=atLeast;i<=n;i++)upper+=a.mass[i];
  for(let i=0;i<=atMost;i++)lower+=b.mass[i];
  return [Math.min(1,upper),Math.min(1,lower)];
 }
 const api={LIMIT,P,integer,direct,reverse,distribution,quantile,simulate,tails};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GrapeMath=api;
})(typeof globalThis==='undefined'?this:globalThis);
