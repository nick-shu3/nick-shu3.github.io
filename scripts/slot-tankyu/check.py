#!/usr/bin/env python3
"""Check generated editorial pages, local links, anchors and share assets."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from build import ROOT, SOURCE, BASE, build

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = []
        self.links = []
        self.meta = {}
        self.canonical = []
        self.h1 = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical.append(attrs.get('href'))
        for key in ('href', 'src'):
            if key in attrs:
                self.links.append(attrs[key])

def main():
    pages = {}
    for source in sorted(SOURCE.glob('*.json')):
        data = json.loads(source.read_text())
        file = ROOT / data['path']
        assert file not in pages, f'Duplicate output: {file}'
        text = file.read_text()
        assert text == build(data), f'Regenerate: {file}'
        page = Page(text)
        assert page.h1 == 1, f'Expected one h1: {file}'
        assert len(page.ids) == len(set(page.ids)), f'Duplicate id: {file}'
        for key in ('description', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card'):
            assert page.meta.get(key), f'Missing {key}: {file}'
        canonical = BASE + data['path'].removesuffix('index.html')
        assert page.meta['og:url'] == canonical, f'Wrong public URL: {file}'
        assert page.canonical == ['./'], f'Wrong canonical: {file}'
        share = page.meta['og:image'].removeprefix(BASE)
        blob = (ROOT / share).read_bytes()
        assert blob[:8] == b'\x89PNG\r\n\x1a\n', f'Expected PNG: {share}'
        assert tuple(int.from_bytes(blob[i:i+4], 'big') for i in (16,20)) == (1200,630), f'Wrong image size: {share}'
        pages[file] = page
    for file, page in pages.items():
        for href in page.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/') else file.parent / unquote(url.path)).resolve() if url.path else file
            if target.is_dir():
                target = target / 'index.html'
            assert target.is_relative_to(ROOT), f'Link outside repository: {href}'
            assert target.is_file(), f'Broken link: {file}: {href}'
            if url.fragment:
                linked = pages.get(target) or Page(target.read_text())
                assert unquote(url.fragment) in linked.ids, f'Broken anchor: {file}: {href}'
    print(f'PASS: {len(pages)} generated pages, links, anchors, metadata and share images')

if __name__ == '__main__':
    main()
