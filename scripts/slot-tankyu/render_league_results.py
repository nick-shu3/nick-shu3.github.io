#!/usr/bin/env python3
"""Render a dated, manually verified league-results snapshot."""
import html,json,datetime
from pathlib import Path
HERE=Path(__file__).resolve().parent

def render(data):
    date=datetime.date.fromisoformat(data['as_of']); label=f"{date.year}年{date.month}月{date.day}日"
    if not data['source_url'].startswith('https://'):raise ValueError('HTTPS source required')
    if len(data['red'])!=4 or len(data['blue'])!=4:raise ValueError('Expected four teams per league')
    def points(x):return (f'+{x:,}' if x>0 else f'{x:,}')+'pt'
    def safe(x):return html.escape(str(x),quote=True)
    def rows(items,player=False):
        return ''.join('<tr><th scope="row">'+str(x['rank'])+'位</th><td>'+safe(x['player'] if player else x['team'])+'</td><td>'+points(x['player_avg_pt'] if player else x['team_pt'])+'</td></tr>' for x in items)
    def table(title,first,items,player=False,point_header=None):
        label=point_header or ('平均差枚数pt' if player else 'チーム累計')
        cards=[]
        for x in items:
            name=safe(x['player'] if player else x['team'])
            value=points(x['player_avg_pt'] if player else x['team_pt'])
            extra=(' ／ Total：'+points(x['player_total_pt'])) if player else ''
            cards.append('<li style="border:1px solid #4b5d6b;border-radius:8px;padding:14px 16px;background:#17232e;"><strong>'+str(x['rank'])+'位｜'+name+'</strong><br><span>'+label+'：<strong>'+value+'</strong>'+extra+'</span></li>')
        return '<div role="region" aria-label="'+title+'"><ul style="list-style:none;padding:0;display:grid;gap:10px;">'+''.join(cards)+'</ul></div>'
    body='<aside class="notice" role="note" style="border:2px solid #efc18e;border-left:6px solid #efc18e;border-radius:10px;background:#33291d;"><strong>⚠ 実戦結果のネタバレがあります</strong><p>試合結果・順位・ポイントを掲載しています。動画を先に見たい方は<a href="../../watch/777league-4th-red1/#video">RED第1回戦の動画</a>へ。</p></aside>'
    body+='<section id="overview"><h2>掲載している成績</h2><p>777リーグ4thの成績を、REDは公式サイトの画面、BLUEは第1回戦後の動画画面をもとに整理しました。</p><p><strong>REDなどの公式サイト画面の表示基準：'+label+'現在。</strong> これは自動更新ではありません。最新の順位は<a href="'+safe(data['source_url'])+'" target="_blank" rel="noopener noreferrer">公式の実戦結果・成績 ↗</a>もご確認ください。</p><p class="hint">公式画面には、実戦の獲得ptに順位pt・ホームptなどが含まれると記載されています。選手の差枚数ptとは別の数字です。</p></section>'
    body+='<aside class="notice" role="note"><strong>最新ポイントは確認待ちです（2026年11月8日再確認）</strong><p>今回取得できた公式ページ本文では順位表の数値を確認できませんでした。REDの成績は11月4日の公式画面、BLUEは動画内の第1回戦後の画面に基づきます。いずれも現在の成績を表すものではありません。空欄や「－」を0pt・未実施とは判断していません。</p><p><a href="../../watch/777league-4th-blue1/">BLUE第1回戦の視聴メモ・前後編動画を見る →</a>（結果のネタバレあり）</p></aside>'
    body+='<section id="red"><h2>REDリーグ｜チーム順位</h2><p>11月4日の公式画面で確認した、RED第1回戦の結果を反映したチーム累計です。</p>'+table('REDリーグ・チーム順位','チーム',data['red'])+'</section>'
    body+='<section id="blue"><span id="blue-video"></span><h2>BLUEリーグ｜第1回戦終了時の順位</h2><p>本人提供の動画画面に表示された第1回戦時点のランキングです。現在の順位を示すものではありません。</p><ol><li>アルマダイナム：+402pt</li><li>フェイスメガタイガース：−191pt</li><li>ガーデンユナイテッド：−1,550pt</li><li>D’ステーションヒーローズ：−4,700pt</li></ol><p class="hint">同じ動画の第1回戦獲得ポイント画面ではガーデンユナイテッド（司芭扶）のTotalは−1,500ptと表示されています。50ptの差の理由は未確認のため、各画面の表示をそのまま区別して記載しています。</p><p><a href="../../watch/777league-4th-blue1/#points">選手別の獲得ポイント内訳 →</a></p></section>'
    body+='<section id="battle"><h2>RED第1回戦｜チーム獲得ポイント</h2><p>順位・ホームのポイントなどを含む、その試合のチーム獲得ptです。今回の公式画面では、REDのチーム累計と同じ値でした。</p>'+table('RED第1回戦のチーム獲得pt','チーム',data['battle_red1'],point_header='獲得pt')+'<p><a href="../../watch/777league-4th-red1/">試合の視聴メモ・前後編動画を見る →</a></p></section>'
    body+='<section id="players"><h2>選手の差枚数ポイント</h2><p>公式画面に掲載された個人ランキングの「平均差枚数pt」と「Total差枚数pt」です。画像で確認できた4人の数値を掲載しています。</p><p class="hint">チーム獲得ptとは計算の対象が異なります。</p>'+table('個人ランキング｜平均差枚数pt（4選手）','選手',data['players'],True)+'<p>画像に写っていない選手の順位・値は掲載していません。</p></section>'
    body+='<section id="source"><h2>出典・確認範囲</h2><p>本人が提供した公式サイトのスクリーンショットに表示された2026年11月4日現在のチーム順位、RED第1回戦と個人ランキングを転記しました。11月4日の転記時は公式ページの本文をこの環境から直接取得できなかったため、その時点では画像以外の数値を確認していません。</p><p>11月4日時点の公式サイト画面では、BLUE第1回戦の一部チームの実戦結果として「－」が表示され、残りは画像外です。これらを0ptの実戦結果や試合未実施と断定していません。</p><p><a href="'+safe(data['source_url'])+'" target="_blank" rel="noopener noreferrer">777リーグ公式｜実戦結果・成績 ↗</a> ／ <a href="../777league/">収録日程へ戻る →</a></p></section>'
    return {'path':'docs/slot-tankyu/league/777league-results/index.html','title':'777リーグ4th｜チーム順位・実戦結果','description':'777リーグ4thのRED・BLUEチーム順位と、RED第1回戦の結果を整理。試合結果のネタバレがあります。','type':'league','label':'777.LEAGUE / 4th','status':'チーム順位・実戦結果','updated':label,'short_title':'777リーグの順位・結果','breadcrumbs':[{'title':'777リーグの日程','path':'docs/slot-tankyu/league/777league/index.html'}],'toc':[{'id':k,'label':v} for k,v in [('overview','掲載している成績'),('red','REDリーグの順位'),('blue','BLUEリーグの順位'),('battle','RED第1回戦の結果'),('players','選手の差枚数pt'),('source','出典・確認範囲')]],'share_image':'share-league-4th.png','body':body}
if __name__=='__main__':
    data=json.loads((HERE/'data/league-results-4th.json').read_text());(HERE/'pages/league-results-4th.json').write_text(json.dumps(render(data),ensure_ascii=False,indent=2)+'\n')
