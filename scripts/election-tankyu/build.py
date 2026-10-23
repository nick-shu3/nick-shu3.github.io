"""Generate the public site from a public-safe catalog. Python standard library only."""
import argparse,copy,datetime,hashlib,html,json,math,pathlib,re,sys
if not __debug__:
 raise RuntimeError('Validation requires normal Python; -O is not supported.')
ROOT=pathlib.Path(__file__).resolve().parents[2]
CANONICAL=ROOT/'data/election-tankyu/catalog.json'
FULFILLMENT=['実現','一部実現','着手済み','未着手','判定保留']
STAGES=['検討','提案','法案提出','審議','成立','公布','一部施行','全面施行','未確認']
HOSTS={'www.jimin.jp','election2026.new-kokumin.jp','new-kokumin.jp','www.shugiin.go.jp','www.sangiin.go.jp','www.nta.go.jp','www.cas.go.jp','sanseito.jp','www.vill.kitanakagusuku.lg.jp','partsa.nikkei.com','o-ishin.jp'}
DIMENSIONS=['unit','entity','period','calendar','price_basis','population','region','revision','direction']
def digest(value):
 return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def fingerprint(p,kind,sources):
 original={k:p.get(k) for k in ['id','election_id','title','summary','original_quote','conditions','source_ids','metrics']}
 # An observation value must not change the original promise fingerprint.
 original['metrics']=(p.get('metrics') or {}).get('target')
 original['source_hashes']={sid:sources[sid].get('content_sha256') for sid in p['source_ids']}
 if kind=='original':return digest(original)
 related=set(p['related_source_ids'])|{sid for e in p['events']+p['involvements'] for sid in e.get('source_ids',[])}
 return digest(dict(original=digest(original),assessment=p['assessment'],events=p['events'],involvements=p['involvements'],actual=(p.get('metrics') or {}).get('actual'),source_hashes={sid:sources[sid].get('content_sha256') for sid in sorted(related)}))
def compare_metric(m):
 if not m or not m.get('target') or not m.get('actual'):return dict(eligible=False,reason='比較可能な承認済み実績値がありません。')
 a,b=m['target'],m['actual']
 mismatches=[k for k in DIMENSIONS if not a.get(k) or a.get(k) in ['未指定','未確認'] or a.get(k)!=b.get(k)]
 if mismatches:return dict(eligible=False,reason='比較条件の不一致・未確認：'+', '.join(mismatches))
 if any(not isinstance(x.get('value'),(float,int)) or isinstance(x.get('value'),bool) or not math.isfinite(x['value']) or x['value']<0 for x in [a,b]):return dict(eligible=False,reason='数値が欠損・不正です。')
 if a['direction'] not in ['increase','decrease']:return dict(eligible=False,reason='増加・削減の方向を確認できません。')
 target,actual=a['value'],b['value'];return dict(eligible=True,target=target,actual=actual,unit=a['unit'],difference=actual-target,threshold_met=actual>=target if a['direction']=='increase' else actual<=target,ratio=actual/target if target>0 and a['direction']=='increase' else None,reason='条件一致の数値比較。履行判定や因果効果とは別。')
