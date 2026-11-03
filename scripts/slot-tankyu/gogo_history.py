"""Render the author's reconciled 62-bonus record as static escaped HTML."""
import html
import json
from pathlib import Path

DATA = Path(__file__).parent / 'data/record-gogo-20261103-history.json'

def bonus_history(data=None):
    if data is None:
        data = json.loads(DATA.read_text(encoding='utf-8'))
    events = data['events']
    if [x['number'] for x in events] != list(range(1, 63)):
        raise ValueError('大当たり番号の欠番・重複')
    if sum(x['kind']=='BIG' for x in events)!=36 or sum(x['kind']=='REG' for x in events)!=26:
        raise ValueError('BIG・REG件数が本人確定集計と不一致')
    previous='';rows=[]
    for x in events:
        if type(x['game']) is not int or not 0<=x['game']<=7908:
            raise ValueError('当選ゲーム数が不正')
        time=x['time']
        if len(time)!=5 or time[2]!=':' or not time.replace(':','').isdigit() or not 0<=int(time[:2])<24 or not 0<=int(time[3:])<60 or time<previous:
            raise ValueError('履歴時刻が不正・順序逆転')
        previous=time
        if (x['kind']=='BIG' and x['coins']!=240) or (x['kind']=='REG' and x['coins'] not in [96,97]):
            raise ValueError('表示出玉が不正')
        trigger=x['trigger'] or '契機不明'
        note=trigger+'・'+str(x['coins'])+'枚'
        if x['note']:note+='／'+x['note']
        rows.append('<tr><th scope="row">'+str(x['number'])+'回目</th><td>'+html.escape(time)+'</td><td>'+str(x['game'])+'G</td><td>'+x['kind']+'</td><td>'+html.escape(note)+'</td></tr>')
    return '<section id="bonus-history"><h2>大当たり履歴・全62回</h2><p>当選G数・時刻・種別・出玉は、本人が再取得して提示した履歴に合わせました。成立契機と演出は実戦中の本人メモを対応付けています。BIG36回・REG26回で、最終集計と一致しました。</p><p>不足していた16:09の34G・BIGは33回目の大当たりです。成立契機は未確認のまま残しています。レアチェリーの「疑い」も確定に置き換えていません。</p><details><summary>全62回の履歴を開く（古い順）</summary><p class="hint">表は横にスクロールできます。「出玉」は履歴に表示された各ボーナスの枚数で、実戦回収1,976枚とは別の指標です。</p><div class="tablewrap"><table style="min-width:36rem"><caption>2026年11月3日・697番台／本人提示履歴と実戦メモの突合</caption><thead><tr><th scope="col">回数</th><th scope="col">時刻</th><th scope="col">当選G数</th><th scope="col">種別</th><th scope="col">成立契機・表示出玉・備考</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div></details><p class="hint">62回の当選間G数の合計は7,797G。最終総ゲーム数7,908Gとの差は111Gありますが、集計条件や最終当選後の消化G数との対応は未確認のため、111Gヤメと確定していません。</p></section>'
