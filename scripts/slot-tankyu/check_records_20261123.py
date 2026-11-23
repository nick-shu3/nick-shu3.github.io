"""Check session scopes, funds transfer and preservation for the November 23 records."""
import copy,hashlib,json,re,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent
ROOT=H.parents[1]
def manifest():return json.loads((H/'editorial/reviews/2026-11-23-records-manifest.json').read_text())
def original(path):return subprocess.check_output(['git','show',manifest()['base']+':scripts/slot-tankyu/'+path],cwd=H)
def previous_bytes(path):
    data=(H/path).read_bytes();m=manifest()
    if path not in m['files']:return data
    assert hashlib.sha256(data).hexdigest()==m['files'][path],path
    if path.startswith('pages/') and Path(path).stem in m['new_pages']:return data
    return original(path)
def historical_latest():
    text=subprocess.check_output(['git','show',manifest()['base']+':docs/slot-tankyu/index.html'],cwd=H,text=True)
    return re.search(r'<ol class="latest-list">.*?</ol>',text,re.S)[0]
def main():
    from build import build
    from editorial_views import latest_feed,daily_list,pages
    m=manifest();read=lambda p:json.loads((H/p).read_text())
    for p,sha in m['files'].items():assert hashlib.sha256((H/p).read_bytes()).hexdigest()==sha,p
    for p,sha in m['assets'].items():assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==sha,p
    assert len(m['assets'])==8
    names=set(p.name for p in (H/'pages').glob('*.json'));oldnames=set(Path(p).name for p in subprocess.check_output(['git','ls-tree','--name-only',m['base']+':scripts/slot-tankyu/pages'],cwd=ROOT,text=True).splitlines())
    assert names-oldnames=={n+'.json' for n in m['new_pages']} and not oldnames-names
    for p in (H/'pages').glob('*.json'):
        if p.stem not in m['new_pages'] and p.stem!='listing':assert p.read_bytes()==original('pages/'+p.name),p.name
    listing=read('pages/listing.json');prior=json.loads(original('pages/listing.json'));projected=copy.deepcopy(listing)
    assert listing['body'].count(m['listing_cards'])==1
    projected['body']=projected['body'].replace(m['listing_cards'],'');projected['updated']=prior['updated'];assert projected==prior
    feed=read('data/latest.json');old=json.loads(original('data/latest.json'))
    assert feed['entries'][2:]==old['entries'] and len(feed['entries'])==len(old['entries'])+2
    assert [e['source'] for e in feed['entries'][:2]]==m['new_pages'][:2]
    assert len({e['group'] for e in feed['entries'][:2]})==2
    assert all(e['date']=='2026-11-23' and e['date_kind']=='内容更新日' for e in feed['entries'][:2])
    g,i,d=[read('pages/'+n+'.json') for n in m['new_pages']]
    assert [x['type'] for x in (g,i,d)]==['record','record','daily']
    assert all(v in g['body'] for v in ['＋5,000枚','5,200−200','TOTAL 5,837','5,840枚','3枚異なり','1,619G','18回','409枚','当時の推測'])
    assert all(v in i['body'] for v in ['＋960枚','6,160−5,200','追加投資に再計上しません','台全体','7,496G','32回','1/117','本人が','設定6が確定した実戦ではありません'])
    assert all(v in d['body'] for v in ['＋5,960枚','＋5,000枚','＋960枚','投資200枚','最終回収6,160枚','二重に合計しません'])
    assert 5200-200==5000 and 6160-5200==960 and 5000+960==6160-200==5960
    assert '5,960' not in g['body']+i['body'],'Daily total leaked into machine records'
    for p in (g,i):
        assert any(p['author_excerpt'] in s for s in p['author_comment'])
        text=build(p);assert text.count('id="author-comment"')==1 and 'href="../"' in text
    rendered=build(g);assert rendered.index('以下の本人コメント')<rendered.index('id="author-comment"')
    assert 'god-kiseki/' in d['body'] and 'im-juggler/' in d['body']
    latest=latest_feed('docs/slot-tankyu/index.html')
    assert latest.count('<li>')==6 and latest.index('/god-kiseki/')<latest.index('/im-juggler/')
    assert latest.count('実戦日：')==2 and '/records/2026-11-23/"' not in latest
    all_dates=daily_list('docs/slot-tankyu/records/index.html');recent=daily_list('docs/slot-tankyu/index.html',3)
    assert '2026-11-23/' in all_dates and '2026-11-23/' in recent
    print('PASS: two machine records / one daily summary; transfer not double-counted; image/version pins and all prior articles retained')
if __name__=='__main__':main()
