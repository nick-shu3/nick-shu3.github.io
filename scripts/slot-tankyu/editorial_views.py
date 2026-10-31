"""Shared static navigation and date presentation. No runtime requests or new facts."""
import datetime, hashlib, html, json, re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent

def esc(value):
    return html.escape(str(value), quote=True)

def date_label(value):
    day = datetime.date.fromisoformat(value) if isinstance(value, str) else value
    return f'{day.year}年{day.month}月{day.day}日'

def visible_dates(text):
    """Normalize display text only. Leave URLs, IDs and datetime attributes intact."""
    def normalize(part):
        pattern = r'(?<![\d/])((?:19|20)\d{2})[年./-](\d{1,2})[月./-](\d{1,2})(?:日)?(?!\d)'
        def replace(match):
            try:
                return date_label(datetime.date(*map(int, match.groups())))
            except ValueError:
                return match[0]
        return re.sub(pattern, replace, part)
    return ''.join(part if part.startswith('<') else normalize(part) for part in re.split(r'(<[^>]*>)', text))

def pages():
    return {p.stem: json.loads(p.read_text()) for p in (HERE/'pages').glob('*.json')}

def column_cards(origin, sources=None):
    catalog = pages()
    columns = [p for name,p in catalog.items() if p['type']=='column' and (sources is None or name in sources)]
    if sources is not None and len(columns)!=len(sources):
        raise ValueError('Related columns must refer to existing column articles')
    return '<div class="grid">'+''.join(
        '<a class="card" href="'+esc(href(p['path'],origin))+'"><span class="tag">コラム</span><h3>'+esc(p['short_title'])+' →</h3><p>'+esc(p['description'])+'</p></a>'
        for p in sorted(columns,key=lambda p:tuple(map(int,re.findall(r'\d+',p['updated']))),reverse=True))+'</div>'

def related_columns(page):
    relations = json.loads((HERE/'data/column-relations.json').read_text())
    sources = relations.get(page['path'],[])
    if not sources:
        return ''
    return '<section id="related-columns"><h2>この実戦に関連するコラム</h2>'+column_cards(page['path'],sources)+'</section>'

def href(target, origin):
    import posixpath
    return posixpath.relpath(target, posixpath.dirname(origin)).removesuffix('index.html') or './'

def daily_list(origin, limit=None):
    items = []
    for page in pages().values():
        match = re.fullmatch(r'docs/slot-tankyu/records/(\d{4}-\d{2}-\d{2})/index.html', page['path'])
        if page['type'] == 'daily' and match:
            items.append((match[1], page))
    items.sort(key=lambda item: item[0], reverse=True)
    if limit is not None:
        items = items[:limit]
    return '<div class="daily-list">'+''.join('<a class="card daily-card" href="'+esc(href(p['path'], origin))+'"><span class="tag">実戦日：<time datetime="'+d+'">'+date_label(d)+'</time></span><h3>'+esc(p['title'])+' →</h3></a>' for d,p in items)+'</div>'

def latest_feed(origin):
    data=json.loads((HERE/'data/latest.json').read_text()); catalog=pages()
    if not 4 <= data['limit'] <= 6:
        raise ValueError('Latest must show four to six items')
    entries=sorted(data['entries'],key=lambda e:e['date'],reverse=True)
    selected=[]; groups=set()
    for item in entries:
        datetime.date.fromisoformat(item['date'])
        if not item.get('reason') or item['date_kind'] not in {'記事公開日','内容更新日','紹介日'}:
            raise ValueError('Latest date needs explicit editorial evidence and kind')
        if item['group'] in groups:
            continue
        groups.add(item['group']); selected.append(item)
        if len(selected) == data['limit']:
            break
    if len(selected) < 4:
        raise ValueError('Not enough latest items')
    result='<ol class="latest-list">'
    for item in selected:
        p=catalog[item['source']]; title=p['title']; extra=''
        target=href(p['path'],origin)
        if item.get('anchor'):
            # News entries refer to reviewed issue content, not an inferred publication date.
            news=json.loads((HERE/'data/industry-news.json').read_text())
            issue,article=next((issue,a) for issue in news['issues'] for a in issue['articles'] if a['id']==item['anchor'])
            if issue['date'] != item['date']:
                raise ValueError('Latest news date must match the reviewed issue')
            title=article['title'];target+='#'+item['anchor']
        elif item['date_kind']=='内容更新日':
            if visible_dates(p['updated']) != date_label(item['date']):
                raise ValueError('Latest date differs from page content date')
        elif item['date_kind']=='紹介日':
            if '紹介日：'+date_label(item['date']) not in p['body']:
                raise ValueError('Watch introduction date missing')
        if p['type']=='record':
            day=p['path'].split('/')[3]
            extra='<small>実戦日：<time datetime="'+day+'">'+date_label(day)+'</time></small>'
        result+='<li><a href="'+esc(target)+'"><span class="latest-meta"><span class="tag">'+esc(item['category'])+'</span><span>'+esc(item['date_kind'])+'：<time datetime="'+item['date']+'">'+date_label(item['date'])+'</time></span></span><strong>'+esc(title)+' →</strong>'+extra+'</a></li>'
    return result+'</ol><p class="hint">同日の項目は編集上の登録順です。</p>'