def validate(d):
 from urllib.parse import urlparse
 assert d['internal'] is False,'internal catalog rejected'
 def scan(v):
  if isinstance(v,dict):
   for k,x in v.items():
    assert k not in {'review_targets','reviewer_id','human_attestation','ai_proposals','quarantined_legacy_claims','private'},'private key rejected: '+k
    scan(x)
  elif isinstance(v,list):
   for x in v:scan(x)
 scan(d)
 for kind in ['parties','sources','promises','elections','comparison_groups']:
  ids=[x['id'] for x in d[kind]];assert len(ids)==len(set(ids)),kind+' duplicate ID'
 sources={s['id']:s for s in d['sources']};parties={p['id'] for p in d['parties']};elections={x['id'] for x in d['elections']};groups={g['id'] for g in d['comparison_groups']}
 for s in sources.values():
  u=urlparse(s['url']);assert u.scheme=='https' and u.hostname in HOSTS and not u.username and not u.password,'source URL rejected'
  assert datetime.date.fromisoformat(s['retrieved_at'][:10])<=datetime.date.fromisoformat(d['as_of'])
  if s.get('published_at'):assert s['published_at'][:10]<=d['as_of'],'future source'
  if s.get('content_sha256'):assert re.fullmatch('[a-f0-9]{64}',s['content_sha256'])
 approvals=d.get('public_approvals',[])
 def approved(p,kind):
  return any(r.get('actor_type')=='human' and r.get('decision')=='approved' and r.get('entity_id')==p['id'] and r.get('entity_type')==kind and r.get('content_sha256')==fingerprint(p,kind,sources) for r in approvals)
 for p in d['promises']:
  assert re.fullmatch('P[0-9]{3,6}',p['id']) and p['party_id'] in parties and p['election_id'] in elections
  assert p['comparison_group'] in groups and p['source_ids'] and p['title'] and p['summary']
  for sid in p['source_ids']+p['related_source_ids']+[c['source_id'] for c in p['conditions']]:assert sid in sources,'missing source '+sid
  assert set(p['condition_ids'])=={c['id'] for c in p['conditions']}
  assert all(c['promise_id']==p['id'] for c in p['conditions'])
  assert p['assessment']['fulfillment'] in FULFILLMENT and p['assessment']['legislative_stage'] in STAGES
  assert p['assessment']['social_outcome'] in ['未評価','指標を確認','因果関係を含む評価資料あり']
  if p['original_human_approved']:assert approved(p,'original'),'missing/stale original approval'
  if p['assessment_approved']:
   assert approved(p,'assessment'),'missing/stale assessment approval'
   for e in p['events']+p['involvements']:
    assert e.get('human_approved') is True and e.get('source_ids') and all(s in sources for s in e['source_ids']),'claim approval/source required'
  else:
   assert not p['events'] and not p['involvements'],'unapproved claim in PUBLIC canonical catalog'
   assert p['assessment']['fulfillment']=='判定保留' and p['assessment']['legislative_stage']=='未確認' and p['assessment']['social_outcome']=='未評価','unapproved assessment in PUBLIC catalog'
   assert not (p.get('metrics') or {}).get('actual'),'unapproved actual in PUBLIC catalog'
 return d
def esc(s):return html.escape(str(s if s is not None else ''),quote=True)
def chip(text,cls=''):return f'<span class="chip {esc(cls)}">{esc(text)}</span>'
def original_label(p):
 if p['original_human_approved']:return '原文：人間承認済み'
 return {'ai_checked':'原文：AI照合済み・人間未承認','reproduction_checked':'転載原文：照合済み・公式原本待ち'}.get(p['original_verification'],'要約・原文照合待ち')
