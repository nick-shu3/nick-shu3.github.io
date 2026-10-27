#!/usr/bin/env python3
"""New SAO2 guide invariants. Static checks do not certify source facts or rendering."""
import hashlib, json, re, subprocess
from pathlib import Path
from html.parser import HTMLParser
from build import build, ROOT
BASE='81e10253b432899ef15d611390b75f30b6460cfb'
# Local maintenance candidates only. These pins bound the authorized source
# changes. Content review is recorded separately; pins do not certify rendering.
# Any edited candidate must be re-reviewed before updating its exact pin.
MAINTENANCE_PAGE_CANDIDATES={
    'guide-tokyo.json':'0736527e18fd7988a66a758bf792a9626bc8c2af60e286e51dfa457382bfa471',
    'guide-lycoris.json':'398d4d850f9e21fc01842966c1b039a8f0d81a309d172721a0199f8d95f26dc7',
    'guide-tako.json':'442b157e07d2e02ddbd2ed5d58ffbdaadd25a7a18289de9a420f65a031faa767',
    'new-machines.json':'37b0b9f404526fde655c72335342d2f1f4f23753f64f7adb4f01e05a7470cd18',
}
class Cells(HTMLParser):
    def __init__(self,body):
        super().__init__();self.values=[];self.cell=None;self.feed(body)
    def handle_starttag(self,tag,attrs):
        if tag in ('th','td'):self.cell=[]
    def handle_data(self,s):
        if self.cell is not None:self.cell.append(s)
    def handle_endtag(self,tag):
        if tag in ('th','td') and self.cell is not None:self.values.append(''.join(self.cell));self.cell=None

