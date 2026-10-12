#!/usr/bin/env python3
"""Build the static Slot Tankyu pages from reviewed editorial JSON. No dependencies."""
import html,json,posixpath,re
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
    # Content is curated static markup, never runtime user input. Reject active markup.
    if re.search(r'<\s*(script|iframe|object|embed|form)\b|\bon\w+\s*=|javascript\s*:',body,re.I):raise ValueError('Active content in editorial source')
    guard=relative('docs/security',path)
    css=relative('docs/slot-tankyu/assets/editorial.css',path)
    share=page.get('share_image','share-'+page['type']+'.png')
    if not re.fullmatch(r'[a-z0-9-]+\.png',share):raise ValueError('Invalid share image')
    canonical=BASE+path.removesuffix('index.html')
    top=relative('docs/slot-tankyu/index.html',path)
    records=relative('docs/slot-tankyu/records/index.html',path)
    about=relative('docs/slot-tankyu/about/index.html',path)
    crumbs='<nav class="breadcrumbs" aria-label="パンくず"><a href="'+esc(top)+'">スロ探究</a>'
    for crumb in page.get('breadcrumbs',[]):crumbs+=' <span>／</span> <a href="'+esc(relative(crumb['path'],path))+'">'+esc(crumb['title'])+'</a>'
    crumbs+=' <span>／</span> <span>'+esc(page.get('short_title',page['title']))+'</span></nav>'
    toc=''
    if page.get('toc'):toc='<nav class="toc" aria-label="ページ内目次">'+''.join('<a href="#'+esc(x['id'])+'">'+esc(x['label'])+'</a>' for x in page['toc'])+'</nav>'
    title=esc(page['title']+'｜スロ探究');desc=esc(page['description'])
    verification=''
    if 'google_site_verification' in page:
        value=page['google_site_verification']
        if path!='docs/slot-tankyu/index.html' or not isinstance(value,str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}',value):raise ValueError('Invalid site verification value')
        verification='<meta name="google-site-verification" content="'+esc(value)+'">'
    return f'''<!doctype html>
<html lang="ja" class="standalone-pending"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="Content-Security-Policy" content="{CSP}"><link rel="stylesheet" href="{guard}/standalone.css?v=1"><script src="{guard}/standalone.js?v=1"></script><link rel="stylesheet" href="{css}">{verification}<title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="./"><meta property="og:type" content="{'article' if page['type']=='record' else 'website'}"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canonical}"><meta property="og:site_name" content="スロ探究"><meta property="og:image" content="{BASE+'docs/slot-tankyu/assets/'+share}"><meta name="twitter:card" content="summary_large_image"></head><body><noscript>JavaScriptを有効にして、ブラウザで直接開いてください。</noscript><header class="site-header"><a class="brand" href="{top}">スロ<span>探究</span></a><nav aria-label="サイト内目次"><a href="{top}#guides">機種ガイド</a><a href="{records}">実戦記録</a><a href="{about}">編集方針</a></nav></header><main>{crumbs}<div class="hero"><p class="eyebrow">{esc(page['label'])}</p><h1>{esc(page['title'])}</h1><p class="lead">{esc(page['description'])}</p><div class="meta"><span>{esc(page['status'])}</span><span>最終更新：{esc(page['updated'])}</span></div></div>{toc}{body}</main><footer><p>スロ探究 by シュウ３／非公式の個人研究サイト</p><p><a href="{about}">根拠の扱い・編集方針</a> ｜ <a href="{records}">実戦記録</a></p></footer></body></html>'''

def main():
    for source in sorted(SOURCE.glob('*.json')):
        page=json.loads(source.read_text());target=ROOT/page['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_text(build(page))
        print(page['path'])
if __name__=='__main__':main()
