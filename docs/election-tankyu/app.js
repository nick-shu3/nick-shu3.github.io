'use strict';
(() => {
 const view=document.getElementById('view');
 const state={party:'all',q:'',topic:'all',status:'all',group:'consumption'};
 const norm=s=>s.normalize('NFKC').trim().toLowerCase();
 function mount(id){const t=document.getElementById('tpl-'+id);if(!t)return false;view.replaceChildren(t.content.cloneNode(true));return true;}
 function validSelection(select,value){return Array.from(select.options).some(o=>o.value===value)?value:'all';}
 function filter(){const cards=Array.from(view.querySelectorAll('#cards article'));let n=0;
  for(const card of cards){card.hidden=!((state.party==='all'||card.dataset.party===state.party)&&(state.topic==='all'||card.dataset.topics.split('|').includes(state.topic))&&(state.status==='all'||card.dataset.status===state.status)&&norm(card.textContent).includes(norm(state.q)));if(!card.hidden)n++;}
  view.querySelector('#count').textContent=n+'件の公約を表示中（全'+cards.length+'件）';
  const old=view.querySelector('.empty');if(old)old.remove();if(!n){const p=document.createElement('p');p.className='empty';p.textContent='この条件では見つかりませんでした。検索語・政党・分野・履行状況の条件を解除してください。';view.querySelector('#cards').append(p);}
  for(const b of view.querySelectorAll('[data-party-select]')){const yes=b.dataset.partySelect===state.party;b.setAttribute('aria-pressed',String(yes));b.closest('.party').classList.toggle('selected',yes);}
 }
 function listing(){mount('list');const q=view.querySelector('#search');q.value=state.q;q.addEventListener('input',()=>{state.q=q.value.slice(0,200);filter();});
  for(const [id,key] of [['party-filter','party'],['topic-filter','topic'],['status-filter','status']]){const s=view.querySelector('#'+id);s.value=validSelection(s,state[key]);state[key]=s.value;s.addEventListener('change',()=>{state[key]=validSelection(s,s.value);filter();});}
  view.querySelector('#reset').addEventListener('click',()=>{state.party='all';state.q='';state.topic='all';state.status='all';listing();view.querySelector('#search').focus();});
  for(const b of view.querySelectorAll('[data-party-select]'))b.addEventListener('click',()=>{state.party=b.dataset.partySelect;view.querySelector('#party-filter').value=state.party;filter();view.querySelector('#search').focus();});filter();
 }
 function comparison(){if(!mount('compare-'+state.group)){state.group='consumption';mount('compare-consumption');}const s=view.querySelector('#compare-group');s.value=state.group;s.addEventListener('change',()=>{const candidate=s.value;if(document.getElementById('tpl-compare-'+candidate)){state.group=candidate;comparison();view.querySelector('#compare-group').focus();}});}
 function route(focus=false){const hash=location.hash.slice(1,180),parts=hash.split('?'),r=parts[0]||'list';let active=r;
  const id=/^promise\/(P[0-9]{3,6})$/.exec(r);
  if(id&&mount(id[1])){active='list';const from=/^from=compare\/([a-z-]{1,40})$/.exec(parts[1]||'');
   if(from&&document.getElementById('tpl-compare-'+from[1])){state.group=from[1];const back=view.querySelector('a');back.href='#compare';back.textContent='← この政策の比較画面へ戻る';}
  }else if(r==='compare')comparison();else if(['sources','rules','scope'].includes(r))mount(r);else if(r==='list')listing();else{active='list';view.replaceChildren();const h=document.createElement('h2');h.textContent='指定された公約・画面が見つかりません';const a=document.createElement('a');a.href='#list';a.textContent='公約一覧へ戻る';view.append(h,a);}
  for(const b of document.querySelectorAll('#nav button')){if(b.dataset.page===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}if(focus)view.focus();
 }
 for(const b of document.querySelectorAll('#nav button'))b.addEventListener('click',()=>{if(location.hash==='#'+b.dataset.page)route(true);else location.hash=b.dataset.page;});
 window.addEventListener('hashchange',()=>route(true));route();
})();