def presentation_date():
    return datetime.date.fromisoformat(json.loads((HERE/'data/presentation.json').read_text())['as_of'])

def next_rally(rallies, reference):
    """Known video links are no longer future release announcements."""
    candidates = [r for r in rallies if not r.get('video_url') and
                  datetime.datetime.fromisoformat(r['release_at']).date() >= reference]
    return min(candidates, key=lambda r: r['release_at']) if candidates else None

def schedule_preview(origin):
    reference=presentation_date()
    data=json.loads((HERE/'data/new-machines.json').read_text())
    future=sorted({m['date'] for m in data['machines'] if datetime.date.fromisoformat(m['date'])>=reference})
    result='<div class="schedule-preview"><p class="hint">予定表示の基準日：'+date_label(reference)+'。日程情報の確認日とは別です。</p>'
    if future:
        date=future[0];names='、'.join(m['name'] for m in data['machines'] if m['date']==date)
        result+='<p><strong>次の導入開始予定：'+date_label(date)+'</strong><br>'+esc(names)+'<br><a href="new-machines/#date-'+date+'">機種別の確認状況・出典 →</a></p>'
    result+='<p class="hint">全国予定と店舗の入替日は別です。日程情報の確認日：'+date_label(data['checked_at'])+'。</p>'
    league=json.loads((HERE/'data/league-4th.json').read_text())
    future=sorted([r for r in league['rows'] if r['status']=='予定' and datetime.date.fromisoformat(r['date'])>=reference],key=lambda r:r['date'])
    if future:
        row=future[0]
        result+='<p><strong>次の収録予定：'+date_label(row['date'])+' '+esc(row['round'])+'</strong><br>'+esc(row['venue'])+'</p>'
    result+='<p class="hint">収録日と動画公開日は別です。公式掲載の予定で、変更の可能性があります。日程確認日：'+date_label(league['checked_at'])+'。</p>'
    rally=next_rally(league['rallies'], reference)
    if rally:
        dt=datetime.datetime.fromisoformat(rally['release_at'])
        result+='<p><strong>決起集会の次の公開予定：'+date_label(dt.date())+' '+dt.strftime('%H:%M')+'</strong><br>'+esc(rally['team'])+'<br><a href="league/777league/#rallies">動画リンク・公開の確認状況 →</a></p>'
    else:
        linked=sum(bool(r.get('video_url') and r.get('video_link_checked_at')) for r in league['rallies'])
        result+='<p><strong>決起集会：'+str(linked)+'チームの動画リンクを掲載</strong><br><a href="league/777league/#rallies">動画と感想記事を見る →</a></p>'
    return result+'<p><a href="new-machines/">新台カレンダー →</a> ／ <a href="league/777league/#next">収録予定・終了確認待ち →</a></p></div>'