def check_sao2(page):
    assert page['type']=='guide' and page['machine_slug']=='sao2'
    assert page['path']=='docs/slot-tankyu/machines/sao2/index.html'
    assert not page.get('author_comment') and not page.get('author_excerpt')
    body=page['body'];rendered=build(page);cells=Cells(body).values
    for i,cz,at,b in [(1,'238.4','386.2','1057.0'),(2,'232.3','364.3','993.0'),(3,'232.7','368.1','936.2'),(4,'218.9','326.8','885.6'),(5,'225.2','340.6','840.2'),(6,'191.7','269.6','799.2')]:
        row=[str(i),'1/'+cz,'1/'+at,'1/'+b]
        assert any(cells[n:n+4]==row for n in range(len(cells)))
    assert all(s in body for s in ['設定5以上のチャンス','設定5以上確定とは扱いません','50Gを過ぎれば一律にやめてよい','初回の上位CZ','256G＋α','実ゲーム数','液晶ゲーム数','シミュレーション値','途中昇格を含まない','過去の搭載機種からの予想'])
    # Regression guards for v2: rates remain tied to their own table and denominator.
    for anchor, values in {
        'direct': ['18091.8','14160.5','14390.8','8498.0','4723.3','3415.7'],
        'the-end': ['20177.5','17579.1','17586.3','13784.5','11459.0','7077.2'],
        'ggo': ['10.2%','10.5%','10.9%','11.7%','12.5%','25.0%'],
        'cz-failure': ['20.3%','21.1%','21.9%','22.7%','25.0%','30.1%'],
    }.items():
        section=body.split('id="'+anchor+'"',1)[1].split('</section>',1)[0]
        for value in values:assert value in section,(anchor,value)
    for condition in ['上位AT経由の上位CZ失敗は対象外','レア役成立時','通常ゲーム数','総ゲーム数',
                      'AT間天井','ロングフリーズ','ウルティマ・チェリー','契機不明',
                      '高確率でスタートした場合','キリト非滞在時','設定2〜5の値は補いません',
                      '4/22回・6/39回・3/50回','23件・41件・52件','設定2〜4の穴埋め',
                      '解析値が揃っていない参考','未カウントと']:
        assert condition in body,condition
    mini=body.split('id="mini"',1)[1].split('</section>',1)[0]
    assert mini.count('<tr>')==9 and '詩乃</th><td>ユイ</td><td>設定4以上濃厚' in mini
    assert 'theme-sao2' in rendered
    assert rendered.index('id="guide-digest"')<rendered.index('id="screens"')
    assert 'id="author-comment"' not in rendered and '<img ' not in body
    for path in ['AGENTS.md','SECURITY.md','.github/workflows/pages.yml','package.json','package-lock.json','docs/security/standalone.js','docs/security/standalone.css']:
        assert (ROOT/path).read_bytes()==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),path
    # All pre-existing article source objects stay identical except the authorized home entry.
    paths=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'scripts/slot-tankyu/pages'],cwd=ROOT,text=True).splitlines()
    for path in paths:
        if path.endswith('/home.json'):continue
        name=Path(path).name
        if name in MAINTENANCE_PAGE_CANDIDATES:
            assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==MAINTENANCE_PAGE_CANDIDATES[name],path
            continue
        if path.endswith('/league-4th.json'):
            # Reproduce the page at the current presentation as_of date. The
            # dated view may change; schedule facts must match the reviewed edition.
            from league_schedule import render
            current=json.loads((ROOT/path).read_text())
            data_path='scripts/slot-tankyu/data/league-4th.json'
            data=json.loads((ROOT/data_path).read_text())
            assert current==render(data),path
            # Reviewed official schedule edition; facts checked independently.
            assert hashlib.sha256((ROOT/data_path).read_bytes()).hexdigest()=='4e711d17703e2ca092b0e727619e9d4c231962f4ff5d28f77ade99d6c5575d18','Unreviewed schedule edition'
            continue
        if path.endswith('/watch-listing.json'):
            old=json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
            current=json.loads((ROOT/path).read_text())
            reviewed=json.loads(subprocess.check_output(['git','show','cf01a7bdd0996a1d79487a38c4a7adb8e8949407:'+path],cwd=ROOT))
            dstation=r'<a class="card report-card" href="dstation-heroes-rally/">.*?</a>'
            assert len(re.findall(dstation,current['body']))==1
            current['body']=re.sub(dstation,'',current['body'])
            assert current['updated']=='2026年10月28日'
            current['updated']='2026年10月25日'
            armada=r'<a class="card report-card" href="armada-dynam-rally/">.*?</a>'
            assert len(re.findall(armada,current['body']))==1
            current['body']=re.sub(armada,'',current['body'])
            assert current['updated']=='2026年10月25日'
            current['updated']='2026年10月22日'
            addition=r'<a class="card report-card" href="123-entertainers-rally/">.*?</a>'
            assert len(re.findall(addition,current['body']))==1
            current['body']=re.sub(addition,'',current['body'])
            garden=r'<a class="card report-card" href="garden-united-rally/">.*?</a>'
            assert len(re.findall(garden,current['body']))==1
            current['body']=re.sub(garden,'',current['body'])
            assert current['updated']=='2026年10月22日'
            current['updated']=reviewed['updated']
            assert current==reviewed,path
            card=r'<a class="card report-card" href="tengai-golden-manes-rally/">.*?</a>'
            assert len(re.findall(card,current['body']))==1
            current['body']=re.sub(card,'',current['body'])
            assert current['updated']=='2026年10月18日'
            current['updated']=old['updated']
            assert current==old,path
            continue
        if path.endswith('/listing.json'):
            old=json.loads(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT))
            current=json.loads((ROOT/path).read_text())
            # Preserve the older listing after removing this reviewed addition.
            jashin=r'<a class="card" href="2026-10-25/jashinchan/">.*?</a>'
            assert len(re.findall(jashin,current['body']))==1
            current['body']=re.sub(jashin,'',current['body'])
            assert current['updated']=='2026年10月25日'
            current['updated']='2026年10月19日'
            # Only the reviewed 2026-10-19 card and listing date may be added.
            tokyo=r'<a class="card tone-ghoul" href="2026-10-19/tokyo-ghoul/">.*?</a>'
            assert len(re.findall(tokyo,current['body']))==1
            current['body']=re.sub(tokyo,'',current['body'])
            card=r'<a class="card tone-sao2" href="2026-10-17/sao2/">.*?</a>'
            assert len(re.findall(card,current['body']))==1
            current['body']=re.sub(card,'',current['body'])
            shinuchi=r'<a class="card" href="2026-10-18/shinuchi-yoshimune/">.*?</a>'
            assert len(re.findall(shinuchi,current['body']))==1
            current['body']=re.sub(shinuchi,'',current['body'])
            assert current['updated']=='2026年10月19日'
            current['updated']=old['updated']
            assert current==old,path
            continue
        assert (ROOT/path).read_bytes()==subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT),path
if __name__=='__main__':
    check_sao2(json.loads((Path(__file__).parent/'pages/guide-sao2.json').read_text()))
    print('PASS: SAO2 source conditions, six-setting rows, no fabricated photos/comments, original articles and security controls preserved. Browser QA NOT performed.')
