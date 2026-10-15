# Webデザイン・編集改善：別実行担当による独立差分検証

- 担当：`/root/editorial_independent_review`（原稿編集担当とは別に起動された実行担当）
- 実施日：2026年10月16日
- 基準コミット：`a029189013abbc2705fab452ec8172f3795e9c82`
- 対象版：同基準HEADのローカル作業ツリー。下記SHA-256に固定。
- 参照規則：最上位AGENTS.md・SECURITY.md、scripts/slot-tankyu/AGENTS.md・README.md、editorial/README.md・DECISIONS.md・WORKLOG.md。
- 今回は既存資料・原稿・生成コード・生成HTMLとの独立した差分照合。外部の元資料は再取得・再読しておらず、外部資料の全主張を今回独立検証したという判定ではない。公開済み内容の数値を新たに検証済みへ昇格させない。

## 検証結果

| ID | 対象・主張 | 照合元・方法 | 結果 |
|---|---|---|---|
| W01 | 新着の実戦2件の内容更新日 | latest.jsonと各ページのupdatedを照合。実戦日はパス由来の別行表示。 | 10月15日・14日が一致。初回公開日へ読み替えていない。今回のレイアウトだけで日付を進めていない。 |
| W02 | 番組2件の紹介日 | 各sources節の「紹介日：2026年10月15日」と照合。 | 紹介日として表示し、動画公開日とは表示していない。 |
| W03 | ニュース2件の内容更新日 | industry-news.jsonの2026-10-14号、記事published_atと照合。 | 号の日付を内容更新日として明示。ウマ娘10月14日・市場記事10月13日の媒体掲載日を記事内で維持。 |
| W04 | 新着順・重複 | latest_feedを実行して6件を抽出。 | 10月15日3件→14日3件。同日は登録順との注記あり。当日まとめは含まず、機種別との重複なし。東京喰種ガイド10月13日は次点で保持。 |
| W05 | 終了確認待ちと次予定 | league_schedule.render(data,'2026-10-16')を実行。元データのJSON全体が実行前後で一致。基準コミットのdata/league-4th.jsonとも完全一致。 | 10月14日BLUE第4回戦は表示上の終了確認待ち、8月31日も維持。次予定は10月21日・22日・30日。「終了」への変更なし。 |
| W06 | 確認日と表示基準 | data.checked_at・video_checked_atとnoticeを照合。 | 収録/動画告知の確認日は10月14日のまま。予定表示の基準10月16日を別記し、情報再確認を意味しないと説明。 |
| W07 | 公式チャンネルと感想リンク | rally生成コード・生成HTML照合。 | 「公式チャンネル」「サイト内の視聴メモ・感想」を区別。収録日と動画公開日も別情報のまま。 |
| W08 | 本人抜粋2件 | author_excerptがauthor_comment内の連続する文字列であること、全ページのauthor_commentを基準コミットと比較。 | 完全一致。10月15日は『油断と疲れで2コマ目押しは残念でしたが、楽しいは楽しい。』と懸念も含めて引用。10月14日も口語と反復を保持。全文変更なし。 |
| W09 | 本人抜粋の全文導線 | build.pyのresult節直後のasideと#author-comment生成を確認。 | コメント提供のあるrecordのみ、原文一致をビルドで要求。全文への通常アンカー。未提供記事への空欄なし。実際のクリックは未実施。 |
| W10 | ニュース4件の事実・考察・制限・出典 | data/industry-news.jsonを基準コミットと全体比較。各facts/analysis/event_date/metric_noteの全文とsource.kind/urlが生成HTMLにあることを機械照合。 | データ全体が完全一致。DIの50企業・90地域/重複、意向と実績の別、Sammy試打日未確認、ウマ娘の取材報道/ゲーム性報道区分、市場平均と新台中央値/集計詳細未確認を維持。 |
| W11 | ニュース折りたたみ | news_calendar.pyおよび生成HTML照合。 | DI比較表のみdetailsへ移動。単位ポイント・稼働率や増台数ではない旨は折りたたみの外側。各記事の重要制限はfactsまたはanalysisとして開いた状態で残る。出典の公式/媒体区分の変更なし。 |