def machine_navigation(page):
    catalog=pages(); slugs={'tokyo-ghoul':'東京喰種','lycoris-recoil':'リコリス・リコイル','takoslot':'タコスロ','sao2':'SAO2','shinuchi-yoshimune':'真打 吉宗'}
    slug=page.get('machine_slug') or next((s for s in slugs if s in page['path'].split('/')),None)
    if slug not in slugs or page['type'] not in {'guide','record','watch'}:
        return ''
    groups=[]
    for kind,label in [('guide','機種ガイド'),('record','機種別実戦'),('watch','関連する番組紹介')]:
        related=[p for p in catalog.values() if p['type']==kind and (p.get('machine_slug')==slug or slug in p['path'].split('/')) and p['path']!=page['path']]
        related.sort(key=lambda p:p['path'],reverse=True)
        if related:
            groups.append('<div><h3>'+label+'</h3><ul>'+''.join('<li><a href="'+esc(href(p['path'],page['path']))+'">'+esc(p['title'])+' →</a></li>' for p in related)+'</ul></div>')
    return '<section id="machine-links" class="related"><h2>'+slugs[slug]+'をもっと読む</h2><div class="machine-links">'+''.join(groups)+'</div></section>' if groups else ''

def guide_shortcuts(page):
    links=page.get('quick_links',[])
    if not links:
        return ''
    for item in links:
        if not re.fullmatch(r'[a-z0-9-]+',item['id']) or 'id="'+item['id']+'"' not in page['body']:
            raise ValueError('Guide shortcut must target existing content')
    return '<nav class="guide-shortcuts" aria-label="見たい情報へ直接進む"><p>見たい情報へ</p><div>'+''.join('<a href="#'+esc(i['id'])+'">'+esc(i['label'])+' →</a>' for i in links)+'</div></nav>'


class GuideParagraphs(HTMLParser):
    """Locate complete source paragraphs, without rewriting text or inline links."""
    VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.offsets = [0]
        for line in source.splitlines(keepends=True):
            self.offsets.append(self.offsets[-1] + len(line))
        self.stack = []
        self.paragraph = None
        self.by_id = {}
        self.feed(source)

    def source_offset(self):
        line, column = self.getpos()
        return self.offsets[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag == 'p':
            if self.paragraph is not None:
                raise ValueError('Nested guide paragraph')
            self.paragraph = (self.source_offset(), [i for _,i in self.stack if i])
        if tag not in self.VOID:
            self.stack.append((tag,dict(attrs).get('id')))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag == 'p' and self.paragraph is not None:
            start, identifiers = self.paragraph
            end = self.source.index('>',self.source_offset()) + 1
            markup = self.source[start:end]
            for identifier in identifiers:
                self.by_id.setdefault(identifier,[]).append(markup)
            self.paragraph = None
        for index in range(len(self.stack)-1,-1,-1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break


def guide_digest(page):
    """Show selected existing paragraphs verbatim; never generate new advice."""
    items = page.get('guide_digest',[])
    if not items:
        return ''
    if page['type'] != 'guide' or not isinstance(items,list) or len(items)>3:
        raise ValueError('Digest is limited to guide pages')
    paragraphs = GuideParagraphs(page['body']).by_id
    cards = []
    for item in items:
        target = item['id']
        if target not in paragraphs or not re.fullmatch(r'[a-z0-9-]+',target):
            raise ValueError('Digest needs existing guide content')
        selected = item['paragraphs']
        if not isinstance(selected,list) or not selected or len(selected)>3:
            raise ValueError('Digest needs one to three complete paragraphs')
        if any(type(i) is not int or i<0 or i>=len(paragraphs[target]) for i in selected):
            raise ValueError('Digest paragraph does not exist')
        content = ''.join(paragraphs[target][i] for i in selected)
        if hashlib.sha256(content.encode()).hexdigest() != item.get('source_sha256'):
            raise ValueError('Digest source changed; review its conditions before updating')
        if re.search(r'\bid\s*=',content):
            raise ValueError('Digest must not duplicate source IDs')
        # Original paragraphs keep their conditions, emphasis and source links.
        content = visible_dates(content)
        cards.append('<article class="digest-item"><h3>'+esc(item['label'])+'</h3>'+content+'<a class="digest-link" href="#'+esc(target)+'">'+esc(item['link_label'])+' →</a></article>')
    return '<section id="guide-digest" class="guide-digest" aria-labelledby="guide-digest-title"><h2 id="guide-digest-title">まず確認すること</h2><div class="digest-grid">'+''.join(cards)+'</div></section>'
