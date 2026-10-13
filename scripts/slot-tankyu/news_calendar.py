#!/usr/bin/env python3
"""Build reviewed news summaries and release calendar; no runtime data fetching."""
import calendar, datetime, html, json, re
from pathlib import Path
from urllib.parse import urlsplit

HERE=Path(__file__).resolve().parent
def esc(value):return html.escape(str(value),quote=True)
def link(url,label):
    parts=urlsplit(url)
    if parts.scheme!='https' or not parts.netloc or parts.username or parts.password:
        raise ValueError('Invalid editorial source URL')
    return '<a href="'+esc(url)+'">'+esc(label)+' ↗</a>'
def page(path,kind,title,description,label,body,toc,share_lines,checked):
    return {'path':'docs/slot-tankyu/'+path+'/index.html','type':kind,'title':title,'short_title':label,'description':description,'label':label,'updated':checked,'status':'情報基準日：'+checked,'body':body,'toc':toc,'breadcrumbs':[],'share_image':'share-'+kind+'.png','share_lines':share_lines}

def calendar_page(data):
    checked=datetime.date.fromisoformat(data['checked_at'])
    groups={};seen=set()
    for item in sorted(data['machines'],key=lambda x:(x['date'],x['kind'],x['name'])):
        date=datetime.date.fromisoformat(item['date'])
        if item['kind'] not in {'パチンコ','パチスロ'}:raise ValueError('Invalid machine kind')
        key=(item['date'],item['name'])
        if key in seen:raise ValueError('Duplicate release')
        seen.add(key)
        if datetime.date.fromisoformat(item['checked_at'])>checked:raise ValueError('Future verification')
        groups.setdefault(date.strftime('%Y-%m'),[]).append(item)
    body='<div class="notice">全国の導入開始予定を整理しています。各店舗の新台入替日・設置状況とは別です。地域や店舗で日程が前後する場合があります。掲載は確認できた'+str(len(seen))+'機種で、全新台の網羅ではありません。</div>'
    body+='<p class="hint">情報基準日：'+esc(data['checked_at'])+' ／ 日程資料の表示更新日：'+esc(data['source_updated_at'])+'。カレンダーの色が付いた日を選ぶと、その日の機種一覧へ移動します。</p>'
    toc=[]
    for month,items in groups.items():
        year,num=map(int,month.split('-'));month_id='month-'+month
        toc.append({'id':month_id,'label':str(num)+'月'})
        byday={}
        for item in items:byday.setdefault(item['date'],[]).append(item)
        body+='<section id="'+month_id+'"><h2>'+str(year)+'年'+str(num)+'月の導入予定</h2><div class="release-calendar" role="group" aria-label="'+str(num)+'月の新台カレンダー">'
        for name in '日月火水木金土':body+='<span class="calendar-weekday">'+name+'</span>'
        for week in calendar.Calendar(firstweekday=6).monthdayscalendar(year,num):
            for day in week:
                date=f'{year:04}-{num:02}-{day:02}'
                if not day:body+='<span class="calendar-empty" aria-hidden="true"></span>'
                elif date in byday:
                    body+='<a class="calendar-release" href="#date-'+date+'" aria-label="'+str(num)+'月'+str(day)+'日 '+str(len(byday[date]))+'機種"><b>'+str(day)+'</b><small>'+str(len(byday[date]))+'機種</small></a>'
                else:body+='<span class="calendar-day">'+str(day)+'</span>'
        body+='</div>'
        for date,day_items in byday.items():
            body+='<div id="date-'+date+'" class="release-date"><h3>'+date.replace('-','/')+' 導入開始予定</h3><p class="hint">表は横にスクロールできます。メーカーで導入日まで確認した機種と、日程資料のみで確認した機種を区別しています。</p><div class="tablewrap" tabindex="0" role="region" aria-label="'+esc(date)+'の機種一覧"><table class="release-table"><thead><tr><th scope="col">種別</th><th scope="col">機種</th><th scope="col">メーカー</th><th scope="col">確認状況・出典</th></tr></thead><tbody>'
            for item in day_items:
                sources=link(item['schedule_url'],'日程資料')
                if item['official_url']:sources+=' ／ '+link(item['official_url'],'メーカー公式')
                body+='<tr><td><span class="tag">'+esc(item['kind'])+'</span></td><th scope="row">'+esc(item['name'])+'</th><td>'+esc(item['maker'])+'</td><td>'+esc(item['verification'])+'<br>'+sources+'</td></tr>'
            body+='</tbody></table></div><p><a href="#'+month_id+'">↑ 月のカレンダーへ</a></p></div>'
        body+='</section>'
    body+='<section id="reading"><h2>導入予定を見るときの確認事項</h2><ul><li>メーカーの発売発表日と、導入開始予定日は別です。</li><li>この日付だけでは、近隣店舗に設置されるかは分かりません。</li><li>同じ版権でも別スペック・別型式があるため、正式な機種名を確認しましょう。</li></ul><p>'+link('https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi','P-WORLD 新台スケジュール')+' ／ <a href="../news/">業界ニュースを読む →</a></p></section>'
    toc.append({'id':'reading','label':'日程の見方'})
    return page('new-machines','new-machines','新台カレンダー｜パチンコ・パチスロ導入予定','次の新台はいつ？ 月別カレンダーから導入予定日と機種名を確認。全国の予定と、店舗ごとの入替日を分けて読みます。','新台カレンダー',body,toc,['新台カレンダー','パチンコ・パチスロ','導入予定日から探す'],data['checked_at'])

