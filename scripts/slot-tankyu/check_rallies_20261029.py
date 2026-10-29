"""Current rally update boundaries; facts reviewed separately."""
import copy,json,subprocess
from pathlib import Path
from league_schedule import render
H=Path(__file__).resolve().parent
BASE='3ef8df5ad9502ee246dfe378b4e6f8b725317f4a'
def previous(p):return json.loads(subprocess.check_output(['git','show',BASE+':scripts/slot-tankyu/'+p]))
def read(p):return json.loads((H/p).read_text())
def check_rallies():
    a=previous('data/league-4th.json');b=read('data/league-4th.json')
    allowed={'rallies','video_reviewed_at','video_review_note','video_review_history'}
    assert {k:v for k,v in a.items() if k not in allowed}=={k:v for k,v in b.items() if k not in allowed}
    assert len(b['rallies'])==8 and len(b['rows'])==42
    for old,new in zip(a['rallies'],b['rallies']):
        fields={'metadata_checked_at','metadata_note','metadata_check_history'}
        if not old.get('video_url'):fields|={'video_url','video_link_checked_at','video_evidence'}
        assert {k:v for k,v in old.items() if k not in fields}=={k:v for k,v in new.items() if k not in fields}
        assert new['metadata_checked_at']=='2026-10-29'
        assert new.get('metadata_check_history',[])[:len(old.get('metadata_check_history',[]))]==old.get('metadata_check_history',[])
    assert b['rallies'][-1]['video_url']=='https://www.youtube.com/watch?v=sEXi1HHAK5E'
    assert b['video_review_history'][:-1]==a['video_review_history']
    body=render(b)['body'];assert body.count('動画を見る ↗')==8 and body.count('感想記事を読む →')==6
    assert '11月1日（日）20:00から公開予定' in body
    assert body.count('target="_blank" rel="noopener noreferrer"')>=8
    for kind in ['url','date','missing']:
        bad=copy.deepcopy(b)
        if kind=='url':bad['rallies'][-1]['video_url']='javascript:alert(1)'
        elif kind=='date':bad['rallies'][-1]['metadata_checked_at']='2026-10-30'
        else:bad['rallies'][-1].pop('video_link_checked_at')
        try:render(bad)
        except ValueError:pass
        else:raise AssertionError(kind)
    latest=read('data/latest.json');assert latest['entries'][1:]==previous('data/latest.json')['entries']
    assert latest['entries'][0]['source']=='league-4th' and latest['entries'][0]['date']=='2026-10-29'
    for p in (H/'pages').glob('*.json'):
        if p.name=='league-4th.json':continue
        assert json.loads(p.read_text())==previous('pages/'+p.name),p
    assert read('data/new-machines.json')==previous('data/new-machines.json')
    print('PASS: 8 rally links, 6 article links, 42 schedule rows preserved, old history and unrelated pages retained, invalid evidence rejected')
if __name__=='__main__':check_rallies()