差分範囲で修正必須の内容退行は発見しなかった。新しい出来事・数値・仕様を追加していない。新着の根拠は原稿中の日付・号の更新日であり、外部で記事公開日を確認したという扱いではない。

## 未実施・判定の境界

- ブラウザー・実機のPC/スマホ表示、クリック・横スクロール・別タブ動作：未実施。
- 外部元資料の新規取得・本文再照合、動画本編視聴、収録実施の追加調査：未実施。
- 安全・回帰・リリース検査、秘密情報検査の全面実行：本担当の範囲外。実装担当の当該版の結果と合わせて判定する。
- 全R01〜R09の実表示を含む全面合格、既存記事の全主張を今回検証済みとする判定、公開承認は行わない。
- 判定：**今回対象の編集差分は適合。総合公開候補への昇格はこの記録だけでは行わない。** 外部資料を伴う重要な事実追加が後で発生した場合は、新版と元資料の独立検証が必要。
- 下記ファイルが後で変更された場合、その差分の再照合とSHA更新が必要。旧版合格を流用しない。

## 対象版SHA-256

| 原稿・コード・生成物 | SHA-256 |
|---|---|
| `scripts/slot-tankyu/editorial_views.py` | `653b4a7c5c515e176f81170c7a894759e938937f6b0d88f329bbd04f0308506c` |
| `scripts/slot-tankyu/data/latest.json` | `14ddcb9798e576c18fa374185ee9e8d662958610a41d955951f5c22b38bafbfc` |
| `scripts/slot-tankyu/data/presentation.json` | `8ed8729f4fa72c5d7cc683407eb639ab58d80035d4394b8cc1dea3cc9e045759` |
| `scripts/slot-tankyu/build.py` | `66b83d10b2bb0e616c0b2a3103bb532ea40d6ac8b509e30eb543629ea9dacb56` |
| `scripts/slot-tankyu/league_schedule.py` | `b33120a0ad8e91f2d3d2a90891ab1abeafe7e60cc1d8aebaaa0cae7aca18fae5` |
| `scripts/slot-tankyu/news_calendar.py` | `268d6f98d291d78a6fe321bbcd458fe0a5b4a355886d1cd3c33d6eb0a3362a34` |
| `scripts/slot-tankyu/data/league-4th.json` | `a7ae9e6a2b2cf4693f0d1c80fdbd95690f017208547bc940824e1b8971f55979` |
| `scripts/slot-tankyu/data/industry-news.json` | `8c9558c74a81ae526ba753f188f9e8aac19dffef27057ce61777853f5e6dab75` |
| `scripts/slot-tankyu/pages/industry-news.json` | `9c58fe5e6abe6305cbe3217859a1ef0a4446fb4cc39124c90c0a67d6d7120fbc` |
| `scripts/slot-tankyu/pages/league-4th.json` | `ac39509eeb3d3a6a15d8b4858987106f9bc817e853412530464df40f60ace324` |
| `scripts/slot-tankyu/pages/record-tako-20261014.json` | `ae83e77d324de4dcaaa21a7d68aeaddb62a99a3c4bc725550c6bdda4443d59d2` |
| `scripts/slot-tankyu/pages/record-tako-20261015.json` | `63ffa8c9f3d1ea090a88363265801733c6aae6435cf5e65cee328d6277e3cff1` |
| `scripts/slot-tankyu/pages/watch-face-mega-tigers.json` | `030f469644aafe045918cbe6f708ea8b0fe6a904577def486b7901c0d9c4a704` |
| `scripts/slot-tankyu/pages/watch-takoslot-wasabi.json` | `363d611294eb462fcd93794395511c1f8d91c9af5b5c7f984ae846c892fc2635` |
| `docs/slot-tankyu/index.html` | `c9f9a67ce7f1457c193d32366684ced43564c21b32686f2e2840c0dcb081bbed` |
| `docs/slot-tankyu/news/index.html` | `cab1dd51147973048ec2d51f34db94a0817a7ed06577c5ab584aba4e68c35f5a` |
| `docs/slot-tankyu/league/777league/index.html` | `49cf167ffc3b2d73dacd5bab5a04ac4be4e9112b0e8570862f7ab9f8aa075a94` |
| `docs/slot-tankyu/records/2026-10-14/takoslot/index.html` | `ef4a813e1391acfa8deda0772ee8f74731d1cd2d5bca853945df5e82d1e713d2` |
| `docs/slot-tankyu/records/2026-10-15/takoslot/index.html` | `8047041a64c34d7f17003e94dcae78cdb901c9cfe74dde68794bd7c9827c595f` |

