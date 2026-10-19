"""Render the explicitly confirmed AT dataset, independently of live journals."""
import html
import json
from pathlib import Path

DATA=Path(__file__).parent/'data/record-tokyo-20261019-confirmed.json'

def confirmed_history():
    data=json.loads(DATA.read_text());ats=data['ats']
    if [a['atNumber'] for a in ats]!=list(range(1,19)):raise ValueError('AT番号の欠番・重複')
    total=0;rows=[]
    for a in ats:
        n=a['atNumber'];coins=a['atCoins'];basis=a['coinBasis'];prev=a['returnFrom']
        kind='return' if prev else 'upper' if '上位CZ' in a['trigger'] else 'direct' if '直撃' in a['trigger'] else 'normal'
        if basis=='cumulative':
            if prev!=n-1 or coins<ats[prev-1]['atCoins']:raise ValueError('引き戻し累計の不整合')
            increment=coins-ats[prev-1]['atCoins']
        elif basis=='single' and prev is None:increment=coins
        else:raise ValueError('獲得枚数の集計基準不明')
        total+=increment
        note=a['endScreen']+('・ブロンズトロフィー' if a['trophy']=='bronze' else '')+('・'+a['notes'] if a['notes'] else '')
        highlight=' class="at-setting"' if '設定' in note or a['trophy'] else ''
        e=html.escape
        rows.append(f'<tr><th scope="row">{n}回目</th><td>{a["game"]}G</td><td><span class="at-kind at-{kind}">{e(a["trigger"])}</span></td><td>{coins:,}枚'+('※' if prev else '')+f'</td><td{highlight}>{e(note)}</td></tr>')
    if total!=8480:raise ValueError('AT重複除外合計が期待値と不一致')
    return '<section id="at-history"><h2>AT当選履歴・獲得枚数・終了画面</h2><p>本人が補正・確定したAT18回の記録です。引き戻し3回も、それぞれAT当選1回として数えています。リプレイ直撃は本人の実戦上の確定記録で、外部解析上の内部抽選を証明するものではありません。</p><p class="hint">表は横にスクロールできます。設定示唆は太字で表示。画面の示唆は解析媒体の説明によるもので、店舗公表の実設定とは分けています。<a href="#src-N">［終了画面］</a> <a href="#src-H">［トロフィー］</a></p><div class="tablewrap"><table class="at-history"><caption>AT18回の確定補正版</caption><thead><tr><th scope="col">AT</th><th scope="col">当選G数</th><th scope="col">当選契機</th><th scope="col">獲得表示</th><th scope="col">終了画面・備考</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div><p class="hint">※8回目・14回目・17回目は直前ATから引き継いだ累計表示。単独獲得として足しません。7回目の198枚→8回目の322枚は＋124枚、13回目の241枚→14回目の355枚は＋114枚、16回目の1,068枚→17回目の1,269枚は＋201枚です。</p><p><strong>重複を除いたAT獲得枚数の合計は8,480枚。</strong>これはAT区間の獲得表示を集計した指標で、実戦回収2,589枚・投資1,610枚・最終差枚＋979枚とは別です。</p></section><section id="cz-summary"><h2>CZ・ATの最終集計</h2><div class="tablewrap"><table><thead><tr><th scope="col">区分</th><th scope="col">回数</th><th scope="col">成功／失敗</th><th scope="col">成功率</th></tr></thead><tbody><tr><th scope="row">通常CZ</th><td>19回</td><td>10回／9回</td><td>52.6%</td></tr><tr><th scope="row">上位CZ</th><td>4回</td><td>4回／0回</td><td>100%</td></tr><tr><th scope="row">CZ全体</th><td>23回</td><td>14回／9回</td><td>60.9%</td></tr></tbody></table></div><p>AT当選は通常CZ10回＋上位CZ4回＋リプレイ直撃1回＋引き戻し3回＝18回。CZ23件・直撃1件・引き戻し3件の全27イベントに対応します。通常時G数は不明のため、総7,715Gを分母にした初当たり確率は算出していません。</p></section>'
