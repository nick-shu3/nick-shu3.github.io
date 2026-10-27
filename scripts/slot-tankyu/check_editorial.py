#!/usr/bin/env python3
"""Focused R01–R09 regressions, including preservation against the reviewed base.
Run after all generators. This is a static check, never browser certification.
"""
import copy, datetime, hashlib, json, re, subprocess
from html.parser import HTMLParser
from pathlib import Path
from build import build, ROOT, SOURCE
from editorial_views import latest_feed, pages, visible_dates, daily_list, date_label, machine_navigation
from league_schedule import render
from news_calendar import calendar_page, news_page
from check_sao2 import check_sao2, MAINTENANCE_PAGE_CANDIDATES

BASE='a029189013abbc2705fab452ec8172f3795e9c82'
HERE=Path(__file__).resolve().parent

def original(path):
    return subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT)

def base_page(name):
    return json.loads(original('scripts/slot-tankyu/pages/'+name+'.json'))

class Content(HTMLParser):
    def __init__(self,text):
        super().__init__();self.text=[];self.cells=[];self.cell=None;self.links=[]
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag in ('th','td'):self.cell=[]
        if tag=='a':self.links.append(attrs)
    def handle_data(self,text):
        self.text.append(text)
        if self.cell is not None:self.cell.append(text)
    def handle_endtag(self,tag):
        if tag in ('th','td') and self.cell is not None:
            self.cells.append(''.join(self.cell));self.cell=None

def section(body,identifier):
    return re.search(r'<section\b[^>]*\bid="'+re.escape(identifier)+r'"[^>]*>(.*?)</section>',body,re.S)[1]

