"""Validate the approved November 9 edition before projecting historical fixtures."""
import copy,hashlib,json,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent
MANIFEST=H/'editorial/reviews/2026-11-09-publication-manifest.json'
def manifest():return json.loads(MANIFEST.read_text())
def original(path):
    return subprocess.check_output(['git','show',manifest()['base']+':scripts/slot-tankyu/'+path],cwd=H)
def read(path):return json.loads((H/path).read_text())
def canonical_sha(value):return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def previous_bytes(path):
    """Older date-specific tests still run unchanged on their exact original data.

    The projection is allowed only for the five pinned source/page files. Current
    data is separately checked by main(); unknown changes fail the SHA guard.
    """
    pins=manifest()['files'];current=(H/path).read_bytes()
    if path not in pins:return current
    assert hashlib.sha256(current).hexdigest()==pins[path],path
    return original(path)
def main():
    from news_calendar import news_page,calendar_page
    from editorial_views import latest_feed
    for p,sha in manifest()['files'].items():
        assert hashlib.sha256((H/p).read_bytes()).hexdigest()==sha,p
    n=read('data/industry-news.json');old=json.loads(original('data/industry-news.json'))
    reverted=copy.deepcopy(n);issue=reverted['issues'].pop()
    assert issue['date']=='2026-11-09' and len(issue['articles'])==3
    assert {a['id']:canonical_sha(a) for a in issue['articles']}==manifest()['articles']
    reverted['checked_at']=old['checked_at'];assert reverted==old,'Previous news changed'
    c=read('data/new-machines.json');old=json.loads(original('data/new-machines.json'))
    assert len(c['machines'])==len(old['machines'])==21
    changed={}
    for before,after in zip(old['machines'],c['machines']):
        assert (before['name'],before['date'],before['kind'],before['maker'])==(after['name'],after['date'],after['kind'],after['maker'])
        if before!=after:
            changed[after['name']]=canonical_sha(after)
            assert {k for k in before.keys()|after.keys() if before.get(k)!=after.get(k)}<={'checked_at','verification','schedule_url','alternate_schedule_url','official_url'}
    assert changed==manifest()['machines'],'Unreviewed machine change'
    projected=copy.deepcopy(c)
    for field in ('checked_at','source_updated_at','schedule_review_note'):projected[field]=old[field]
    projected['machines']=old['machines'];assert projected==old
    f=read('data/latest.json');old=json.loads(original('data/latest.json'))
    added=f['entries'][:4]
    assert [x['anchor'] for x in added[:3]]==[x['id'] for x in issue['articles']]
    assert all(x['date']=='2026-11-09' and x['date_kind']=='内容更新日' for x in added)
    assert added[3]['group']=='calendar-refresh' and added[3]['source']=='new-machines'
    projected=copy.deepcopy(f);projected['entries']=f['entries'][4:]
    index=next(i for i,x in enumerate(old['entries']) if x['group']=='calendar-refresh')
    assert added[3]['history']==[old['entries'][index]]
    projected['entries'].insert(index,added[3]['history'][0]);assert projected==old
    for name,renderer,data in [('industry-news',news_page,n),('new-machines',calendar_page,c)]:
        assert read('pages/'+name+'.json')==renderer(data)
    text=latest_feed('docs/slot-tankyu/index.html')
    assert all('#'+a['id'] in text for a in issue['articles'])
    assert text.count('new-machines/')==1
    assert '2027年1月' in calendar_page(c)['body'] and '資料間に相違' in calendar_page(c)['body']
    print('PASS: approved 3 news / 3 calendar rows; previous facts and all 21 dates retained; current generation and latest feed verified')
if __name__=='__main__':main()