## ニュース記事オブジェクトのSHA-256

UTF-8・キー順ソート・余白なしJSONで計算。4記事とも基準コミットから不変。

| 記事ID | SHA-256 |
|---|---|
| `di-report` | `c9ae4f68b7e4f33f53e77944143f046e3fa5a179f5e94cf412bc0f8529521c5d` |
| `sammy-cup` | `dd5285f908f13a2d5913ac7d46a124bc35947352206148ae341f441f29dc1168` |
| `umamusume-slot-announcement-2026` | `a35c3a0a507f8ce6a10ade6e64bd90bd532154c01fe1a8a086dddf70818db72e` |
| `slot-market-september-2026` | `3b72ca054f0f784a67a87338789431a7900e434eec105ab058295efb179ccec1` |

## 最終版の再照合（2026年10月16日）

- リーグ月別表の1列目を既存の`月/日（曜）`へ戻した変更を再確認。月見出しに年月、timeのdatetime属性にISO日付があるため年月の意味を保持。既存12％・nowrap列に長い年月日を押し込まない今回の判断は妥当。ブラウザーの列幅・横スクロール確認は未実施のまま。
- 再実行したリーグ生成結果はpages/league-4th.jsonと完全一致。次予定は10月21日・22日・30日、終了確認待ちは8月31日・10月14日で不変。元データの非破壊、収録確認日10月14日と表示基準10月16日の区別を再確認。
- トップ新着注記の「公開日が不明なものは推定していません」を確認。記事公開日と媒体掲載日の混同を減らす明確化であり、新着の日付根拠・並びは変更なし。
- 共有画像2点を実際に開いて目視確認。ともに1200×630。東京喰種は「設定推測ガイド／終了画面・設定別確率」、ニュースは「パチスロニュース／業界の動き／事実と考察で読む」と原稿share_linesに一致。更新日も既存の10月13日・10月14日と一致し、今回の画像更新日へ進めていない。文字切れは認めなかった。SNS各社での実カード表示は未実施。
- 前回記録したファイルSHAで変更があったのはleague_schedule.py・pages/league-4th.json・リーグ生成HTMLの3点のみ。これらを再照合して上表のSHAを更新。それ以外の前回記録済み16ファイルはSHA一致。home.JSONと共有画像等は下表へ追加。
- 判定：今回編集差分の適合判定を維持。元資料の再照合・実ブラウザー表示の未実施、総合公開候補の制限は上記のまま。

| 追加確認原稿・資材 | SHA-256 |
|---|---|
| `scripts/slot-tankyu/pages/home.json` | `545b7d8cb4921188818de1296a0421df3e2b74247632061b57f377beea9cb2fc` |
| `scripts/slot-tankyu/pages/guide-tokyo.json` | `b5c62a1259899f0e5215799be76b020ff85b5ae31e2656b5048c7a45b45ae8b4` |
| `docs/slot-tankyu/assets/share-guide-tokyo.png` | `73b7c69c007fcfd638c0355cb58cd3866e466061282dfe2c368f5e14b7985fd2` |
| `docs/slot-tankyu/assets/share-industry-news.png` | `414b9410266410b92bebcccd73b2544026e543ed3ddaa586cafa4f6320f61081` |