def main():
    from check_update_20261026 import check_update
    check_update()
    from check_dstation_20261028 import check_dstation
    check_dstation()
    catalog=pages();home=catalog['home'];output=build(home)
    # R01/R02: category coverage, ordering, duplicate grouping, section hierarchy.
    latest=latest_feed(home['path']);links=Content(latest).links
    assert len(links)==6
    # New records can naturally move older news below the six-item window.
    # Verify the complete cross-category source and exact ordered window instead.
    feed=json.loads((HERE/'data/latest.json').read_text())
    assert {'実戦','番組紹介','ニュース','機種ガイド'} <= {e['category'] for e in feed['entries']}
    selected=[]; groups=set()
    for entry in sorted(feed['entries'],key=lambda e:e['date'],reverse=True):
        if entry['group'] in groups:continue
        groups.add(entry['group']);selected.append(entry)
        if len(selected)==feed['limit']:break
    assert len(links)==len(selected)
    for link,entry in zip(links,selected):
        target=catalog[entry['source']]['path'].removeprefix('docs/slot-tankyu/').removesuffix('index.html')
        assert link['href']==target+('#'+entry['anchor'] if entry.get('anchor') else '')
    dates=re.findall(r'内容更新日：<time datetime="([^"]+)',latest)
    assert dates==sorted(dates,reverse=True)
    assert not any('/index.html' in a['href'] for a in links)
    assert all(not re.fullmatch(r'records/\d{4}-\d{2}-\d{2}/',a['href']) for a in links)
    order=['latest','guides','archive','records','updates','about']
    positions=[output.index('<section id="'+i+'"') for i in order]
    assert positions==sorted(positions)
    assert 'hero-visual' not in output and 'おすすめの過去実戦' in section(output,'archive')
    assert len(re.findall('<img ',section(output,'archive')))==2
    for link in ['machines/tokyo-ghoul/','machines/lycoris-recoil/','machines/takoslot/','records/','new-machines/','news/','watch/','league/777league/','about/']:
        assert 'href="'+link in output,link
    recent=sorted((p['path'].split('/')[3] for p in catalog.values() if p['type']=='daily'),reverse=True)[:3]
    assert re.findall(r'datetime="([^"]+)"',section(output,'records'))==recent
    # News and schedule retain their previous invariants. Only the exact local
    # calendar candidate is admitted. Content review is recorded separately;
    # matching a pin does not certify source facts or rendering by itself.
    for name in ['industry-news','league-4th','new-machines']:
        path='scripts/slot-tankyu/data/'+name+'.json'
        if name=='league-4th':
            current=json.loads(subprocess.check_output(['git','show','d7c2abba36c10bc615056db3c87a30df3047bdd5:'+path],cwd=ROOT))
            assert len(current['rows'])==42 and current['checked_at']=='2026-10-21'
            assert all(r['schedule_source']=='https://p-gabu.jp/sc/666/777league/schedule/' and r['schedule_checked_at']=='2026-10-21' for r in current['rows'])
            prior=json.loads(subprocess.check_output(['git','show','34eb7ad2ffa0ac6c81f2e782a5e08d1b42822e76:'+path],cwd=ROOT))
            indexed={(r['date'],r['round']):r for r in current['rows']}
            for r in prior['rows']:
                new=indexed[(r['date'],r['round'])]
                if r['status']=='終了':
                    for field in ('status','evidence_url','evidence_note'):assert new.get(field)==r.get(field)
            assert indexed[('2026-11-12','ルーキー戦第1回戦')]['venue']=='ダイナム長野上田店'
            assert indexed[('2026-11-25','RED第10回戦')]['venue']=='123+N布施店'
        elif name=='new-machines':
            assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()=='6997a38c880c1bffa9092a3bb5b9d1e67e48af718f108427870db2562f92de06',name
        else:assert (ROOT/path).read_bytes()==original(path),name
    # Keep prior dated regressions intact on their reviewed fixture.
    league=json.loads(subprocess.check_output(['git','show','d7c2abba36c10bc615056db3c87a30df3047bdd5:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT));frozen=copy.deepcopy(league)
    legacy=json.loads(subprocess.check_output(['git','show','34eb7ad2ffa0ac6c81f2e782a5e08d1b42822e76:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT))
    for reference,first in [('2026-10-14','2026年10月14日'),('2026-10-15','2026年10月21日'),('2026-10-16','2026年10月21日')]:
        body=render(legacy,reference)['body']; upcoming=section(body,'next')
        assert re.search(r'<li><a[^>]*>(\d+年\d+月\d+日)',upcoming)[1]==first
        if reference>'2026-10-14':assert '2026年10月14日 BLUE第4回戦' in section(body,'pending')
        assert body.count('class="league-status done"')==sum(r['status']=='終了' for r in legacy['rows'])
        assert '収録情報の確認日：2026年10月14日' in body
    assert '今後の収録予定は確認待ち' in render(legacy,'2027-01-01')['body']
    prior_edition=json.loads(subprocess.check_output(['git','show','333a2620882d2046af0a31d8f2d8aebb4a602066:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT))
    for reference,first in [('2026-10-21','2026年10月21日'),('2026-10-22','2026年10月22日'),('2026-10-23','2026年10月30日')]:
        body=render(prior_edition,reference)['body']
        assert re.search(r'<li><a[^>]*>(\d+年\d+月\d+日)',section(body,'next'))[1]==first
        assert body.count('class="league-status done"')==sum(r['status']=='終了' for r in prior_edition['rows'])
    # 2026-10-22: resolve only the two reviewed statuses; preserve the other 40 rows.
    before=json.loads(subprocess.check_output(['git','show','112797c56d7e06c4dd22879ce8d92107eaa3dfd4:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT))
    for previous,current in zip(before['rows'],prior_edition['rows']):
        if current['date'] in {'2026-08-31','2026-10-14'}:
            assert current['status']=='終了' and current['status_checked_at']=='2026-10-22'
            assert current['status_history'][0]['status']=='終了確認待ち'
        else:assert previous==current
    assert prior_edition['rallies']==before['rallies']
    pre_garden=json.loads(subprocess.check_output(['git','show','cf01a7bdd0996a1d79487a38c4a7adb8e8949407:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT))
    # Current change: one battle only; rally/video settings remain byte-for-byte equivalent.
    for previous,current in zip(prior_edition['rows'],pre_garden['rows']):
        if current['date']=='2026-10-21':
            assert current['status']=='終了' and current['status_checked_at']=='2026-10-22'
            assert current['status_history'][0]['status']=='予定'
            assert current['evidence_url']=='https://x.com/Rino_Tachi/status/2112829620567556492'
            assert current['broadcast_date']==previous['broadcast_date'] and current['broadcast_status']==previous['broadcast_status']
        else:assert previous==current
    assert {k:v for k,v in pre_garden.items() if k!='rows'}=={k:v for k,v in prior_edition.items() if k!='rows'}
    assert section(render(pre_garden)['body'],'rallies')==section(render(prior_edition)['body'],'rallies')
    assert {k:v for k,v in league.items() if k!='rallies'}=={k:v for k,v in pre_garden.items() if k!='rallies'}
    reviewed_garden=json.loads(subprocess.check_output(['git','show','767bf3e0298c91a21b5dab549497593189438f71:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT))
    pre_armada=json.loads(subprocess.check_output(['git','show','8b8f17c8c7d1e5b40f63c1183213a11abb4daacb:scripts/slot-tankyu/data/league-4th.json'],cwd=ROOT))
    for previous,current in zip(pre_armada['rallies'],league['rallies']):
        if current['team']=='アルマダイナム':
            assert current['video_url']=='https://www.youtube.com/watch?v=bxBwQOQB8cQ'
            assert current['watch_slug']=='armada-dynam-rally' and current['video_link_checked_at']=='2026-10-25'
            assert {k:v for k,v in current.items() if k not in {'video_url','watch_slug','video_link_checked_at','video_evidence'}}==previous
        else:assert current==previous
    for previous,current in zip(reviewed_garden['rallies'],pre_armada['rallies']):
        if current['team']=='123エンターテイナーズ':
            assert current['video_url']=='https://www.youtube.com/watch?v=Jrnxg90tmk0'
            assert current['watch_slug']=='123-entertainers-rally'
            assert current['video_link_checked_at']=='2026-10-22'
            assert {k:v for k,v in current.items() if k not in {'video_url','watch_slug','video_link_checked_at','video_evidence'}}==previous
        else:assert current==previous
    for previous,current in zip(pre_garden['rallies'],reviewed_garden['rallies']):
        if current['team']=='ガーデンユナイテッド':
            assert current['video_url']=='https://www.youtube.com/watch?v=Hw7rRNl9vxQ'
            assert current['watch_slug']=='garden-united-rally' and current['video_link_checked_at']=='2026-10-22'
            assert {k:v for k,v in current.items() if k not in {'video_url','watch_slug','video_link_checked_at','video_evidence'}}==previous
        else:assert current==previous
    assert '2026年10月22日 BLUE第6回戦' in section(render(league,'2026-10-21')['body'],'next')
    assert '2026年10月21日 BLUE第5回戦' not in section(render(league,'2026-10-21')['body'],'next')
    invalid_date=copy.deepcopy(league)
    invalid_date['rows'][10]['status_checked_at']='2026-10-20'
    try:render(invalid_date)
    except ValueError:pass
    else:raise AssertionError('Ended before its dated evidence accepted')
    calendar=json.loads(subprocess.check_output(['git','show','d7c2abba36c10bc615056db3c87a30df3047bdd5:scripts/slot-tankyu/data/new-machines.json'],cwd=ROOT))
    prior_calendar=json.loads(subprocess.check_output(['git','show','333a2620882d2046af0a31d8f2d8aebb4a602066:scripts/slot-tankyu/data/new-machines.json'],cwd=ROOT))
    assert calendar['machines'][:12]==prior_calendar['machines'] and len(calendar['machines'])==17
    assert [(m['date'],m['name']) for m in calendar['machines'][12:]]==[
        ('2026-12-21','スマスロ 魔女と野獣'),('2026-12-21','Lブルーリフレクション帝'),
        ('2027-01-12','パチスロ ライザのアトリエ ～常闇の女王と秘密の隠れ家～'),
        ('2027-01-12','スマスロモンキーターンRED'),('2027-01-25','スマスロ シャカラッシュ')]
    calendar_body=calendar_page(calendar)['body']
    assert '2027年1月の導入予定' in calendar_body and '17機種' in calendar_body
    for m in calendar['machines'][12:]:assert m['verification'] in calendar_body
    assert '一撃は1月18日' in calendar_body and '一撃は1月12日' in calendar_body
    assert calendar_body.count('別の日程資料')==2
    invalid_link=copy.deepcopy(calendar);invalid_link['machines'][-1]['alternate_schedule_url']='javascript:alert(1)'
    try:calendar_page(invalid_link)
    except ValueError:pass
    else:raise AssertionError('Unsafe alternate source URL accepted')
    # Page freshness now includes the independently checked Armada link date.
    assert render(league,'2026-10-21')['updated']=='2026-10-25'
    body=render(league,'2026-10-21')['body']
    assert section(body,'rallies').count('動画を見る ↗')==5
    assert '公開確認待ち' in section(body,'rallies') and '公開予定' in section(body,'rallies')
    assert '2027年3月12日' in body and league==frozen
    assert '今後の収録予定は確認待ち' in render(league,'2027-04-01')['body']
    for kind in ('finished','video','video-date'):
        invalid=copy.deepcopy(league)
        if kind=='finished':
            invalid['rows'][0]['status']='終了';invalid['rows'][0]['evidence_url']=None
        elif kind=='video':invalid['rallies'][0]['video_url']='https://example.com/video'
        else:invalid['rallies'][0].pop('video_link_checked_at')
        try:render(invalid)
        except ValueError:pass
        else:raise AssertionError('Invalid evidence accepted: '+kind)
    # R04/R05: exact maintenance editions, existing destinations and all prior
    # table cells survive in order. Only the two documented wording corrections
    # below may replace existing cells; added tables do not waive preservation.
    corrected_cells={
        'guide-tokyo':{'100G以内CZ':'100G＋α以内CZ','100G以内CZ当選率':'100G＋α以内CZ当選率'},
        'guide-lycoris':{'真島が社内で通話（Time will tell①）':'真島が通話（Time will tell①）'},
    }
    for name in ['guide-tokyo','guide-lycoris','guide-tako']:
        d=catalog[name];old=base_page(name)
        assert hashlib.sha256((SOURCE/(name+'.json')).read_bytes()).hexdigest()==MAINTENANCE_PAGE_CANDIDATES[name+'.json'],name
        existing=iter(Content(d['body']).cells)
        for cell in Content(old['body']).cells:
            expected=corrected_cells.get(name,{}).get(cell,cell)
            assert any(candidate==expected for candidate in existing),(name,cell)
        for i in d['quick_links']:assert 'id="'+i['id']+'"' in d['body']
    assert {i['id'] for i in catalog['guide-tako']['quick_links']}=={'available','setting','bt-replay','bb-screen','records'}
    assert '設定別データ' not in catalog['guide-tokyo']['title']
    # R06: full supplied paragraphs and all prior record body are preserved.
    for name,p in catalog.items():
        # Navigation-only index: existing articles retain their reviewed hashes.
        if name=='columns-listing':
            assert p['type']=='listing' and p['path']=='docs/slot-tankyu/columns/index.html'
            assert p['body']=='<section id="articles"><h2>コラム一覧</h2><!-- columns-list --></section>'
            assert 'chatgpt-slot-log-failure/' in build(p)
            continue
        if name=='guide-sao2':
            check_sao2(p)
            continue
        # New sources are fixed to their independently reviewed edition.
        additions={'record-tokyo-20261019': '71b8924a10ecc57a2bc07afe703181a1db8180bf43e2e62502e3c39897fd01f6', 'daily-20261019': 'ec926e38d38badcea3d0449d254b3e9fdf3e9bcece04f20dc017837099b5c4ae', 'record-shinuchi-20261018': 'da139b142aa0a7d92b1e188c49a72589892a0bbafe386880e4fb3493e8ce35cb', 'daily-20261018': '1fa5f7c24c22fafad4ad76499a82c354f0b5c43137090bb19008ab15c66f48c7', 'guide-shinuchi': 'f7b15411f5439c6766544153241778fd0e3b11429f6954c625c821172f5f374e', 'watch-tengai-golden-manes': 'f21f33428691055dba7190e95524a1f864cf115221bc1cf6e7aafd99ef806cc8', 'record-sao2-20261017': '20f595ea29a24fcc8eab1bf031bee452bacd826db385983ad89f9da946c75b0d', 'daily-20261017': '8da16be03d0dd6455c213a5e2d010f71b580bb125b598d8093ce607f88229e35'}
        additions['watch-dstation-heroes']='19116c8291684d6bc04866bb55963294e25df68344a1592e9ef8ff7d449cfebb'
        additions['watch-armada-dynam']='2dedcdb9359d86e08c1f24f5bab89dafbcaae1922c05c801ee2a14696b426c2b'
        additions['watch-123-entertainers']='af4a2faa1f4a7e36b13e386c00226249415aedf31acb02ead7ac5949356b0166'
        additions['watch-garden-united']='f2cd80a56de325c815786b2e47b553c79e7b2c808ec3876e40fe1e5091a67b1f'
        # First column: exact local edition, independently checked against the
        # author's manuscript and confirmed session data; see review record.
        additions['column-osaka-umeda-20261025']='8e25f64b2b5addb858ccb6ced5fee38f4603c8c0f8d7584aafac990394b2f1a0'
        additions['record-jashinchan-20261025']='52aa4cb98b20218da9edd03f656176da02dafd4a4af70808ac43ccf5b261ca53'
        additions['daily-20261025']='304b00584ea4bcc714dfdbaf66fe039fa6b686ea91d82a80b1eaeb401bbcc0f2'
        additions['column-chatgpt-slot-log-failure']='90d54047d894a995cb05e9b442b7ce565bd2759b8fef6fdeed6f69acd0d662e0'
        if name in additions:
            if name=='record-tokyo-20261019':
                # 2026-10-20 independently reviewed correction; retain original
                # comments and pin the additional structured source as well.
                additions[name]='e07bc0265cdb2a98f498181571c17324b3b9a1f15acaccec8fce373c5c444f86'
                confirmed=HERE/'data/record-tokyo-20261019-confirmed.json'
                assert hashlib.sha256(confirmed.read_bytes()).hexdigest()=='79859222952fb8dce70941c9cac9abf04d05fe19b13de6e0c5eb6e112786d063'
                before=json.loads(subprocess.check_output(['git','show','cbcee92e7e85403368b361a4767f69e208cf16a7:scripts/slot-tankyu/pages/record-tokyo-20261019.json'],cwd=ROOT))
                assert p['author_comment']==before['author_comment']
                assert p['author_excerpt']==before['author_excerpt']
                assert 'id="at-history"' in build(p) and '8,480枚' in build(p)
            assert hashlib.sha256((SOURCE/(name+'.json')).read_bytes()).hexdigest()==additions[name],name
            continue
        old=base_page(name)
        assert p.get('author_comment')==old.get('author_comment'),name
        if p['type']=='record':assert p['body']==old['body'],name
        if p.get('author_excerpt'):
            assert any(p['author_excerpt'] in paragraph for paragraph in p['author_comment'])
            rendered=build(p)
            assert rendered.index('class="comment-preview"') < rendered.index('id="bonuses"')
            assert rendered.count('id="author-comment"')==1
        elif p['type']=='record':assert 'comment-preview' not in build(p)
    supplied=copy.deepcopy(catalog['record-tako-20261015']);supplied['author_excerpt']='AIが補った感想'
    try:build(supplied)
    except ValueError:pass
    else:raise AssertionError('Non-verbatim excerpt accepted')
    no_comment=copy.deepcopy(catalog['record-tako-20261015']);no_comment.pop('author_excerpt');no_comment['author_comment']=[]
    assert 'id="author-comment"' not in build(no_comment)
    escaped=copy.deepcopy(catalog['record-tako-20261015']);escaped['author_comment']=['<b>感想 & 本人</b>'];escaped['author_excerpt']=escaped['author_comment'][0]
    assert '&lt;b&gt;感想 &amp; 本人&lt;/b&gt;' in build(escaped)
    # R07: every published same-machine destination, excluding current page.
    tako=[p for p in catalog.values() if (p.get('machine_slug')=='takoslot' or '/takoslot/' in p['path']) and p['type'] in {'guide','record','watch'}]
    assert len(tako)==5
    for p in tako:
        navigation=machine_navigation(p)
        for q in tako:
            if p['path']!=q['path']:assert q['title'] in ''.join(Content(navigation).text)
    shinuchi=[p for p in catalog.values() if p.get('machine_slug')=='shinuchi-yoshimune' or '/shinuchi-yoshimune/' in p['path']]
    assert {p['type'] for p in shinuchi}=={'guide','record'} and len(shinuchi)==2
    for p in shinuchi:
        for q in shinuchi:
            if p['path']!=q['path']:assert q['title'] in ''.join(Content(machine_navigation(p)).text)
    # R08: all daily entries, including historical entries, no manual missing dates.
    daily={p['path'].split('/')[3] for p in catalog.values() if p['type']=='daily'}
    listing=daily_list(catalog['listing']['path'])
    assert set(re.findall(r'datetime="([^"]+)"',listing))==daily
    sample='<time datetime="2026-11-02"><a href="#date-2026-12-07">2026/11/02</a></time>'
    normalized=visible_dates(sample)
    assert '2026年11月2日' in normalized and 'datetime="2026-11-02"' in normalized and '#date-2026-12-07' in normalized
    assert '日時は日本時間' not in ''.join(build(p) for p in catalog.values())
    for p in catalog.values():
        text='\n'.join(Content(build(p)).text)
        assert not re.search(r'20\d{2}[/.-]\d{1,2}[/.-]\d{1,2}',text),p['path']
    # R09: every approved fact/analysis/qualification/source kind remains in generated text.
    news=json.loads((HERE/'data/industry-news.json').read_text());body=news_page(news)['body'];text=''.join(Content(body).text)
    for issue in news['issues']:
        for article in issue['articles']:
            assert article['facts'] in text and article['analysis'] in text
            for source in article['sources']:assert source['kind'] in text and source['url'] in body
            if article.get('metric_note'):assert article['metric_note'] in text
    assert 'パチンコとパチスロのDI比較' in body
    assert 'パチンコ・パチスロ' not in news_page(news)['title']
    # Reproduce all upstream generated JSON, not just final HTML.
    for name,renderer in [('industry-news',news_page),('new-machines',calendar_page),('league-4th',render)]:
        data=json.loads((HERE/'data'/f'{name}.json').read_text())
        assert renderer(data)==catalog[name]
    # Preserve YouTube new-tab behavior, security controls, images and source data.
    for name in ['watch-face-mega-tigers','watch-takoslot-wasabi','watch-garden-united']:
        for a in Content(build(catalog[name])).links:
            if a.get('class')=='button-primary' and 'youtube.com/' in a['href']:
                assert a.get('target')=='_blank' and {'noopener','noreferrer'}<=set(a.get('rel','').split())
    for path in ['AGENTS.md','SECURITY.md','.github/workflows/pages.yml','package.json','package-lock.json','docs/security/standalone.css','docs/security/standalone.js']:
        assert (ROOT/path).read_bytes()==original(path),path
    # Actual photographic bytes must not change in a typography/navigation task.
    photos=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'docs/slot-tankyu/assets/records','docs/slot-tankyu/assets/setting'],cwd=ROOT,text=True).splitlines()
    for path in photos:assert (ROOT/path).read_bytes()==original(path),path
    print(f"PASS: R01–R09 static regressions; {len(catalog)} pages, {len(league['rows'])} schedule rows, 4 news articles, {len(photos)} photos preserved. Browser QA NOT performed.")

if __name__=='__main__':main()
