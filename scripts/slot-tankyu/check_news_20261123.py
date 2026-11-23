"""Bound November 23 drafts; preserve all earlier news, dates and unrelated pages.

These checks verify the reviewed local version, not publication approval or facts.
"""
import copy, hashlib, json, re, subprocess
from pathlib import Path
H=Path(__file__).resolve().parent
def manifest():return json.loads((H/'editorial/reviews/2026-11-23-manifest.json').read_text())
def original(path):
    return subprocess.check_output(['git','show',manifest()['base']+':scripts/slot-tankyu/'+path],cwd=H)
def sha(value):return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def edition_bytes(path):
    from check_records_20261123 import previous_bytes as preceding_edition
    return preceding_edition(path)
def previous_bytes(path):
    current=edition_bytes(path);pins=manifest()['files']
    if path not in pins:return current
    assert hashlib.sha256(current).hexdigest()==pins[path],path
    return original(path)
def historical_latest():
    page=subprocess.check_output(['git','show',manifest()['base']+':docs/slot-tankyu/index.html'],cwd=H,text=True)
    return re.search(r'<ol class="latest-list">.*?</ol>',page,re.S)[0]
def main():
    from check_records_20261123 import main as check_current, historical_latest as record_base_latest, manifest as record_manifest
    check_current()
    from news_calendar import news_page,calendar_page
    from editorial_views import latest_feed
    pins=manifest()
    for p,s in pins['files'].items():assert hashlib.sha256(edition_bytes(p)).hexdigest()==s,p
    read=lambda p:json.loads(edition_bytes(p))
    n=read('data/industry-news.json');prior=json.loads(original('data/industry-news.json'))
    projected=copy.deepcopy(n);issue=projected['issues'].pop()
    assert issue['date']=='2026-11-23' and len(issue['articles'])==4
    assert {a['id']:sha(a) for a in issue['articles']}==pins['articles']
    projected['checked_at']=prior['checked_at'];assert projected==prior,'Earlier news changed'
    c=read('data/new-machines.json');prior=json.loads(original('data/new-machines.json'))
    assert len(c['machines'])==len(prior['machines'])==21
    changed={}
    for before,after in zip(prior['machines'],c['machines']):
        assert all(before[k]==after[k] for k in ('date','name','kind','maker'))
        if before!=after:
            changed[after['name']]=sha(after)
            assert {k for k in before.keys()|after.keys() if before.get(k)!=after.get(k)}<={'checked_at','verification','schedule_url','alternate_schedule_url','official_url'}
    assert changed==pins['machines'] and len(changed)==5
    assert sha(c['announcements'])==pins['announcements'] and len(c['announcements'])==4
    assert all('date' not in a for a in c['announcements']),'Invented concrete date'
    assert '納品予定' in c['announcements'][2]['expected_at']
    projected=copy.deepcopy(c);projected.pop('announcements');projected['machines']=prior['machines']
    for k in ('checked_at','source_updated_at','schedule_review_note'):projected[k]=prior[k]
    assert projected==prior
    f=read('data/latest.json');prior=json.loads(original('data/latest.json'));added=f['entries'][:5]
    assert [e['anchor'] for e in added[:4]]==list(pins['articles'])
    assert all(e['date']=='2026-11-23' and e['date_kind']=='内容更新日' for e in added)
    index=next(i for i,e in enumerate(prior['entries']) if e['group']=='calendar-refresh')
    assert added[4]['history']==[prior['entries'][index]]
    projected=copy.deepcopy(f);projected['entries']=f['entries'][5:];projected['entries'].insert(index,added[4]['history'][0]);assert projected==prior
    for p,renderer,d in [('industry-news',news_page,n),('new-machines',calendar_page,c)]:
        assert read('pages/'+p+'.json')==renderer(d)
    feed=record_base_latest();assert all('#'+a['id'] in feed for a in issue['articles'])
    assert feed.count('new-machines/')==1
    # Every unrelated article, author comment and record source stays exact.
    for p in (H/'pages').glob('*.json'):
        if p.stem in record_manifest()['new_pages']:continue # exact current versions checked above
        if p.stem not in {'industry-news','new-machines'}:assert edition_bytes('pages/'+p.name)==original('pages/'+p.name),p.name
    for p in ['AGENTS.md','SECURITY.md','package.json','package-lock.json','.github/workflows/pages.yml']:
        assert (H.parents[1]/p).read_bytes()==subprocess.check_output(['git','show',pins['base']+':'+p],cwd=H),p
    # Invalid sources, duplicate previews and future confirmation dates fail closed.
    for kind in ('duplicate','url','date'):
        bad=copy.deepcopy(c)
        if kind=='duplicate':bad['announcements'].append(bad['announcements'][0])
        elif kind=='url':bad['announcements'][0]['official_url']='javascript:alert(1)'
        else:bad['announcements'][0]['checked_at']='2099-01-01'
        try:calendar_page(bad)
        except ValueError:pass
        else:raise AssertionError('Invalid preview accepted: '+kind)
    print('PASS: 4 draft news, 5 bounded calendar rows, 4 undated previews; all prior news/dates/comments retained')
if __name__=='__main__':main()