def news_page(data):
    datetime.date.fromisoformat(data['checked_at']);seen=set();toc=[]
    body='<div class="notice">ニュースの事実と、読者への影響を考えるスロ探究の考察を分けています。掲載日と出来事の日付も区別し、原文は確認元のリンクから読めます。</div>'
    for issue in sorted(data['issues'],key=lambda x:x['date'],reverse=True):
        datetime.date.fromisoformat(issue['date']);identifier='issue-'+issue['date'];toc.append({'id':identifier,'label':issue['date']+'号'})
        body+='<section id="'+identifier+'"><h2>'+esc(issue['date'])+'の注目ニュース</h2><p class="hint">新台・ホール再編・業界動向・イベントを選んで掲載。速報の全件一覧ではありません。</p>'
        for n,item in enumerate(issue['articles'],1):
            if item['id'] in seen or not re.fullmatch(r'[a-z0-9-]+',item['id']):raise ValueError('Invalid or duplicate news ID')
            seen.add(item['id']);datetime.date.fromisoformat(item['published_at'])
            if not item['sources']:raise ValueError('News needs sources')
            body+='<article class="panel news-item" id="'+item['id']+'"><span class="tag">'+esc(item['category'])+'</span><h3>'+esc(item['title'])+'</h3><p class="hint">公表・掲載日：<time datetime="'+item['published_at']+'">'+item['published_at']+'</time><br>出来事：'+esc(item['event_date'])+'</p><div class="news-fact"><h4>確認できた事実</h4><p>'+esc(item['facts'])+'</p>'
            if item.get('metrics'):
                body+='<div class="tablewrap"><table><caption>パチンコとパチスロのDI比較</caption><thead><tr><th scope="col">項目</th><th scope="col">パチンコ</th><th scope="col">パチスロ</th></tr></thead><tbody>'
                for metric in item['metrics']:
                    body+='<tr><th scope="row">'+esc(metric['label'])+'</th><td>'+esc(metric['pachinko'])+'</td><td>'+esc(metric['slot'])+'</td></tr>'
                body+='</tbody></table></div><p class="hint">'+esc(item['metric_note'])+'</p>'
            body+='</div><div class="news-analysis"><h4>読者への影響・考察</h4><p>'+esc(item['analysis'])+'</p></div><details><summary>確認元・情報の区分</summary><ul>'
            for source in item['sources']:body+='<li>'+esc(source['kind'])+'：'+link(source['url'],source['label'])+'</li>'
            body+='</ul></details></article>'
        body+='</section>'
    body+='<section id="policy"><h2>情報の見方</h2><p>メーカー・企業・団体の発表を優先し、媒体の記事を参照した場合はその区分を示します。調査原本や公式告知が未照合のものは、媒体の報道として扱っています。</p><p>業界全体の動向は、個別店舗の設定や収益を保証しません。制度や仕様の変更は適用時期まで確認して読むことが大切です。</p><p><a href="../new-machines/">新台カレンダーへ →</a> ／ <a href="../about/">スロ探究の編集方針 →</a></p></section>'
    toc.append({'id':'policy','label':'情報の見方'})
    return page('news','industry-news','業界ニュース｜事実と考察で読むパチンコ・パチスロ','新台の発表、ホールの再編、業界の動きを短く整理。発表された事実と読者への影響を分けて読むニュースまとめです。','業界ニュース',body,toc,['パチンコ・パチスロ','業界ニュース','事実と考察で読む'],data['checked_at'])

if __name__=='__main__':
    for name,renderer,target in [('new-machines',calendar_page,'new-machines'),('industry-news',news_page,'industry-news')]:
        data=json.loads((HERE/'data'/f'{name}.json').read_text())
        (HERE/'pages'/f'{target}.json').write_text(json.dumps(renderer(data),ensure_ascii=False,indent=2)+'\n')
        print('Generated',target)
