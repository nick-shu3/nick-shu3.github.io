# 11月8日 最新化：根拠と固定版

担当 /root、確認日2026-11-08。基準main e45322b3abfb99cfcddcaf83dbee5fb2aeaa58c1。
対象全フィールド・対象SHAは隣接の2026-11-08-refresh-manifest.json。ニュース各記事の版はJSONのキー順ソート・空白なしSHAを下に記録。原稿内容の独立検証待ち。

| ID | 対象 | 主張と根拠・確認箇所 | 確認日 | 状態 | 担当・条件 |
|---|---|---|---|---|---|
| C01 | presentation、トップ、league | 11月8日基準では次の予定は11月10日BLUE第9回戦。公式 https://p-gabu.jp/sc/666/777league/schedule/ の42回分の日付・回戦・会場を現行台帳と照合。一致。過去予定の実施を推測しない | 2026-11-08 | 確認済み | /root、予定のみ。既存終了根拠は再確認せず保持 |
| C02 | leagueのBLUE1 videos/watch_slug、latest | 前後編URLは公開済みpages/battle-blue1-20261107.jsonと照合。 https://www.youtube.com/watch?v=W27ifmZWEZc と https://www.youtube.com/watch?v=nAPtO7zIcvg 。既存公開記事 https://nick-shu3.github.io/docs/slot-tankyu/watch/777league-4th-blue1/ に接続する | 2026-11-08 | 条件付き確認 | /root、リンク文字列と記事接続のみ。動画本編再視聴・公開日時の原本確認は未実施。日程表の放送日は未確認を維持 |
| C03 | resultsの追補 | https://p-gabu.jp/sc/666/777league/game/ の取得本文ではランキング値を読めず、BLUE試合表は「-」。最新点数は未確認で11月4日の本人提供画面記録を保持 | 2026-11-08 | 条件付き確認 | /root、未取得を0pt・未実施・未公開と断定しない。告知は歴史記録の前に表示。本文の古い数値を最新に変更しない |
| C04 | calendar、news海スロ | https://www.sanyobussan.co.jp/information/pdf/sanyo_press_release_20261106_1.pdf 全2ページテキスト、1ページ冒頭に発行日11/6・発表元・メーカーサンスリー・トップ導入2027/2/8予定、同ページスペック欄にBBはBT込み約300枚・約50%ループ・平均450枚。公式一覧 https://www.sanyobussan.co.jp/information/pressrelease.html も11/6掲載 | 2026-11-08 | 確認済み | /root、PDFは通常HTTPで取得した資料を精読、web直接openの失敗とは区別。予定と店舗導入を分ける |
| C05 | news試打 | https://twin-angel.com/news/6956/ 掲載日10/29、開催概要11/7・8、10–16時、100円、試打は1人10分・18歳未満不可、希望者多数・早期終了・天候閉場注意。冒頭12/7全国導入予定 | 2026-11-08 | 確認済み | /root、告知日程の再照合。11/8実施・受付状況は未確認と記事中に明記 |
| C06 | calendarの再照合注記 | https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi 11/8更新表示の11/2以降の表と https://pachimaga.com/free/newmachine/ の11/2～1/12一覧。既存の該当機種・日付は維持。P-WORLDの今回本文ではアサルトの掲載を確認できず、パチマガは12/7に掲載。ゼーガペインETRはP-WORLDにも12/7に掲載 | 2026-11-08 | 条件付き確認 | /root、媒体の日程。過去の仕様・一次資料の確認日や機種別確認日を一律に進めない。ライザ・シャカの日程差は既存の未解決を保持し再解決とはしない |
| C07 | latest全件・リンク配置 | 新規3件は今回の内容更新日11/8。既存記事・新着全件は基準mainのまま保持。日付は今回編集日で元資料公表日とは別 | 2026-11-08 | 対象外・考察 | /root、編集上の導線整理。成績最新化成功・イベント実施確認とは扱わない |

共通ルール：日付の更新は全事実の再確認を意味しない。未取得を存在しないと扱わない。
今回判断：吉宗ガイドは既に55%の説明があり、数値の追加を行わない。アリアは公式機種サイト1/4・発表PDF1月中旬・日程媒体1/12の不一致が残るため、既存保留を維持する。

ニュース umislot-announcement-20261106 SHA-256: ed838890b016f1bf587e5bb203e2a1b11bffb221ea415af81457d81a862185e0

ニュース twin2-trial-20261108 SHA-256: beaaaee80bbc0cd5ddfbd4e5d56f8fd40ac7a58706a4b0e7f21c870644d8380b