def fields(rows):return '<dl>'+''.join(f'<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k,v in rows)+'</dl>'
def render(d):
 validate(d);d=copy.deepcopy(d)
 for p in d['promises']:
  p['metric_result']=compare_metric(p.get('metrics')) if p['original_human_approved'] and p['assessment_approved'] else dict(eligible=False,reason='比較可能な承認済みの目標値と実績値がありません。')
 sources={s['id']:s for s in d['sources']};parties={p['id']:p for p in d['parties']};n=len(d['promises'])
 def source_link(sid):
  s=sources[sid];return f'<a href="{esc(s["url"])}" target="_blank" rel="noopener noreferrer">{esc(s["publisher"])}｜{esc(s["title"])} ↗</a>'
 def source_links(ids):return '<br>'.join(source_link(s) for s in dict.fromkeys(ids))
 def options(items):return ''.join(f'<option value="{esc(k)}">{esc(v)}</option>' for k,v in items)
 def select(name,label,items):return f'<div class="control"><label for="{name}">{label}</label><select id="{name}">{options(items)}</select></div>'
 def source_card(s):
  return f'<section class="source" id="source-{s["id"]}"><h3>{esc(s["id"])} · {esc(s["title"])}</h3>{chip({"retrieved":"本文取得・人間未承認","fetch_404":"今回の取得：404"}.get(s["fetch_status"],"今回の取得：失敗"))}<p>{source_link(s["id"])}</p>{fields([("資料区分",s["kind"]),("所在",s["locator"]),("公開日",s["published_at"] or "未確認"),("取得日時",s["retrieved_at"]),("資料の版",s.get("source_version") or "明示版なし・取得時点の内容")])}<p>{esc(s["verification_note"])}</p><details><summary>取得履歴とハッシュ</summary><p class="meta">{esc(s.get("content_sha256") or "今回の本文ハッシュなし")}<br>本文取得に成功した場合、取得応答全体のSHA-256です。内容の正確性や選挙当時の版との一致を保証しません。</p><ul>{"".join(f"<li>{esc(x['retrieved_at'])}：{esc(x['fetch_status'])}</li>" for x in s.get('observations',[]))}</ul></details></section>'
 def summary():
  rows=[]
  for party in d['parties']:
   ps=[p for p in d['promises'] if p['party_id']==party['id']];counts=[chip(f'{s} {sum(p["assessment"]["fulfillment"]==s for p in ps)}') for s in FULFILLMENT]
   rows.append(f'<section class="party"><h3>{esc(party["name"])}</h3><div class="number">{len(ps)}<small>件掲載</small></div>{fields([("公式原文のAI照合",str(sum(p["original_verification"]=="ai_checked" for p in ps))+"件"),("転載原文の照合",str(sum(p["original_verification"]=="reproduction_checked" for p in ps))+"件"),("原文の人間承認",str(sum(p["original_human_approved"] for p in ps))+"件"),("履行判定の人間承認",str(sum(p["assessment_approved"] for p in ps))+"件")])}<div class="chips">{"".join(counts)}</div><p class="meta">保留理由：人間審査待ち・実績資料の対応未確定。党全体の収集率は不明。</p><button class="action" data-party-select="{party["id"]}" aria-pressed="false">この党の公約を見る</button></section>')
  return '<div class="section-title"><h2>政党別サマリー</h2><span class="meta">掲載分全体の件数。検索条件には連動しません。</span></div><div class="partygrid">'+''.join(rows)+'</div>'
 def card(p):
  return f'<article class="card" data-id="{p["id"]}" data-party="{p["party_id"]}" data-topics="{esc("|".join(p["topics"]))}" data-status="{esc(p["assessment"]["fulfillment"])}"><p class="meta">{esc(parties[p["party_id"]]["name"])} · {esc(" / ".join(p["topics"]))} · {esc(p["type"])}</p><h3>{esc(p["title"])}</h3><div class="chips">{chip("履行："+p["assessment"]["fulfillment"],"pending")}{chip(original_label(p))}</div><p class="lead">{esc(p["summary"])}</p><p class="meta">対象：{esc(p["target_population"])} ／ 金額：{esc(p["amount"])}</p><p class="meta">期限：{esc(p["deadline"]["note"])}</p><div class="card-bottom"><a class="action" href="#promise/{p["id"]}">公約・根拠・未確認事項を見る</a><a href="{esc(sources[p["source_ids"][0]]["url"])}" target="_blank" rel="noopener noreferrer">選挙時の公約資料 ↗</a></div></article>'
 topics=list(dict.fromkeys(t for p in d['promises'] for t in p['topics']))
 controls='<div class="controls"><div class="control search"><label for="search">公約を検索</label><input id="search" type="search" maxlength="200" placeholder="例：消費税、子ども、電気"></div>'+select('party-filter','政党',[('all','すべて')]+[(p['id'],p['name']) for p in d['parties']])+select('topic-filter','分野',[('all','すべて')]+[(t,t) for t in topics])+select('status-filter','履行状況',[('all','すべて')]+[(s,s) for s in FULFILLMENT])+'<button class="action" id="reset">条件を解除</button></div>'
 listing=f'<div class="notice"><strong>限定サンプル：{len(parties)}政党・{n}具体策</strong><p>{esc(d["scope"])} 未収集は「公約なし」を意味しません。未承認の実績主張は掲載せず、履行判定は審査が済むまで保留します。</p><a href="#scope">収集範囲と選び方 →</a></div>'+summary()+'<h2 class="section-title">具体的な公約</h2>'+controls+f'<div class="results-head"><p id="count" role="status" aria-live="polite"></p><a href="#compare">同じ政策を比較する →</a></div><div id="cards">'+''.join(card(p) for p in d['promises'])+'</div>'
 def detail(p):
  a=p['assessment'];metric=p['metric_result'];m=p.get('metrics') or {};target=m.get('target');events='<ul class="timeline">'+''.join(f'<li><time>{esc(e["occurred_at"])}</time><h4>{esc(e["title"])}</h4><p>{esc(e["body"])}</p>{source_links(e["source_ids"])}</li>' for e in p['events'])+'</ul>' if p['events'] else '<p>承認済みの実績説明はまだありません。関連資料へのリンクから原資料を確認できます。</p>'
  states=''.join(f'<div class="state"><span>{k}</span><strong>{esc(v)}</strong></div>' for k,v in [('公約の履行',a['fulfillment']),('法律・制度の進捗',a['legislative_stage']),('社会的成果',a['social_outcome'])])
  known=f'<section class="panel"><h3>何を約束したか</h3><p>{esc(p["summary"])}</p><p class="meta">編集要約。原文と区別して表示しています。</p>{fields([("対象",p["target_population"]),("金額",p["amount"]),("期間",(str(p["duration"]["value"])+p["duration"]["unit"]+"。"+p["duration"]["meaning"]) if p.get("duration") else "明示された期間を確認できず"),("実現期限",p["deadline"]["note"])])}</section>'
  after=f'<section class="panel"><h3>その後どうなったか</h3><p>{esc(a["stage_note"])}</p><h4>何が未確認か</h4><ul class="unknown-list">'+''.join(f'<li>{esc(u)}</li>' for u in p['unknowns'])+'</ul></section>'
  numeric=(f'<p>数値目標：{esc(target["value"])}{esc(target["unit"])} ／ {esc(target["entity"])}・{esc(target["period"])}</p>' if target else '')
  numeric+=f'<p>目標 {esc(metric["target"])} ／ 実績 {esc(metric["actual"])} {esc(metric["unit"])}。差 {esc(metric["difference"])}。数値の閾値{ "到達" if metric["threshold_met"] else "未到達" }（履行判定とは別）。</p>' if metric['eligible'] else '<p class="meta">比較不可：'+esc(metric['reason'])+'</p>'
  if metric.get('ratio') is not None:numeric+=f'<p>同条件の目標に対する実績：{metric["ratio"]*100:.1f}%</p>'
  return f'<a href="#list">← 条件を保って公約一覧へ</a><article class="card" data-id="{p["id"]}"><p class="meta">{esc(parties[p["party_id"]]["name"])} / {p["id"]} / {esc(p["type"])}</p><h2>{esc(p["title"])}</h2><div class="facts">{known}{after}</div><div class="state-grid">{states}</div><p>{esc(a["reason"])}</p><h3>選挙時の公約原文</h3>{chip(original_label(p),"pending")}<blockquote class="quote">{esc(p["original_quote"] or "原文未確認。上の要約を参照してください。")}</blockquote><p class="meta">{esc(p["quote_scope"])}<br>所在：{esc(p["original_locator"])}<br>公約発表日：{esc(p["announcement_date"] or "未確認")} ／ {esc(p["version_note"])}</p>{source_links(p["source_ids"])}<h3>対象・条件</h3>{fields([(c["label"],c["value"]) for c in p["conditions"]])}<h3>選挙後の動き</h3>{events}<h3>目標と実績の数値比較</h3>{numeric}<h3>政策への関与</h3>{"".join("<p>"+esc(i["actor"])+"："+esc(i["action"])+"</p>" for i in p["involvements"]) or "<p>承認済みの関与記録はありません。関与と公約の履行は別の情報です。</p>"}<details><summary>判定・期限・用語の読み方</summary><p>法案提出＝法律にする案を出した段階。成立＝国会で法律として成立。公布＝成立した法律を公に示すこと。施行＝法律が効力を持つこと。</p><p>給付付き税額控除＝税額から差し引き、引ききれない分を給付する仕組み。インボイス＝消費税の仕入税額控除に関係する適格請求書です。再エネ賦課金＝再生可能エネルギーの買取費用の一部を電気利用者が負担する仕組みです。</p><p>撤回・変更：{esc(p["policy_change"]["note"])}<br>期限到来・変更・撤回は履行状態と独立して記録します。</p></details><h3>関連資料と取得状況</h3>{"".join(source_card(sources[s]) for s in dict.fromkeys(p["source_ids"]+p["related_source_ids"]))}</article>'
 templates={'list':listing,'sources':'<h2>出典台帳</h2><p>取得の成否と内容の承認は別です。404は資料の不存在を証明しません。転載資料と一次資料を区別します。</p>'+''.join(source_card(s) for s in d['sources'])}
 for p in d['promises']:templates[p['id']]=detail(p)
 for group in d['comparison_groups']:
  grid=''
  for party in d['parties']:
   ps=[p for p in d['promises'] if p['party_id']==party['id'] and p['comparison_group']==group['id']]
   items=''.join(f'<section class="compare-item"><h4>{esc(p["title"])}</h4><p>{esc(p["summary"])}</p>{fields([("約束した行為",p["type"]),("対象",p["target_population"]),("金額",p["amount"]),("期間",str(p["duration"]["value"])+p["duration"]["unit"] if p.get("duration") else "記載を確認できず"),("期限",p["deadline"]["note"]),("実施条件"," ／ ".join(c["value"] for c in p["conditions"] if c["required"])),("履行",p["assessment"]["fulfillment"]),("法律・制度",p["assessment"]["legislative_stage"]),("原文確認",original_label(p))])}{source_links(p["source_ids"])}<p><a href="#promise/{p["id"]}?from=compare/{group["id"]}">根拠と詳細 →</a></p></section>' for p in ps) or '<p class="meta">この限定サンプルでは未収集です。この党に該当公約がないという意味ではありません。</p>'
   grid+=f'<section class="compare-party"><h3>{esc(party["name"])}</h3>{items}</section>'
  templates['compare-'+group['id']]='<h2>政策別に、公約を比較する</h2><p>対象・行為・条件が異なる政策を並べます。同一の施策や金額とは限りません。順位や達成率は算出しません。</p><div class="controls">'+select('compare-group','比較する政策',[(g['id'],g['label']) for g in d['comparison_groups']])+f'</div><p class="meta">一覧の絞り込み条件とは独立した比較画面です。</p><div class="compare-grid">{grid}</div>'
 templates['scope']='<h2>収集範囲と選び方</h2>'+''.join(f'<section class="rule"><h3>{title}</h3><p>{esc(d["collection_policy"][key])}</p></section>' for key,title in [('basis','対象の選定'),('division','公約の分割単位'),('limitations','今回の限界')])
 templates['rules']='<h2>判定の読み方</h2><div class="rule-grid">'+''.join(f'<section class="rule"><h3>{k}</h3><p>{v}</p></section>' for k,v in [('未確認を未達成にしない','資料が見つからないだけでは未着手としません。期限前を未達成と判定しません。'),('5つの履行状態','実現・一部実現・着手済み・未着手・判定保留。確認範囲と承認の有無を別に示します。'),('法律の進捗は別の軸','検討・提案・法案提出・審議・成立・公布・一部施行・全面施行・未確認を区別。付託や案内ページだけで成立を認定しません。'),('成果と関与は別','制度の実施は政策効果の証明ではありません。複数政党の関与を単独の功績にしません。'),('数値の比較条件','個人と世帯、月と年、暦年と年度、名目と実質、対象地域、統計の版、増加と削減を照合。不一致・未確認なら比較不可とします。削減目標の単純な実績÷目標を達成率にしません。'),('原文・実績・判定の承認','原文のAI照合と人間承認を分けます。未承認の実績主張は掲載せず、公約の内容は残します。')])+'</div>'
 nav=''.join(f'<button data-page="{k}" type="button">{v}</button>' for k,v in [('list','公約一覧'),('compare','政策比較'),('sources','出典台帳'),('rules','判定の読み方'),('scope','収集範囲')])
 head='''<!doctype html><html lang="ja" class="standalone-pending"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="stylesheet" href="../security/standalone.css"><script src="../security/standalone.js"></script><link rel="stylesheet" href="style.css"><title>選挙探究 v0.7｜公約と根拠をたどる</title><meta name="description" content="生活に関係する政党公約を、対象・条件・根拠から比較する限定サンプル。履行判定と法律の進捗を分けて表示します。"></head><body><noscript>JavaScriptを有効にして、ブラウザで直接開いてください。</noscript><a class="skip" href="#main">本文へ移動</a>'''
 document=head+f'<header><div class="wrap"><div class="brand">選挙探究 <span class="version">v{esc(d["version"])}</span></div><h1>公約と根拠をたどる</h1><p>約束したこと、その後の動き、まだ分からないことを分けて確認します。</p><div class="hero-meta"><span>対象：{esc(d["elections"][0]["title"])}</span><span>投票日：{esc(d["elections"][0]["election_date"])}</span><span>基準日：{esc(d["as_of"])}</span></div></div></header><nav class="topnav" aria-label="主要メニュー"><div class="wrap" id="nav">{nav}</div></nav><main id="main" class="wrap"><div id="view" tabindex="-1"></div></main><footer><div class="wrap">{esc(d["scope"])}<br>党全体の達成率・順位は表示しません。公約の履行、法律の進捗、社会的成果、政党の関与は別の情報です。</div></footer>'
 document+=''.join(f'<template id="tpl-{k}">{v}</template>' for k,v in templates.items())+'<script src="app.js" defer></script></body></html>\n'
 return document,d
def build(catalog=CANONICAL,output=None,check=False):
 d=json.loads(pathlib.Path(catalog).read_text());document,public=render(d);out=pathlib.Path(output or ROOT/'docs/election-tankyu');out.mkdir(parents=True,exist_ok=True)
 files={'index.html':document,'data.json':json.dumps(public,ensure_ascii=False,indent=2)+'\n'}
 for name,content in files.items():
  if check:assert (out/name).read_text()==content,'generated file is stale: '+name
  else:(out/name).write_text(content)
 return files
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--catalog',default=str(CANONICAL));parser.add_argument('--output');parser.add_argument('--check',action='store_true');a=parser.parse_args()
 build(a.catalog,a.output,a.check);print('PASS: public catalog validated; generated views '+('match' if a.check else 'written'))
