"""Bound the D'station article addition; content review is recorded separately."""
import copy, json, re, subprocess
from pathlib import Path
from build import ROOT, build
from league_schedule import render
HERE=Path(__file__).resolve().parent
BASE='8eedd3cb3fd3330d57d245d6d59b261b7be2bee4'
def old(path):return subprocess.check_output(['git','show',BASE+':scripts/slot-tankyu/'+path],cwd=ROOT)
def read(path):return json.loads((HERE/path).read_text())
def check_dstation():
    before=json.loads(old('data/league-4th.json'));current=read('data/league-4th.json')
    assert len(current['rallies'])==len(before['rallies'])==8
    assert {k:v for k,v in current.items() if k!='rallies'}=={k:v for k,v in before.items() if k!='rallies'}
    for a,b in zip(before['rallies'],current['rallies']):
        if b['team']!='D’ステーションヒーローズ':assert a==b;continue
        fields={'video_url','watch_slug','video_link_checked_at','video_evidence','metadata_checked_at','metadata_note','video_announcement_url','published_on'}
        assert {k:v for k,v in b.items() if k not in fields}==a
        assert b['video_url']=='https://www.youtube.com/watch?v=SoH59Bc3oIQ'
        assert b['watch_slug']=='dstation-heroes-rally'
        assert b['video_link_checked_at']==b['metadata_checked_at']=='2026-10-28'
        assert b['published_on']=='2026-10-27'
    body=render(current)['body']
    assert body.count('動画を見る ↗')==7
    assert '../../watch/dstation-heroes-rally/' in body
    assert 'rally-table' in body and body.count('class="rally-evidence"')==7
    assert '2026年10月26日（日程の照合日）' in body
    assert render(current)['updated']=='2026-10-28'
    p=read('pages/watch-dstation-heroes.json');out=build(p)
    assert p['updated']=='2026年10月28日' and len(p['author_comment'])==5
    for name in ['日直島田','森本レオ子','ドテチン','黒木ねね','フェニックス浜田']:assert name in out
    assert '2連続' not in out and '2回目のMVP' in out
    assert '買ってほしい' not in out and 'ぜひとも勝ってほしい' in out
    assert '退職' not in out and '32歳' not in out and '24年' not in out
    assert '直接照合はできていません' in out and '../../league/777league/#rallies' in out
    assert out.count('id="author-comment"')==1
    old_index=json.loads(old('pages/watch-listing.json'));index=read('pages/watch-listing.json')
    addition=r'<a class="card report-card" href="dstation-heroes-rally/">.*?</a>'
    assert len(re.findall(addition,index['body']))==1
    index['body']=re.sub(addition,'',index['body']);index['updated']=old_index['updated'];assert index==old_index
    feed=read('data/latest.json');previous=json.loads(old('data/latest.json'))
    assert feed['entries'][2:]==previous['entries']
    assert feed['entries'][0]['source']=='watch-dstation-heroes' and feed['entries'][0]['date_kind']=='紹介日'
    for path in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'scripts/slot-tankyu/pages','scripts/slot-tankyu/data'],cwd=ROOT,text=True).splitlines():
        relative=path.removeprefix('scripts/slot-tankyu/')
        if relative in {'pages/league-4th.json','pages/watch-listing.json','data/league-4th.json','data/latest.json','data/presentation.json'}:continue
        assert (ROOT/path).read_bytes()==old(relative),path
    for mutate in ['unsafe','future','missing-date']:
        invalid=copy.deepcopy(current);r=invalid['rallies'][6]
        if mutate=='unsafe':r['video_url']='javascript:alert(1)'
        elif mutate=='future':r['metadata_checked_at']='2026-10-29'
        else:r.pop('video_link_checked_at')
        try:render(invalid)
        except ValueError:pass
        else:raise AssertionError(mutate)
    print('PASS: Dstation addition, 42 unchanged battle rows, seven videos, reciprocal links, old comments/records, invalid evidence rejection')
if __name__=='__main__':check_dstation()
