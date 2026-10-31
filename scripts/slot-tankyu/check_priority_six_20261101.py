"""Bound the six authorized changes and reject misleading source metadata."""
import copy,datetime,hashlib,json,re,subprocess
from pathlib import Path
from build import ROOT,build
from editorial_views import next_rally,schedule_preview
from news_calendar import calendar_page,news_page
from league_schedule import render
H=Path(__file__).resolve().parent
BASE='d52bd1b2cdcccae321ca372c711ca4bc72e1e3be'
def old(p):return json.loads(subprocess.check_output(['git','show',BASE+':scripts/slot-tankyu/'+p],cwd=ROOT))
def read(p):return json.loads((H/p).read_text())
def rejected(renderer,data):
    try:renderer(data)
    except ValueError:return
    raise AssertionError('Invalid source metadata accepted')
def check_six():
    a=old('pages/guide-sao2.json');b=read('pages/guide-sao2.json')
    assert {k:v for k,v in a.items() if k not in {'body','updated','revision_history'}}=={k:v for k,v in b.items() if k not in {'body','updated','revision_history'}}
    previous=b['revision_history'][-1]['previous_menu_row'];assert previous in a['body'] and previous not in b['body']
    rows=[('ゼクシード','通常C以上濃厚'),('ダイン','通常D以上濃厚'),('ペイルライダー','天国示唆'),('シュピーゲル（シノン＆シュピーゲル）','GGO死銃示唆')]
    updated=''.join('<tr><th scope="row">'+k+'</th><td>'+v+'</td></tr>' for k,v in rows)
    assert updated in b['body']
    restored=b['body'].replace(updated,previous)
    restored=re.sub(r'なな徹・メニュー画面のキャラ ↗</a>／2026年11月1日確認（.*?）。', 'なな徹・メニュー画面のキャラ ↗</a>／2026年10月17日確認。',restored)
    restored=restored.replace('初回確認：2026年10月17日。メニュー画面4キャラの示唆は2026年11月1日に追補しました。確認範囲は各項目の日付を参照してください。','情報確認・内容更新：2026年10月17日。')
    assert restored==a['body'],'Unrelated SAO2 content changed'
    n=read('data/industry-news.json');o=old('data/industry-news.json');item=None
    for previous_issue,current_issue in zip(o['issues'],n['issues']):
        assert previous_issue['date']==current_issue['date']
        for before,after in zip(previous_issue['articles'],current_issue['articles']):
            if before['id']!='sammy-cup':assert before==after;continue
            item=after
            assert after['published_at']==before['published_at']=='2026-10-07'
            assert after['event_date']==before['event_date']
            assert after['update_history'][-1]=={'checked_at':'2026-10-14','facts':before['facts'],'analysis':before['analysis'],'sources':before['sources']}
            assert after['sources'][:len(before['sources'])]==before['sources']
    assert item and len(n['issues'])==len(o['issues'])
    news=news_page(n)['body']
    for word in ['11月7・8日','1人10分','100円','18歳未満','受付が予定より早く終了','天候','笑和','ミーティングポイント','追補：']:
        assert word in news,word
    bad=copy.deepcopy(n);next(z for i in bad['issues'] for z in i['articles'] if z['id']=='sammy-cup')['updated_at']='2026-11-02';rejected(news_page,bad)
    c=read('data/new-machines.json');prev=old('data/new-machines.json')
    assert len(c['machines'])==len(prev['machines'])+2==20
    for before,after in zip(prev['machines'],c['machines']):
        if 'ガンゲイル' not in before['name']:assert before==after;continue
        assert {k:v for k,v in before.items() if k not in {'checked_at','field_test'}}=={k:v for k,v in after.items() if k not in {'checked_at','field_test'}}
        old_test=before['field_test'];test=after['field_test']
        assert test['history'][-1]=={'checked_at':old_test['checked_at'],'note':old_test['note']}
        assert {k:v for k,v in test.items() if k not in {'checked_at','note','history','start_confirmation'}}=={k:v for k,v in old_test.items() if k not in {'checked_at','note'}}
        assert after['date']=='2026-11-02' and test['start_confirmation']['date']=='2026-10-28'
    assert [(m['name'],m['date'],m['maker']) for m in c['machines'][-2:]]==[('L アサルトリリィ','2026-12-07','七匠'),('スマスロ バジリスク～甲賀忍法帖～Ⅳ','2026-12-21','アクロス')]
    cb=calendar_page(c)['body'];assert cb.count('10月31日版カレンダーには未掲載')==2 and '20機種' in cb and '開始報告：2026年10月28日' in cb
    for kind in ['url','future','early']:
        bad=copy.deepcopy(c);t=next(m['field_test']['start_confirmation'] for m in bad['machines'] if 'field_test' in m)
        if kind=='url':t['url']='javascript:alert(1)'
        elif kind=='future':t['checked_at']='2026-11-02'
        else:t['date']='2026-10-19'
        rejected(calendar_page,bad)
    bad=copy.deepcopy(c);t=next(m['field_test']['start_confirmation'] for m in bad['machines'] if 'field_test' in m);t['note']='<script>untrusted</script>'
    assert '&lt;script&gt;' in calendar_page(bad)['body'] and '<script>untrusted' not in calendar_page(bad)['body']
    league=read('data/league-4th.json');assert league==old('data/league-4th.json'),'No new battle/video claims authorized'
    lb=render(league)['body'];assert lb.count('動画を見る ↗')==8 and '予定日経過。収録実施・延期・中止は未確認。' in lb
    preview=schedule_preview('docs/slot-tankyu/index.html');assert '次の収録予定：2026年11月2日' in preview
    assert '決起集会の次の公開予定' not in preview and '決起集会：8チームの動画リンクを掲載' in preview
    sample=[{'release_at':'2026-11-01T20:00:00+09:00','video_url':'https://www.youtube.com/watch?v=abcdefghijk'},{'release_at':'2026-11-02T20:00:00+09:00'},{'release_at':'2026-10-31T20:00:00+09:00'}];frozen=copy.deepcopy(sample)
    assert next_rally(sample,datetime.date(2026,11,1))==sample[1] and sample==frozen
    assert next_rally(sample,datetime.date(2026,11,3)) is None
    assert next_rally(sample[:1],datetime.date(2026,11,1)) is None
    record=read('pages/record-tako-20261022.json');daily=read('pages/daily-20261022.json')
    assert record['author_comment']==['いいところなし。'] and record['author_excerpt']=='いいところなし。'
    for name in ['総プレイ数</th><td>387G','通常時プレイ数</th><td>387G','ボーナス合計</th><td>0回','投資</th><td>592枚','回収</th><td>0枚','−592枚']:
        assert name in record['body'],name
    assert '2026-10-22' in record['path'] and record['updated']==daily['updated']=='2026-11-01'
    assert '<img ' not in record['body'] and '店舗・開始時刻・貸出や交換条件は未確認' in record['body']
    assert build(record).count('id="author-comment"')==1
    assert 'takoslot/' in daily['body'] and '2026-10-22/takoslot/' in read('pages/listing.json')['body']
    latest=read('data/latest.json');assert latest['entries'][4:]==old('data/latest.json')['entries']
    allowed={'guide-sao2.json','home.json','listing.json','new-machines.json','industry-news.json','league-4th.json'}
    for p in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'scripts/slot-tankyu/pages'],cwd=ROOT,text=True).splitlines():
        name=Path(p).name
        if name not in allowed:assert json.loads((ROOT/p).read_text())==old('pages/'+name),p
    for p in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'scripts/slot-tankyu/data'],cwd=ROOT,text=True).splitlines():
        name=Path(p).name
        if name not in {'latest.json','industry-news.json','new-machines.json','presentation.json'}:assert json.loads((ROOT/p).read_text())==old('data/'+name),p
    print('PASS: six-priority source boundaries, new record, old history/comments preserved, same-day video exclusion, invalid dates/URLs and HTML escaped')
if __name__=='__main__':check_six()
