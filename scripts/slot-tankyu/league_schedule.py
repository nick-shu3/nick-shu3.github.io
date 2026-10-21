#!/usr/bin/env python3
"""Render reviewed league schedule data into the common static page source."""
import datetime, html, json, re
from pathlib import Path
from editorial_views import presentation_date

HERE = Path(__file__).resolve().parent
def esc(value):
    return html.escape(str(value), quote=True)

def date_label(value):
    date = datetime.date.fromisoformat(value) if isinstance(value, str) else value
    return f"{date.year}年{date.month}月{date.day}日"

def render(data, as_of=None):
    checked = datetime.date.fromisoformat(data['checked_at'])
    reference = datetime.date.fromisoformat(as_of) if isinstance(as_of,str) else as_of or presentation_date()
    if reference < checked:raise ValueError('Presentation reference precedes source check')
    rows = sorted((dict(row) for row in data['rows']), key=lambda row: (row['date'], row['round']))
    for row in rows:
        if row['status']=='予定' and datetime.date.fromisoformat(row['date']) < reference:
            row['status']='終了確認待ち'
            row['status_note']='予定日経過。収録実施・延期・中止は未確認。'
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
        broadcast = esc(date_label(row['broadcast_date']) if row['broadcast_date'] else row['broadcast_status'])
        if row.get('video_url'):
            broadcast += '<br><a href="'+esc(row['video_url'])+'">動画を見る ↗</a>'
        evidence = '<a href="'+esc(row['schedule_source'])+'">公式日程 ↗</a>'
        if row.get('evidence_url'):
            evidence += '<br><a href="'+esc(row['evidence_url'])+'">収録の確認元 ↗</a>'
        if row.get('evidence_method'):
            evidence += '<br><small>投稿を二次資料経由で確認</small>'
        if row.get('status_checked_at') and row['status'] in {'終了','終了確認待ち'}:
            evidence += '<br><small>状況確認：'+date_label(row['status_checked_at'])+'</small>'
        status_note = '<br><small>'+esc(row['status_note'])+'</small>' if row.get('status_note') else ''
        if row.get('venue_note'):
            evidence += '<br><small>会場は公式照合待ち</small>'
        cell = '<tr><th scope="row"><time datetime="'+row['date']+'">'+f'{date.month}/{date.day}'+'（'+'月火水木金土日'[date.weekday()]+'）</time></th><td><span class="league-label league-'+league.lower()+'">'+esc(row['round'])+'</span></td><td>'+esc(row['venue'])+'</td><td><span class="league-status '+badge+'">'+esc(row['status'])+'</span>'+status_note+'</td><td>'+broadcast+'</td><td>'+evidence+'</td></tr>'
        months.setdefault(date.strftime('%Y-%m'), []).append(cell)
    body = '<div class="notice">収録日と放送・動画配信日は別です。「終了」は実施の根拠を確認した回。「終了確認待ち」は終了の確認が不足する回です。収録情報の確認日：'+date_label(checked)+'（日程の照合日）。各回の終了根拠・状況確認日は表に分けて記載します。予定表示の基準日：'+date_label(reference)+'。日付だけで終了・動画公開済みとは判断しません。</div>'
    source = data['video_announcement_url']
    if not source.startswith('https://'):
        raise ValueError('Announcement must use HTTPS')
    def release_time(value):
        dt = datetime.datetime.fromisoformat(value)
        if dt.utcoffset() != datetime.timedelta(hours=9):
            raise ValueError('Release times must use Japan time')
        return dt
    start = release_time(data['battle_release_start'])
    body += '<section id="video-start"><h2>本編の動画公開はいつ？</h2><div class="panel"><p><strong>4thシーズンのバトル本編は'+date_label(start)+'（'+'月火水木金土日'[start.weekday()]+'）'+start.strftime('%H:%M')+'から公開予定</strong></p><p>それに先立ち、10月15日から隔日で各チームの決起集会を公開。チームの雰囲気や今シーズンの作戦をチェックできます。</p><p class="hint">本編全体の公開開始日です。各回戦・各動画の公開日は、下の日程表で別に確認してください。</p></div></section>'
    rally_cells = []
    rally_dates = set()
    for rally in sorted(data['rallies'], key=lambda r: r['release_at']):
        dt = release_time(rally['release_at'])
        if rally['release_at'] in rally_dates:
            raise ValueError('Duplicate rally date')
        rally_dates.add(rally['release_at'])
        url = rally['channel_url']
        video = rally.get('video_url')
        if video and (not re.fullmatch(r'https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}',video) or not rally.get('video_link_checked_at')):
            raise ValueError('Video links need a reviewed YouTube URL and check date')
        state = '動画リンクあり' if video else '公開確認待ち' if dt.date()<reference else '公開予定'
        state_note = '<br><small>リンク確認：'+date_label(rally['video_link_checked_at'])+'</small>' if video else ''
        video_link = '<a href="'+esc(video)+'">動画を見る ↗</a><br>' if video else ''
        if not url.startswith('https://www.youtube.com/'):
            raise ValueError('Channel links must use YouTube HTTPS')
        label = date_label(dt)+'（'+'月火水木金土日'[dt.weekday()]+'）'+dt.strftime('%H:%M')
        note = ''
        if rally.get('watch_slug'):
            slug = rally['watch_slug']
            if not isinstance(slug, str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
                raise ValueError('Invalid watch article slug')
            note = '<br><a href="../../watch/'+esc(slug)+'/">サイト内の視聴メモ・感想 →</a>'
        rally_cells.append('<tr><th scope="row"><time datetime="'+esc(rally['release_at'])+'">'+label+'</time></th><td>'+esc(rally['team'])+note+'</td><td>'+state+state_note+'</td><td>'+video_link+'<a href="'+esc(url)+'">'+'公式チャンネル：'+esc(rally['channel'])+' ↗</a></td></tr>')
    body += '<section id="rallies"><h2>チーム決起集会の公開状況・予定</h2><p>告知上の予定は2026年10月15日〜29日の各日20:00。過去日でも、対象動画を確認できていないものは「公開確認待ち」としています。</p><div class="tablewrap" tabindex="0" role="region" aria-label="チーム決起集会の動画公開予定表"><table><caption>777リーグ4th・チーム決起集会</caption><thead><tr><th scope="col">告知上の公開予定</th><th scope="col">チーム</th><th scope="col">確認状況</th><th scope="col">動画・公式チャンネル</th></tr></thead><tbody>'+''.join(rally_cells)+'</tbody></table></div><p class="hint">動画リンクがある2本は、既存の紹介記事で確認したものです。今回のYouTube本文の再取得はできていません。その他はチャンネルへのリンクで、公開の確認を意味しません。予定は変更される場合があります。</p><p><a href="'+esc(source)+'">告知元：777リーグ公式X ↗</a>（2026年10月14日の告知／確認日：'+esc(date_label(data['video_checked_at']))+'）</p></section>'
    upcoming = [row for row in rows if row['status']=='予定' and datetime.date.fromisoformat(row['date']) >= reference]
    pending = [row for row in rows if row['status']=='終了確認待ち']
    body += '<section id="next"><h2>次の収録予定</h2><p class="hint">予定表示の基準日：'+date_label(reference)+'。公式収録スケジュールの掲載日程です。予定は変更される場合があるため、来場前に公式・店舗案内を確認してください。</p>'
    if upcoming:
        body += '<ul class="schedule-list">'+''.join('<li><a href="#month-'+row['date'][:7]+'">'+date_label(row['date'])+' '+esc(row['round'])+'</a> — '+esc(row['venue'])+'（収録予定）</li>' for row in upcoming[:3])+'</ul>'
    else:body += '<p>今後の収録予定は確認待ちです。</p>'
    body += '<p><a href="#pending">過去の終了確認待ちを見る ↓</a></p></section><section id="pending"><h2>終了確認待ち</h2><p>予定日だけでは収録終了と判断できません。実施・延期・中止の裏付けが不足する回を分けています。</p>'
    body += '<ul>'+''.join('<li><a href="#month-'+row['date'][:7]+'">'+date_label(row['date'])+' '+esc(row['round'])+'</a> — 終了確認待ち</li>' for row in pending)+'</ul>' if pending else '<p>該当する回はありません。</p>'
    body += '</section>'
    toc = [{'id':'next','label':'次の収録予定'},{'id':'pending','label':'終了確認待ち'},{'id':'video-start','label':'本編の公開開始'},{'id':'rallies','label':'決起集会の状況・予定'}]
    for month, cells in months.items():
        identifier = 'month-'+month
        label = str(int(month[-2:]))+'月'
        toc.append({'id':identifier,'label':label})
        body += '<section id="'+identifier+'"><h2>'+month[:4]+'年'+label+'の実戦日・放送日</h2><p class="hint">表は横にスクロールできます。終了状況と放送日は別々に確認してください。</p><div class="tablewrap league-table-wrap" tabindex="0" role="region" aria-label="'+label+'の日程表"><table class="league-schedule"><caption>'+month[:4]+'年'+label+'・777リーグ4th</caption><thead><tr><th scope="col">実戦日</th><th scope="col">リーグ・回戦</th><th scope="col">会場</th><th scope="col">実戦状況</th><th scope="col">放送・配信日</th><th scope="col">確認元</th></tr></thead><tbody>'+''.join(cells)+'</tbody></table></div></section>'
    body += '<section id="sources"><h2>日程と公開日の見方</h2><ul><li>放送・配信日の「未確認」は、未放送・未発表と断定する意味ではありません。各回の公式動画・告知を照合できていない状態です。</li><li>前編・中編・後編など複数本に分かれる場合は、確認できた動画ごとに公開日と視聴リンクを記載します。</li><li>この表は'+date_label(rows[0]['date'])+'〜'+date_label(rows[-1]['date'])+'の公式掲載分'+str(len(rows))+'件です。シーズン全日程を網羅した表ではありません。</li><li>収録終了は勝敗や動画公開を意味しません。結果のネタバレはこの表に載せていません。</li></ul><p><a href="https://p-gabu.jp/sc/666/777league/">777リーグ公式サイト ↗</a> ／ <a href="https://p-gabu.jp/sc/666/777league/schedule/">公式収録スケジュール ↗</a> ／ <a href="https://pachislot-memo.online/777league4th-schedule">収録日の参考資料：スロメモ ↗</a></p><p class="hint">スロ探究による非公式の整理です。会場・日程は公式収録スケジュールを照合し、終了状況は別の根拠・確認日で管理しています。以前の二次資料による日程から、公式掲載分へ更新しました。</p></section>'
    start=body.index('<section id="next">');end=body.index('<section id="month-',start)
    schedules=body[start:end];body=body[:start]+body[end:]
    insert=body.index('<section id="video-start">');body=body[:insert]+schedules+body[insert:]
    toc.append({'id':'sources','label':'表の見方・出典'})
    return {'path':'docs/slot-tankyu/league/777league/index.html','type':'league','label':'777.LEAGUE / 4th 2026–2027','title':'777リーグ｜実戦日・終了状況・放送日一覧','short_title':'777リーグの日程','description':'777リーグ4thの2027年3月までの公式収録予定42件、終了状況、決起集会の動画リンク・公開確認状況を一覧で確認できます。','updated':max(data['checked_at'],data['video_checked_at'],*(r.get('status_checked_at',data['checked_at']) for r in data['rows'])),'status':'4thシーズン・非公式まとめ','breadcrumbs':[],'toc':toc,'body':body,'share_image':'share-league-4th.png','share_lines':['777リーグ 4th','実戦日・終了状況','放送・配信日一覧']}

if __name__ == '__main__':
    data=json.loads((HERE/'data/league-4th.json').read_text())
    (HERE/'pages/league-4th.json').write_text(json.dumps(render(data),ensure_ascii=False,indent=2)+'\n')
    print('Generated pages/league-4th.json')
