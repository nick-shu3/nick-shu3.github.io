"""Bounds and failure cases for the 2026-10-26 local information update."""
import copy, json, subprocess
from html.parser import HTMLParser
from pathlib import Path
from league_schedule import render as render_current
def render(data, as_of="2026-10-26"):
    return render_current(data, as_of)
from news_calendar import calendar_page
from build import build, ROOT

HERE=Path(__file__).resolve().parent
BASE='d7c2abba36c10bc615056db3c87a30df3047bdd5'
def old(path):
    return json.loads(subprocess.check_output(['git','show',BASE+':scripts/slot-tankyu/'+path],cwd=ROOT))
EDITION='8eedd3cb3fd3330d57d245d6d59b261b7be2bee4'
def read(path):
    # Freeze this dated update's fixture; current additions have separate bounds.
    if path=='data/league-4th.json' or path.startswith('pages/'):
        return json.loads(subprocess.check_output(['git','show',EDITION+':scripts/slot-tankyu/'+path],cwd=ROOT))
    return json.loads((HERE/path).read_text())
class Links(HTMLParser):
    def __init__(self,text):super().__init__();self.links=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        if tag=='a':self.links.append(dict(attrs))
def rejected(renderer,value):
    try:renderer(value)
    except ValueError:return
    raise AssertionError('Invalid editorial data accepted')

def check_update():
    league=read('data/league-4th.json');before=old('data/league-4th.json')
    assert league['checked_at']=='2026-10-26' and len(league['rows'])==42
    for a,b in zip(before['rows'],league['rows']):
        assert b['schedule_checked_at']=='2026-10-26'
        assert b['previous_schedule_checked_at']==a['schedule_checked_at']
        changed={'schedule_checked_at','previous_schedule_checked_at'}
        if a['date']=='2026-10-22':
            changed|={'status','status_checked_at','status_note','status_history'}
            assert b['status']=='終了確認待ち' and b['status_checked_at']=='2026-10-26'
            assert b['status_history'][-1]['status']=='予定'
        assert {k:v for k,v in b.items() if k not in changed}=={k:v for k,v in a.items() if k not in changed}
    assert [(r['date'],r['round']) for r in league['rows'] if r['status']=='終了']==[(r['date'],r['round']) for r in before['rows'] if r['status']=='終了']
    changed={'checked_at','rows','rallies','video_reviewed_at','video_review_note'}
    assert {k:v for k,v in league.items() if k not in changed}=={k:v for k,v in before.items() if k not in changed}
    for a,b in zip(before['rallies'],league['rallies']):
        changed={'metadata_checked_at','metadata_note'}
        if b['team']=='キコーナサンクス':
            changed|={'video_url','video_link_checked_at','video_evidence','video_announcement_url','published_on'}
            assert b['video_url']=='https://www.youtube.com/watch?v=PrzOBrXmJhA'
            assert b['published_on']=='2026-10-25' and b['video_link_checked_at']=='2026-10-26'
            assert b['video_announcement_url']=='https://x.com/777_LEAGUE/status/2114313492740313329'
        assert {k:v for k,v in b.items() if k not in changed}==a
    body=render(league)['body']
    assert '2026年10月30日 RED第7回戦' in body.split('id="next"')[1].split('</section>')[0]
    assert '2026年10月22日 BLUE第6回戦' in body.split('id="pending"')[1].split('</section>')[0]
    assert '11月1日' in body and '20:00から公開予定' in body
    assert body.count('動画を見る ↗')==6 and '公開予定' in body
    assert render(league)['updated']=='2026-10-26'
    for r in league['rallies']:
        if r.get('watch_slug'):
            assert '../../watch/'+r['watch_slug']+'/' in body
            article=next(read('pages/'+p.name) for p in (HERE/'pages').glob('watch-*.json') if p.name!='watch-dstation-heroes.json' and read('pages/'+p.name)['path'].endswith('/'+r['watch_slug']+'/index.html'))
            assert '../../league/777league/#rallies' in build(article)
    calendar=read('data/new-machines.json');prior=old('data/new-machines.json')
    assert len(calendar['machines'])==17 and calendar['source_updated_at']=='2026-10-26'
    keys={'ガンゲイル','聖闘士','牙狼','ツインエンジェル2'}
    for a,b in zip(prior['machines'],calendar['machines']):
        if any(k in b['name'] for k in keys):
            changed={'official_url','verification','checked_at','official_video'}
            assert b['official_url'].startswith('https://') and b['checked_at']=='2026-10-26'
            assert {k:v for k,v in b.items() if k not in changed}=={k:v for k,v in a.items() if k not in changed}
        else:assert a==b
    assert all(m['kind']=='パチスロ' for m in calendar['machines'])
    assert not any('番長番付' in m['name'] for m in calendar['machines'])
    rendered=calendar_page(calendar)['body']
    assert 'https://www.youtube.com/watch?v=VAvfrCi7AEQ' in rendered
    assert '公式実戦動画' in rendered and '本編の内容・結果は未検証' in rendered
    for link in Links(rendered+body).links:
        if 'youtube.com/' in link.get('href',''):
            assert link.get('target')=='_blank' and {'noopener','noreferrer'}<=set(link.get('rel','').split())
    for mutate in ('url','date','announcement'):
        invalid=copy.deepcopy(calendar);v=next(m['official_video'] for m in invalid['machines'] if 'official_video' in m)
        if mutate=='url':v['url']='javascript:alert(1)'
        elif mutate=='date':v['announced_on']='2026-10-27'
        else:v['announcement_url']='javascript:alert(1)'
        rejected(calendar_page,invalid)
    for mutate in ('publication','metadata','evidence'):
        invalid=copy.deepcopy(league);r=invalid['rallies'][5]
        if mutate=='publication':r['published_on']='2026-10-27'
        elif mutate=='metadata':r['metadata_checked_at']='2026-10-27'
        else:r.pop('video_link_checked_at')
        rejected(render,invalid)
    # Every unrelated article source, including all author comments and records, is unchanged.
    paths=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'scripts/slot-tankyu/pages'],cwd=ROOT,text=True).splitlines()
    for path in paths:
        if Path(path).name in {'league-4th.json','new-machines.json'}:continue
        assert subprocess.check_output(['git','show',EDITION+':'+path],cwd=ROOT)==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),path
    print('PASS: 10/26 bounded changes, 42 schedule identities, unchanged records/comments, six video links, reciprocal articles, unsafe/future evidence rejection')

if __name__=='__main__':check_update()
