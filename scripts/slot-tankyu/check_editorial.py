#!/usr/bin/env python3
"""Focused R01–R09 regressions, including preservation against the reviewed base.
Run after all generators. This is a static check, never browser certification.
"""
import copy, datetime, json, re, subprocess
from html.parser import HTMLParser
from pathlib import Path
from build import build, ROOT, SOURCE
from editorial_views import latest_feed, pages, visible_dates, daily_list, date_label, machine_navigation
from league_schedule import render
from news_calendar import calendar_page, news_page
from check_sao2 import check_sao2

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
    catalog=pages();home=catalog['home'];output=build(home)
    # R01/R02: category coverage, ordering, duplicate grouping, section hierarchy.
    latest=latest_feed(home['path']);links=Content(latest).links
    assert len(links)==6
    assert all(c in latest for c in ['実戦','番組紹介','ニュース'])
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
    assert '2026-10-14/' in section(output,'records')
    # News, schedule and calendar source facts are byte-for-byte unchanged.
    for name in ['industry-news','league-4th','new-machines']:
        path='scripts/slot-tankyu/data/'+name+'.json'
        assert (ROOT/path).read_bytes()==original(path),name
    league=json.loads((HERE/'data/league-4th.json').read_text());frozen=copy.deepcopy(league)
    for reference,first in [('2026-10-14','2026年10月14日'),('2026-10-15','2026年10月21日'),('2026-10-16','2026年10月21日')]:
        body=render(league,reference)['body']; upcoming=section(body,'next')
        assert re.search(r'<li><a[^>]*>(\d+年\d+月\d+日)',upcoming)[1]==first
        if reference>'2026-10-14':assert '2026年10月14日 BLUE第4回戦' in section(body,'pending')
        assert body.count('class="league-status done"')==sum(r['status']=='終了' for r in league['rows'])
        assert '収録情報の確認日：2026年10月14日' in body
    assert league==frozen
    assert '今後の収録予定は確認待ち' in render(league,'2027-01-01')['body']
    invalid=copy.deepcopy(league);invalid['rows'][0]['status']='終了'
    try:render(invalid)
    except ValueError:pass
    else:raise AssertionError('Finished status without evidence accepted')
    # R04/R05: only existing destinations; preserve every existing table cell.
    for name in ['guide-tokyo','guide-lycoris','guide-tako']:
        d=catalog[name];old=base_page(name)
        assert Content(d['body']).cells==Content(old['body']).cells
        for i in d['quick_links']:assert 'id="'+i['id']+'"' in d['body']
    assert all('設定別' not in i['label'] and '終了画面' not in i['label'] for i in catalog['guide-tako']['quick_links'])
    assert '設定別データ' not in catalog['guide-tokyo']['title']
    # R06: full supplied paragraphs and all prior record body are preserved.
    for name,p in catalog.items():
        if name=='guide-sao2':
            check_sao2(p)
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
    for name in ['watch-face-mega-tigers','watch-takoslot-wasabi']:
        for a in Content(build(catalog[name])).links:
            if a.get('class')=='button-primary' and 'youtube.com/' in a['href']:
                assert a.get('target')=='_blank' and {'noopener','noreferrer'}<=set(a.get('rel','').split())
    for path in ['AGENTS.md','SECURITY.md','.github/workflows/pages.yml','package.json','package-lock.json','docs/security/standalone.css','docs/security/standalone.js']:
        assert (ROOT/path).read_bytes()==original(path),path
    # Actual photographic bytes must not change in a typography/navigation task.
    photos=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'docs/slot-tankyu/assets/records','docs/slot-tankyu/assets/setting'],cwd=ROOT,text=True).splitlines()
    for path in photos:assert (ROOT/path).read_bytes()==original(path),path
    print(f'PASS: R01–R09 static regressions; {len(catalog)} pages, 27 schedule rows, 4 news articles, {len(photos)} photos preserved. Browser QA NOT performed.')

if __name__=='__main__':main()
