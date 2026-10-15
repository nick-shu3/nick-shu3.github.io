#!/usr/bin/env python3
"""Build the static Slot Tankyu pages from reviewed editorial JSON. No dependencies."""
import hashlib,html,json,posixpath,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path(__file__).parent/'pages'
CSP="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
BASE='https://nick-shu3.github.io/'
def esc(value):return html.escape(str(value),quote=True)
def relative(target,page):return posixpath.relpath(target,posixpath.dirname(page))
def build(page):
    path=page['path']
    if not path.startswith('docs/slot-tankyu/') or '..' in path.split('/') or not path.endswith('/index.html'):raise ValueError('Invalid page path')
    body=page['body']
    # Optional first-person comments are plain text, escaped at build time.
    comment=page.get('author_comment',[])
    if not isinstance(comment,list) or any(not isinstance(x,str) or not x.strip() for x in comment):
        raise ValueError('Author comment must contain nonempty plain-text paragraphs')
    toc_items=list(page.get('toc',[]))
    if comment:
        if re.search(r'\bid=[\"\']author-comment[\"\']',body):raise ValueError('Duplicate author comment section')
        section='<section id="author-comment" class="panel" aria-labelledby="author-comment-title"><h2 id="author-comment-title">シュウ３のコメント</h2><blockquote style="margin:0">'+''.join('<p>'+esc(x)+'</p>' for x in comment)+'</blockquote></section>'
        source_section=re.search(r'<section\b[^>]*\bid="sources"[^>]*>',body)
        if source_section:body=body[:source_section.start()]+section+body[source_section.start():]
        else:body+=section
        item={'id':'author-comment','label':'シュウ３のコメント'}
        source_index=next((i for i,x in enumerate(toc_items) if x['id']=='sources'),len(toc_items))
        toc_items.insert(source_index,item)
    # Content is curated static markup, never runtime user input. Reject active markup.
    if re.search(r'<\s*(script|iframe|object|embed|form)\b|\bon\w+\s*=|javascript\s*:',body,re.I):raise ValueError('Active content in editorial source')
    # Curated local photographs open at full size using ordinary browser navigation.
    # No image viewer scripts, remote requests or runtime HTML parsing are needed.
    def enlarge_photo(match):
        visual=match[2]
        source=re.search(r'<img\b[^>]*\bsrc="([^"]+)"',visual)
        if not source or '<a ' in visual:return match[0]
        href=source[1]
        if not re.fullmatch(r'(?:\.\./)*assets/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)',href):raise ValueError('Invalid local photo path')
        return match[1]+'<a class="photo-enlarge" href="'+esc(href)+'" aria-label="写真を大きく表示">'+visual+'<span class="photo-enlarge-label">タップして拡大 ↗</span></a>'+match[3]
    body=re.sub(r'(<figure\b[^>]*>)(.*?)(<figcaption\b[^>]*>)',enlarge_photo,body,flags=re.S)
    guard=relative('docs/security',path)
    css=relative('docs/slot-tankyu/assets/editorial.css',path)+'?v='+hashlib.sha256((ROOT/'docs/slot-tankyu/assets/editorial.css').read_bytes()).hexdigest()[:12]
    share=page.get('share_image','share-'+page['type']+'.png')
    if not re.fullmatch(r'[a-z0-9-]+\.png',share):raise ValueError('Invalid share image')
    canonical=BASE+path.removesuffix('index.html')
    top=relative('docs/slot-tankyu/index.html',path)
    records=relative('docs/slot-tankyu/records/index.html',path)
    about=relative('docs/slot-tankyu/about/index.html',path)
    league=relative('docs/slot-tankyu/league/777league/index.html',path)
    new_machines=relative('docs/slot-tankyu/new-machines/index.html',path)
    news=relative('docs/slot-tankyu/news/index.html',path)
    watch=relative('docs/slot-tankyu/watch/index.html',path)
    crumbs='<nav class="breadcrumbs" aria-label="パンくず"><a href="'+esc(top)+'">スロ探究</a>'
    for crumb in page.get('breadcrumbs',[]):crumbs+=' <span>／</span> <a href="'+esc(relative(crumb['path'],path))+'">'+esc(crumb['title'])+'</a>'
    crumbs+=' <span>／</span> <span>'+esc(page.get('short_title',page['title']))+'</span></nav>'
    toc=''
    if toc_items and page['type']!='home':toc='<nav class="toc" aria-label="ページ内目次">'+''.join('<a href="#'+esc(x['id'])+'">'+esc(x['label'])+'</a>' for x in toc_items)+'</nav>'
    themes={'tokyo-ghoul':'ghoul','lycoris-recoil':'lycoris','takoslot':'tako'}
    theme=next((v for k,v in themes.items() if k in path.split('/')),'home' if page['type']=='home' else 'general')
    hero_title=esc(page['title'])
    home_visual=''
    hero_actions=''
    if page['type']=='home':
        hero_title=hero_title.replace('。','。<br>',1)
        photo=relative('docs/slot-tankyu/assets/records/2025-03-02/tokyo-ghoul/remaining-1792.jpg',path)
        record=relative('docs/slot-tankyu/records/2025-03-02/tokyo-ghoul/index.html',path)
        home_visual=f'<a class="hero-visual" href="{record}"><img src="{photo}" width="800" height="600" alt="東京喰種の実戦で残り1,792枚を表示した液晶"><span class="photo-label">実戦の一枚</span><span class="photo-caption"><small>東京喰種 / 2025.03.02</small><strong>赫眼70G。その先の初完走。</strong><span>実戦記事を読む ↗</span></span></a>'
        hero_actions='<nav class="home-entries" aria-label="読みたい内容から選ぶ">'+''.join('<a href="'+esc(href)+'"><strong>'+esc(label)+' <span aria-hidden="true">→</span></strong><small>'+esc(description)+'</small></a>' for href,label,description in [('#guides','機種ガイド','終了画面・設定示唆の意味'),(records,'実戦記録','機種ごとの結果・写真・振り返り'),(new_machines,'新台カレンダー','導入予定日と機種を確認'),(news,'業界ニュース','稼働動向・メーカーの動き'),(league,'777リーグ','収録日と動画の公開状況'),(watch,'スロ番組ウォッチ','動画の見どころと率直な感想')])+'</nav>'
    title=esc(page['title']+'｜スロ探究');desc=esc(page['description'])
    verification=''
    if 'google_site_verification' in page:
        value=page['google_site_verification']
        if path!='docs/slot-tankyu/index.html' or not isinstance(value,str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}',value):raise ValueError('Invalid site verification value')
        verification='<meta name="google-site-verification" content="'+esc(value)+'">'
    return f'''<!doctype html>
<html lang="ja" class="standalone-pending"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="{CSP}"><link rel="stylesheet" href="{guard}/standalone.css?v=1"><script src="{guard}/standalone.js?v=1"></script><link rel="stylesheet" href="{css}">{verification}<title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="./"><meta property="og:type" content="{'article' if page['type'] in ('record','watch') and path!='docs/slot-tankyu/watch/index.html' else 'website'}"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canonical}"><meta property="og:site_name" content="スロ探究"><meta property="og:image" content="{BASE+'docs/slot-tankyu/assets/'+share}"><meta name="twitter:card" content="summary_large_image"></head><body class="page-{esc(page['type'])} theme-{theme}"><noscript>JavaScriptを有効にして、ブラウザで直接開いてください。</noscript><header class="site-header"><a class="brand" href="{top}"><span class="brand-symbol" aria-hidden="true">探</span><span class="brand-text">スロ<span>探究</span><small>SLOT TANKYU</small></span></a><nav aria-label="サイト内目次"><a href="{top}#guides">機種ガイド</a><a href="{records}">実戦記録</a><a href="{league}">777リーグ</a><a href="{new_machines}">新台</a><a href="{news}">ニュース</a><a href="{watch}">番組</a><a href="{about}">編集方針</a></nav></header><main>{crumbs}<div class="hero"><div class="hero-copy"><p class="eyebrow">{esc(page['label'])}</p><h1>{hero_title}</h1><p class="lead">{esc(page['description'])}</p><div class="meta"><span>{esc(page['status'])}</span><span>最終更新：{esc(page['updated'])}</span></div>{hero_actions}</div>{home_visual}</div>{toc}{body}</main><footer><p>スロ探究 by シュウ３／非公式の個人研究サイト</p><p><a href="{about}">根拠の扱い・編集方針</a> ｜ <a href="{records}">実戦記録</a></p></footer></body></html>'''

def main():
    for source in sorted(SOURCE.glob('*.json')):
        page=json.loads(source.read_text());target=ROOT/page['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_text(build(page))
        print(page['path'])
if __name__=='__main__':main()
