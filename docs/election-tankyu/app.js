'use strict';
(() => {
 const view=document.getElementById('view'),state={party:'all',q:'',topic:'all',group:'0'};
 const parties=['all','LDP','DPFP','SANSEI'];
 const norm=s=>s.normalize('NFKC').trim().toLowerCase();
 function mount(id){const t=document.getElementById('tpl-'+id);view.replaceChildren(t.content.cloneNode(true));}
 function filter(){let n=0;for(const card of view.querySelectorAll('#cards article')){
  const party=card.dataset.party;
  const topics=card.dataset.topics.split('|');
  card.hidden=!((state.party==='all'||state.party===party)&&(state.topic==='all'||topics.includes(state.topic))&&norm(card.textContent).includes(norm(state.q)));if(!card.hidden)n++;
 }view.querySelector('#count').textContent=n+'件の公約を表示中（全5件）';
 const old=view.querySelector('.empty');if(old)old.remove();if(!n){const p=document.createElement('p');p.className='empty';p.textContent='この条件では見つかりませんでした。検索語や政党・分野の条件を解除してください。';view.querySelector('#cards').append(p);}
 for(const b of view.querySelectorAll('[data-party-select]')){const yes=b.dataset.partySelect===state.party;b.setAttribute('aria-pressed',String(yes));b.closest('.party').classList.toggle('selected',yes);}
 }
 function listing(){mount('list');const q=view.querySelector('#search'),p=view.querySelector('#party-filter'),t=view.querySelector('#topic-filter');q.maxLength=200;q.value=state.q;p.value=state.party;t.value=state.topic;
 q.addEventListener('input',()=>{state.q=q.value.slice(0,200);filter()});p.addEventListener('change',()=>{state.party=parties.includes(p.value)?p.value:'all';filter()});t.addEventListener('change',()=>{state.topic=['税金','社会保障'].includes(t.value)?t.value:'all';filter()});
 view.querySelector('#reset').addEventListener('click',()=>{state.party='all';state.q='';state.topic='all';listing();view.querySelector('#search').focus()});
 for(const b of view.querySelectorAll('[data-party-select]'))b.addEventListener('click',()=>{state.party=b.dataset.partySelect;p.value=state.party;filter();q.focus()});filter();
 }
 function comparison(){mount('compare-'+state.group);const s=view.querySelector('#compare-group');s.addEventListener('change',()=>{state.group=String(s.selectedIndex);comparison()});}
 function route(focus=false){const r=location.hash.slice(1,80)||'list';if(/^promise\/P00[1-5]$/.test(r))mount(r.slice(8));else if(r==='compare')comparison();else if(['sources','rules'].includes(r))mount(r);else listing();for(const b of document.querySelectorAll('#nav button')){if(b.dataset.page===(r.startsWith('promise/')?'list':r))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}if(focus)view.focus();}
 for(const b of document.querySelectorAll('#nav button'))b.addEventListener('click',()=>{if(location.hash==='#'+b.dataset.page)route(true);else location.hash=b.dataset.page;});
 window.addEventListener('hashchange',()=>route(true));route();
})();
