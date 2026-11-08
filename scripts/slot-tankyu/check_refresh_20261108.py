"""Bound the reviewed refresh and retain prior-edition regressions on their fixture."""
import copy,hashlib,json,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent
BASE='e45322b3abfb99cfcddcaf83dbee5fb2aeaa58c1'
FILES={'data/industry-news.json','data/new-machines.json','data/league-4th.json','data/latest.json'}
def read(p):return json.loads((H/p).read_text())
def original(p):return json.loads(subprocess.check_output(['git','show',BASE+':scripts/slot-tankyu/'+p],cwd=H))
def previous_edition(p):
    # Only the four explicitly reviewed changes may project to the prior fixture.
    # The current edition is separately checked below, never silently discarded.
    if p not in FILES:return read(p)
    pins=read('editorial/reviews/2026-11-08-refresh-manifest.json')
    assert hashlib.sha256((H/p).read_bytes()).hexdigest()==pins[p],p
    return original(p)
def main():
    from league_schedule import render
    from news_calendar import calendar_page,news_page
    from render_league_results import render as result_page
    pins=read('editorial/reviews/2026-11-08-refresh-manifest.json')
    updated={'pages/league-results-4th.json':'ceb9d67127980cbe23950aa062e2b978963c12bd795afb5c2bb333e364238d9c','render_league_results.py':'f7daa82f65f005067502d3d6c2911d922b5bb0b920a1b13340560b24574cb705'}
    for p,sha in pins.items():
        if p in updated:
            assert hashlib.sha256((H/p).read_bytes()).hexdigest()==updated[p],p
            previous=subprocess.check_output(['git','show','79d09d9:scripts/slot-tankyu/'+p],cwd=H)
            assert hashlib.sha256(previous).hexdigest()==sha,p
        else:assert hashlib.sha256((H/p).read_bytes()).hexdigest()==sha,p
    result_text=read('pages/league-results-4th.json')['body']
    assert result_text.index('第1回戦終了時の順位') < result_text.index('−1,550pt')
    assert '4チームすべてが0pt' not in result_text
    assert '−1,550pt' in result_text and '−1,500pt' in result_text and '差の理由は未確認' in result_text
    n=read('data/industry-news.json');prior=original('data/industry-news.json');projected=copy.deepcopy(n)
    issue=projected['issues'].pop();assert issue['date']=='2026-11-08'
    assert [a['id'] for a in issue['articles']]==['umislot-announcement-20261106','twin2-trial-20261108']
    projected['checked_at']=prior['checked_at'];assert projected==prior
    c=read('data/new-machines.json');prior=original('data/new-machines.json');projected=copy.deepcopy(c)
    add=projected['machines'].pop();assert add['name']=='LB海スロ' and add['date']=='2027-02-08'
    projected.pop('schedule_review_note')
    for k in ('checked_at','source_updated_at'):projected[k]=prior[k]
    assert projected==prior
    l=read('data/league-4th.json');prior=original('data/league-4th.json');projected=copy.deepcopy(l)
    for k in ('schedule_rechecked_at','schedule_recheck_note','video_reviewed_at','video_review_note','video_review_history'):projected[k]=prior[k]
    row=next(r for r in projected['rows'] if r['round']=='BLUE第1回戦')
    for k in ('videos','watch_slug','video_links_checked_at'):row.pop(k)
    assert projected==prior,'Unrelated schedule/status data changed'
    f=read('data/latest.json');prior=original('data/latest.json');assert len(f['entries'])==len(prior['entries'])+3
    assert f['entries'][3:]==prior['entries'] and all(x['date']=='2026-11-08' for x in f['entries'][:3])
    body=render(l,'2026-11-08')['body'];upcoming=body.split('id="next"',1)[1].split('</section>',1)[0]
    assert '2026年11月10日' in upcoming and '2026年11月5日' not in upcoming
    # Presentation never mutates stored confirmation states, even on a later day.
    frozen=copy.deepcopy(l);render(l,'2026-11-09');assert l==frozen
    assert '777league-4th-blue1' in body and 'nAPtO7zIcvg' in body
    scores=read('data/league-results-4th.json');assert scores==original('data/league-results-4th.json')
    result=result_page(scores)['body'];assert result.index('最新ポイントは確認待ち')<result.index('id="blue"')
    assert '現在の成績を表すものではありません' in result and '11月4日' in result
    text=calendar_page(c)['body'];assert '21機種' in text and '機種別確認日' in text
    bad=copy.deepcopy(c);bad['schedule_review_note']='<script>untrusted</script>'
    assert '&lt;script&gt;' in calendar_page(bad)['body'] and '<script>untrusted' not in calendar_page(bad)['body']
    text=news_page(n)['body'];assert '11月8日の実施状況・受付状況は未確認' in text
    print('PASS: 11/8 refresh bounded; previous facts, scores and history preserved; date rollover and escaped review note')
if __name__=='__main__':main()
