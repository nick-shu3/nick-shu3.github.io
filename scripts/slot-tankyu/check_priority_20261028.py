"""Scope and invalid-source regressions for the approved priority update."""
import copy,hashlib,json,subprocess
from pathlib import Path
from build import ROOT
from news_calendar import calendar_page
from league_schedule import render as league_render
def render(data):return league_render(data, as_of="2026-10-28")
H=Path(__file__).resolve().parent
BASE='e58ad71c98560543c92fdc21524290dd1b498341'
def old(p):return subprocess.check_output(['git','show',BASE+':scripts/slot-tankyu/'+p],cwd=ROOT)
EDITION='3ef8df5ad9502ee246dfe378b4e6f8b725317f4a'
def read(p):return json.loads(subprocess.check_output(['git','show',EDITION+':scripts/slot-tankyu/'+p],cwd=ROOT))
def fails(fn,value):
    try:fn(value)
    except ValueError:return
    raise AssertionError('Invalid editorial evidence accepted')
def check_priority():
    c=read('data/new-machines.json');b=json.loads(old('data/new-machines.json'))
    assert c['checked_at']=='2026-10-28' and c['source_updated_at']=='2026-10-27'
    assert len(c['machines'])==18 and all(x['kind']=='パチスロ' for x in c['machines'])
    for a,z in zip(b['machines'],c['machines']):
        if 'ガンゲイル' in a['name']:
            assert z['date']==a['date']=='2026-11-02'
            assert {k:v for k,v in z.items() if k not in {'checked_at','field_test'}}=={k:v for k,v in a.items() if k!='checked_at'}
            assert z['field_test']['scheduled_at']=='2026-10-28T09:00:00+09:00'
            assert z['field_test']['units']==20 and '実施状況は未確認' in z['field_test']['note']
        else:assert a==z
    add=c['machines'][-1];assert add['name']=='押忍！番長番付' and add['date']=='2026-12-07' and add['maker']=='パオン・ディーピー'
    assert 'メーカーサイト本文で導入日までは未確認' in add['verification']
    cb=calendar_page(c)['body'];assert '18機種' in cb and '全国導入とは別' in cb and '南店・植田店' in cb and '実施状況は未確認' in cb
    for kind in ['url','future','units','timezone']:
        bad=copy.deepcopy(c);t=next(x['field_test'] for x in bad['machines'] if 'field_test' in x)
        if kind=='url':t['announcement_url']='javascript:alert(1)'
        elif kind=='future':t['checked_at']='2026-10-29'
        elif kind=='units':t['units']=True
        else:t['scheduled_at']='2026-10-28T09:00:00+00:00'
        fails(calendar_page,bad)
    bad=copy.deepcopy(c);t=next(x['field_test'] for x in bad['machines'] if 'field_test' in x);t['venue']='<script>bad()</script>'
    assert '&lt;script&gt;' in calendar_page(bad)['body'] and '<script>bad()' not in calendar_page(bad)['body']
    l=read('data/league-4th.json');prev=json.loads(old('data/league-4th.json'))
    assert len(l['rows'])==42 and l['schedule_rechecked_at']=='2026-10-28'
    assert [(x['date'],x['round'],x['venue']) for x in l['rows']]==[(x['date'],x['round'],x['venue']) for x in prev['rows']]
    for a,z in zip(prev['rows'],l['rows']):
        if a['date']=='2026-10-22':
            assert z['status']=='終了確認待ち' and z['status_checked_at']=='2026-10-28'
            assert z['status_history'][:-1]==a['status_history']
            assert {k:v for k,v in z.items() if k not in {'status_checked_at','status_note','status_history'}}=={k:v for k,v in a.items() if k not in {'status_checked_at','status_note','status_history'}}
        else:assert a==z
    for a,z in zip(prev['rallies'],l['rallies']):
        if a.get('video_url'):
            assert z['metadata_checked_at']=='2026-10-28'
            assert {k:v for k,v in z.items() if k not in {'metadata_checked_at','metadata_note','metadata_check_history'}}=={k:v for k,v in a.items() if k not in {'metadata_checked_at','metadata_note','metadata_check_history'}}
        else:assert a==z
    changed={'rows','rallies','schedule_rechecked_at','schedule_recheck_note','schedule_recheck_url','video_reviewed_at','video_review_history','video_review_note'}
    assert {k:v for k,v in l.items() if k not in changed}=={k:v for k,v in prev.items() if k not in changed}
    lb=render(l)['body'];assert lb.count('動画を見る ↗')==7 and '日程・会場の再照合：2026年10月28日' in lb
    assert '11月1日（日）20:00から公開予定' in lb and l['rallies'][-1]['release_at']=='2026-10-29T20:00:00+09:00'
    for kind in ['future','url']:
        bad=copy.deepcopy(l)
        if kind=='future':bad['schedule_rechecked_at']='2026-10-29'
        else:bad['schedule_recheck_url']='javascript:alert(1)'
        fails(render,bad)
    f=read('data/latest.json');pf=json.loads(old('data/latest.json'));assert f['entries'][1:]==pf['entries']
    assert f['entries'][0]['source']=='new-machines' and f['entries'][0]['date']=='2026-10-28'
    for p in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'scripts/slot-tankyu/pages','scripts/slot-tankyu/data'],cwd=ROOT,text=True).splitlines():
        rel=p.removeprefix('scripts/slot-tankyu/')
        if rel in {'pages/new-machines.json','pages/league-4th.json','data/new-machines.json','data/league-4th.json','data/latest.json'}:continue
        assert subprocess.check_output(['git','show',EDITION+':'+p],cwd=ROOT)==old(rel),p
    print('PASS: priority changes bounded; 18 slots, GGO national/test separation, 42 schedule identities, 7 video links, records/comments preserved, invalid evidence rejected')
if __name__=='__main__':check_priority()
