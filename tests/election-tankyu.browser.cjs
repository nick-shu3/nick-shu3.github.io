'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(root+'/docs/election-tankyu/data.json','utf8')),checks=[];
function check(name,ok){checks.push({name,pass:!!ok});if(!ok)console.error('FAIL: '+name);}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||path.resolve(root,'../review-tools/chromium'),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const output=process.env.ELECTION_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'election-qa-'));fs.mkdirSync(output,{recursive:true});
 const url='file://'+root+'/docs/election-tankyu/index.html';
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  check(width+':initial-count',await page.locator('#cards article:visible').count()===data.promises.length);
  check(width+':summary-counts',JSON.stringify(await page.locator('.party .number').allTextContents())===JSON.stringify(data.parties.map(x=>data.promises.filter(p=>p.party_id===x.id).length+'件掲載')));
  for(const party of data.parties){await page.locator('[data-party-select="'+party.id+'"]').click();check(width+':party-'+party.id,await page.locator('#cards article:visible').count()===data.promises.filter(p=>p.party_id===party.id).length);}
  await page.locator('#reset').click();await page.locator('#search').fill('消費税');check(width+':keyword',await page.locator('#cards article:visible').count()===4);
  await page.locator('#party-filter').selectOption('LDP');check(width+':combined-filters',await page.locator('#cards article:visible').count()===1);
  await page.locator('#cards h3').first().click();check(width+':body-click-no-filter',await page.locator('#cards article:visible').count()===1);
  await page.locator('#cards article:visible a[target="_blank"]').first().evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));await page.locator('#cards article:visible a[target="_blank"]').first().click();check(width+':source-click-no-filter',await page.locator('#cards article:visible').count()===1);
  await page.locator('#cards article:visible .action').click();await page.locator('.quote').waitFor();await page.locator('#view > a').click();check(width+':list-restores-query',await page.locator('#search').inputValue()==='消費税'&&await page.locator('#party-filter').inputValue()==='LDP'&&await page.locator('#cards article:visible').count()===1);
  await page.locator('#reset').click();await page.locator('#topic-filter').selectOption('子育て');check(width+':topic-filter',await page.locator('#cards article:visible').count()===3);
  await page.locator('#status-filter').selectOption('実現');check(width+':no-invented-realizations',await page.locator('#cards article:visible').count()===0&&await page.locator('.empty').count()===1);
  await page.locator('#reset').click();await page.locator('#status-filter').selectOption('判定保留');check(width+':pending-not-failed',await page.locator('#cards article:visible').count()===15);
  await page.locator('#search').fill('<img src=x onerror=alert(1)>');check(width+':search-not-markup',await page.locator('#view img').count()===0&&await page.locator('.empty').count()===1);await page.locator('#reset').click();
  for(const promise of data.promises){await page.goto(url+'#promise/'+promise.id);await page.locator('.quote').waitFor();check(width+':detail-'+promise.id,await page.locator('#view').textContent().then(t=>t.includes(promise.title)&&t.includes(promise.summary)&&t.includes('何を約束したか')&&t.includes('何が未確認か'))&&await page.locator('.timeline').count()===0&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  await page.locator('[data-page="compare"]').click();
  for(const group of data.comparison_groups){await page.locator('#compare-group').selectOption(group.id);check(width+':compare-'+group.id,await page.locator('.compare-party').count()===data.parties.length&&await page.locator('.compare-item').count()===data.promises.filter(p=>p.comparison_group===group.id).length&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  await page.locator('#compare-group').selectOption('invoice');await page.locator('.compare-item a[href^="#promise/"]').first().click();await page.locator('.quote').waitFor();await page.locator('#view > a').click();check(width+':compare-return',await page.locator('#compare-group').inputValue()==='invoice');
  for(const r of ['list','sources','rules','scope']){await page.locator('[data-page="'+r+'"]').click();check(width+':no-overflow-'+r,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  check(width+':external-links',await page.locator('a[target="_blank"]').evaluateAll(xs=>xs.every(a=>a.protocol==='https:'&&a.rel.includes('noopener'))));check(width+':no-runtime-errors',errors.length===0);
  await page.goto(url+'#promise/P999');check(width+':unknown-route',await page.locator('#view').textContent().then(t=>t.includes('見つかりません')));
  if(width===390||width===1280){await page.goto(url);await page.screenshot({path:path.join(output,'layout-'+width+'.png'),fullPage:false});}
  await page.close();
 }
 const p=await browser.newPage();await p.goto(url);await p.keyboard.press('Tab');check('keyboard-skip',await p.evaluate(()=>document.activeElement.classList.contains('skip')));await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Enter');await p.locator('#compare-group').waitFor();check('keyboard-navigation',await p.locator('#compare-group').count()===1);await p.close();await browser.close();
 const result={engine:'Chromium / Playwright',checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length};fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({total:checks.length,passed:result.passed,failed:result.failed}));if(result.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
