#!/usr/bin/env python3
"""Render reviewed league schedule data into the common static page source."""
import datetime, html, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
def esc(value):
    return html.escape(str(value), quote=True)

def render(data):
    checked = datetime.date.fromisoformat(data['checked_at'])
    rows = sorted(data['rows'], key=lambda row: (row['date'], row['round']))
    seen = set()
    months = {}
    for row in rows:
        date = datetime.date.fromisoformat(row['date'])
        key = (row['date'], row['round'])
        if key in seen: raise ValueError('Duplicate battle')
        seen.add(key)
        if row['status'] not in {'予定', '終了', '終了確認待ち', '延期', '中止'}:
            raise ValueError('Invalid battle status')
        if row['status'] == '終了' and (not row.get('evidence_url') or not row.get('evidence_note') or date >= checked):
            raise ValueError('Finished battle needs dated evidence')
        if row['broadcast_date']:
            datetime.date.fromisoformat(row['broadcast_date'])
        elif row['broadcast_status'] != '未確認':
            raise ValueError('Do not infer an unannounced broadcast date')
        for name in ('schedule_source', 'evidence_url', 'video_url'):
            if row.get(name) and not row[name].startswith('https://'):
                raise ValueError('Source links must use HTTPS')
        badge = 'done' if row['status'] == '終了' else 'pending' if row['status'] == '終了確認待ち' else 'planned'
        league = 'RED' if row['round'].startswith('RED') else 'BLUE' if row['round'].startswith('BLUE') else 'ルーキー'
        broadcast = esc(row['broadcast_date'] or row['broadcast_status'])
        if row.get('video_url'):
            broadcast += '<br><a href="'+esc(row['video_url'])+'">動画を見る ↗</a>'
        evidence = '<a href="'+esc(row['schedule_source'])+'">日程資料 ↗</a>'
        if row.get('evidence_url'):
            evidence += '<br><a href="'+esc(row['evidence_url'])+'">収録の確認元 ↗</a>'
        if row.get('venue_note'):
            evidence += '<br><small>会場は公式照合待ち</small>'
        cell = '<tr><th scope="row"><time datetime="'+row['date']+'">'+date.strftime('%m/%d')+'（'+'月火水木金土日'[date.weekday()]+'）</time></th><td><span class="league-label league-'+league.lower()+'">'+esc(row['round'])+'</span></td><td>'+esc(row['venue'])+'</td><td><span class="league-status '+badge+'">'+esc(row['status'])+'</span></td><td>'+broadcast+'</td><td>'+evidence+'</td></tr>'
        months.setdefault(date.strftime('%Y-%m'), []).append(cell)
    body = '<div class="notice">実戦日（収録日）と放送・動画配信日は別です。「終了」は収録の実施を確認できた回。「終了確認待ち」は予定日が過ぎているものの、実施の裏付けが足りない回です。確認基準日：'+esc(data['checked_at'])+'（日本時間）。</div>'
    source = data['video_announcement_url']
    if not source.startswith('https://'):
        raise ValueError('Announcement must use HTTPS')
    def release_time(value):
        dt = datetime.datetime.fromisoformat(value)
        if dt.utcoffset() != datetime.timedelta(hours=9):
            raise ValueError('Release times must use Japan time')
        return dt
    start = release_time(data['battle_release_start'])
    body += '<section id="video-start"><h2>本編の動画公開はいつ？</h2><div class="panel"><p><strong>4thシーズンのバトル本編は'+start.strftime('%Y年%m月%d日')+'（'+'月火水木金土日'[start.weekday()]+'）'+start.strftime('%H:%M')+'から公開予定</strong></p><p>それに先立ち、10月15日から隔日で各チームの決起集会を公開。チームの雰囲気や今シーズンの作戦をチェックできます。</p><p class="hint">日時は日本時間。本編全体の公開開始日です。各回戦・各動画の公開日は、下の日程表で別に確認してください。</p></div></section>'
    rally_cells = []
    rally_dates = set()
    for rally in sorted(data['rallies'], key=lambda r: r['release_at']):
        dt = release_time(rally['release_at'])
        if rally['release_at'] in rally_dates:
            raise ValueError('Duplicate rally date')
        rally_dates.add(rally['release_at'])
        url = rally['channel_url']
        if not url.startswith('https://www.youtube.com/'):
            raise ValueError('Channel links must use YouTube HTTPS')
        label = dt.strftime('%m/%d')+'（'+'月火水木金土日'[dt.weekday()]+'）'+dt.strftime('%H:%M')
        rally_cells.append('<tr><th scope="row"><time datetime="'+esc(rally['release_at'])+'">'+label+'</time></th><td>'+esc(rally['team'])+'</td><td><a href="'+esc(url)+'">'+esc(rally['channel'])+' ↗</a></td></tr>')
    body += '<section id="rallies"><h2>チーム決起集会の公開予定</h2><p>2026年10月15日〜29日、いずれも20:00公開予定です。リンクから公開チャンネルを開けます。</p><div class="tablewrap" tabindex="0" role="region" aria-label="チーム決起集会の動画公開予定表"><table><caption>777リーグ4th・チーム決起集会（日本時間）</caption><thead><tr><th scope="col">公開予定</th><th scope="col">チーム</th><th scope="col">公開チャンネル</th></tr></thead><tbody>'+''.join(rally_cells)+'</tbody></table></div><p class="hint">チャンネルへのリンクです。各動画の直接リンクは公開後に確認します。予定は変更される場合があります。</p><p><a href="'+esc(source)+'">告知元：777リーグ公式X ↗</a>（2026年10月14日の告知／確認日：'+esc(data['video_checked_at'])+'）</p></section>'
    upcoming = next((row for row in rows if row['status'] == '予定' and datetime.date.fromisoformat(row['date']) >= checked), None)
    next_text = esc(upcoming['date']+' '+upcoming['round'])+'<br>'+esc(upcoming['venue'])+'（収録予定）' if upcoming else '直近の収録予定は確認待ちです。'
    body += '<section id="next"><h2>直近の実戦予定</h2><div class="panel"><p><strong>'+next_text+'</strong></p><p class="hint">予定は二次資料を参照しています。来場前に公式の日程・店舗案内を確認してください。</p></div></section>'
    toc = [{'id':'video-start','label':'本編の公開開始'},{'id':'rallies','label':'決起集会の公開予定'},{'id':'next','label':'直近の実戦予定'}]
    for month, cells in months.items():
        identifier = 'month-'+month
        label = str(int(month[-2:]))+'月'
        toc.append({'id':identifier,'label':label})
        body += '<section id="'+identifier+'"><h2>'+month[:4]+'年'+label+'の実戦日・放送日</h2><p class="hint">表は横にスクロールできます。終了状況と放送日は別々に確認してください。</p><div class="tablewrap league-table-wrap" tabindex="0" role="region" aria-label="'+label+'の日程表"><table class="league-schedule"><caption>'+month[:4]+'年'+label+'・777リーグ4th</caption><thead><tr><th scope="col">実戦日</th><th scope="col">リーグ・回戦</th><th scope="col">会場</th><th scope="col">実戦状況</th><th scope="col">放送・配信日</th><th scope="col">確認元</th></tr></thead><tbody>'+''.join(cells)+'</tbody></table></div></section>'
    body += '<section id="sources"><h2>日程と公開日の見方</h2><ul><li>放送・配信日の「未確認」は、未放送・未発表と断定する意味ではありません。各回の公式動画・告知を照合できていない状態です。</li><li>前編・中編・後編など複数本に分かれる場合は、確認できた動画ごとに公開日と視聴リンクを記載します。</li><li>この表は2026年8〜12月の確認できた27件です。シーズン全日程を網羅した表ではありません。</li><li>収録終了は勝敗や動画公開を意味しません。結果のネタバレはこの表に載せていません。</li></ul><p><a href="https://p-gabu.jp/sc/666/777league/">777リーグ公式サイト ↗</a> ／ <a href="https://p-gabu.jp/sc/666/777league/schedule/">公式収録スケジュール ↗</a> ／ <a href="https://pachislot-memo.online/777league4th-schedule">収録日の参考資料：スロメモ ↗</a></p><p class="hint">スロ探究が整理した非公式の日程一覧です。会場・日程は二次資料からの参考情報として掲載し、収録の確認元を分けています。</p></section>'
    toc.append({'id':'sources','label':'表の見方・出典'})
    return {'path':'docs/slot-tankyu/league/777league/index.html','type':'league','label':'777.LEAGUE / 4th 2026–2027','title':'777リーグ｜実戦日・終了状況・放送日一覧','short_title':'777リーグの日程','description':'777リーグ4thの決起集会と本編の動画公開予定、収録日・終了状況を一覧で確認。公開チャンネルへのリンクもまとめています。','updated':max(data['checked_at'],data['video_checked_at']),'status':'4thシーズン・非公式まとめ','breadcrumbs':[],'toc':toc,'body':body,'share_image':'share-league-4th.png','share_lines':['777リーグ 4th','実戦日・終了状況','放送・配信日一覧']}

if __name__ == '__main__':
    data=json.loads((HERE/'data/league-4th.json').read_text())
    (HERE/'pages/league-4th.json').write_text(json.dumps(render(data),ensure_ascii=False,indent=2)+'\n')
    print('Generated pages/league-4th.json')
