# 2026年11月23日 実戦記録・独立検証

検証担当: `/root/records_20261123_review`（原稿作成者 `/root` とは別実行）。確認日: 2026年11月23日。

判定: **本文・根拠照合は合格。以下の固定版に限る。** 公開全体の安全検査、実ブラウザー表示、デプロイ結果の合格を意味しない。

## 確認方法と対象版

会話内の本人メモ・最終枚数の確認、本人提供元画像5枚を独自に閲覧し、新規JSON3件と照合。さらに公開用写真5枚・共有画像3枚を画像として閲覧し、縮小後の文字と数字を確認した。EXIF・寸法をPillowで確認。根拠表 `2026-11-23-records-evidence.md` のR1〜R12および3原稿ハッシュを再照合した。

| 対象ファイル | SHA-256 |
|---|---|
| scripts/slot-tankyu/pages/record-god-20261123.json | f3e6cdb0e898f65c7ea94899eccb3bd665cc0413109b53cece9499cb35caf832 |
| scripts/slot-tankyu/pages/record-im-20261123.json | 173c799542e8a2608cf0c26615363c6710b30c829073ab8c3e82eab5418df2b8 |
| scripts/slot-tankyu/pages/daily-20261123.json | 964376811cb00f352bc7479151348fcf40a276c2d19e9d7c3e20993e108d0416 |
| docs/slot-tankyu/assets/records/2026-11-23/god-kiseki/gg18-result.jpg | a8a17232e8c0f86051e6bb16b24290627a0463f19f71ff77aae04c499e120d53 |
| docs/slot-tankyu/assets/records/2026-11-23/god-kiseki/session-history.jpg | f7af8908b922ced13f6e3900b9517c38ae4347164281b76101872d4f99930f16 |
| docs/slot-tankyu/assets/records/2026-11-23/god-kiseki/zeus-amazing-grace.jpg | c516315af83f8a1a6d141bde2a0144a93153217b5d9c90c4520352f1626d4dbf |
| docs/slot-tankyu/assets/records/2026-11-23/im-juggler/bonus-history.jpg | e523ac385ac150512da4db71504b3b668da32ffa2e27fb2884db692cac6f32b6 |
| docs/slot-tankyu/assets/records/2026-11-23/im-juggler/final-counter.jpg | 92c15f2f876e13c456b156e289f833276ba0e84835474d487b0b784b6cc165cf |
| docs/slot-tankyu/assets/share-daily-20261123.png | 0b9410f8cf7bd0f79aafc38f124c9ed43b0d1f1732ebceb02be9e58025a053da |
| docs/slot-tankyu/assets/share-record-god-20261123.png | 25a9b8cc8ce14162657be721774f59d2fb7ea08451615169aa1f6b4f516e9209 |
| docs/slot-tankyu/assets/share-record-im-20261123.png | b94ee687b5bbcefaa3bd0b996c8e58215e56f9e09d21b7138bcde557bb86fd0f |

## 主張別の独立照合

| 主張ID | 独立確認と判定 |
|---|---|
| R1 | 本人申告の11月23日・200枚投資・5200枚回収を確認。5200−200＝5000。区間収支として正しい。 |
| R2 | I1はZeus Stage/GOD GAME 1/BGM Amazing Grace表示。休憩後に音へ気付いた時刻は画像から確認できず、本人メモとして明示。「天国」は本人の認識に留めている。条件付き確認の限界が本文付近にある。 |
| R3 | I2のGG18/TOTAL5837、I3の最大5840をそれぞれ確認。3枚差は説明を捏造せず未確認と表示。5200回収と混同していない。 |
| R4 | 5700・4800・3200・1750・1450・5セット・10まで・切断判断は本人の当時の読み。システム上の切断・残ストックの確定根拠へ格上げしていない。強い口調のコメント直前にも留保を再掲済み。 |
| R5 | I3は11月23日19時26分、1619G、GG突入18/最大継続18、最大5840/単セット409、上乗せ1、GOD0/赤70、ガイア1。表の8項目と一致。GG突入18を独立初当たり18と扱っていない。 |
| R6 | 本人の最終6160確認と公開依頼を照合。5200持込→6160最終、区間960の演算が正しい。内部移動を新規投資として加算していない。 |
| R7 | I4の台全体7496G、BB32/RB32、各1/234、合成1/117、現在228を確認。本人の遊技区間へ転用していない。6160は本人最終持ち枚数として確認済みで、台最大2609/過去4958と混同していない。 |
| R8 | 設定6付近は本人の印象として掲載。型式・着席時点の厳密な確率比較・本人のG数/当たり回数は未確認。I5から自分の当たり回数を推測していない。設定6と断定していない。 |
| R9 | 5000＋960＝5960、6160−200＝5960。機種区間と当日まとめが整合。持込5200の二重計上なし。 |
| R10 | author_commentを本人元文と照合。句読点・数字の桁区切り・「言って→鳴って」など最小校正。新たな感想・興奮・機種仕様を補作していない。excerptは修正版コメントの連続原文。 |
| R11 | latest.jsonは同日機種別2件のみ新着、当日まとめの重複登録なし。3件は既存記事を上書きしない新規パス。生成検査でリンク・アンカー・メタ情報を確認。実クリックは本担当未実施。 |
| R12 | 元画像I1〜I5と公開版を画像で独自照合。主張に使う表示は読める。全5写真のEXIFは空、縦横比維持、長辺1200以下、各300KB未満。共有3PNGは1200×630で本文の数値と一致、文字切れなし。 |

## 初回指摘と修正版の再検証

1. 軌跡short_titleが長文タイトル＋「実戦」で「18連実戦」となっていた。作成者に修正を依頼し、「神々の軌跡実戦」へ修正済みと再確認。
2. 有利区間に関する留保が縦長写真を挟んで本人コメントから離れるため、コメント直前にも「当時の推測」「確定した切断実績・獲得保証ではない」旨を再掲するよう依頼。生成HTMLで留保直後にauthor-comment節が続く（86文字後に節開始）ことを再確認。
3. ステージ写真の再圧縮後も表示を画像で再確認。BGM欄とZeus Stageの判読を維持。281601バイト。全8資材と最終3原稿のSHAは上表のとおり。

## 検査と残る範囲

本担当で `python3 scripts/slot-tankyu/check.py` を実行し、55生成ページ、リンク、アンカー、メタ情報、共有画像の検査がPASS。これは静的検査であり、実ブラウザーのPC・スマホ表示や公開先到達の合格には使用しない。

設定、天国滞在、有利区間切断、前任者の区間境界、アイム本人区間のG数/当たり回数、正確な型式は未確認のまま。本文もその条件を保持している。元画像や本人メモの出所を超えた機種解析・期待枚数の公式仕様は追加していない。

残る独立検証指摘: なし。本レビュー後に本文・画像・根拠条件を変更した場合は対象SHAの更新と再検証が必要。

## 追補: 履歴検査の互換補修を独立確認

対象3既存検査のdiff、新規 `check_records_20261123.py`、固定manifestを独自に読んだ。判定: **今回の固定版に対して妥当。無条件な除外や安全検査の弱化を検出していない。**

| 対象 | SHA-256 |
|---|---|
| scripts/slot-tankyu/check_news_20261123.py | 6dbc14640b80dbadbeb24d873cf1110ebd0296f1d25a20b6dabf28b62a6bb8a0 |
| scripts/slot-tankyu/check_sao2.py | 873ac1a5c2b92a70589c905cbe12bfdeae57d189ef3cd22920d5c6aa06c4c81f |
| scripts/slot-tankyu/check_editorial.py | 6303be2c3b0f532afdd46caa251d0f3aaa394bdb381dfee368e5672d2548e8b3 |
| scripts/slot-tankyu/check_records_20261123.py | a66b5a5223fcd414c3a98779164ba31c53a74479f07cbc0e89460346bf3ad5aa |
| scripts/slot-tankyu/editorial/reviews/2026-11-23-records-manifest.json | 0d874f36bc2fda5d80bbc4e5780fc80571bb7a8d99bf15d59607338edc65fdd9 |

- `check_news_20261123.py`: 先に新規実戦検査を実行。直近5ファイルは現行バイトのSHAを検証してから基点 `edb3a7a91e2cf6e6cceaf2fefae24b39c2229f4d` へ投影する。3新規原稿は新検査でSHAを固定し、旧ニュース検査からのみ除外。未知の原稿変更は新検査の「全旧原稿完全一致」で拒否する。旧ニュース4件＋カレンダーの新着条件は基点HTMLで保持、現行新着は新検査が件数・2実戦の順序と日時を確認する。旧新着データも先頭2件以外が完全一致し、latestデータ全体のSHAが固定されるため、新着4ニュースも勝手な入替えを許さない。
- `check_sao2.py`: listing枝だけが既存の `previous_bytes` チェーンを使い、固定された新版listingをSHA確認後に履歴投影。既存のSAO2・過去記事・セキュリティ検査を削除していない。
- `check_editorial.py`: additionsへ固定3原稿SHAを加える。既存allowlistの全体緩和や未知原稿の無条件許可ではない。冒頭の履歴検査チェーンで現行実戦検査も実行される。
- 新検査: 3原稿・listing・latestのSHA、8画像SHA、新規原稿集合、旧原稿全件不変、listingから正確な2カードだけを除くと旧版と一致、旧新着保持、本人コメント・資金内部移動・当日合計を照合。listingのupdatedのリセットも全体SHA固定の範囲内で、別の無制限編集を許す経路ではない。

実行した検査は `check_records_20261123.py`、`check_news_20261123.py`、`check_sao2.py`、`check_editorial.py`。全てPASS（editorial経由の過去検査チェーンを含む）。さらにファイルを実変更せず `Path.read_bytes` の一時モックで原稿・listing・latestの末尾に1バイトを足す改変を個別注入し、`previous_bytes` が3件すべて拒否すること、既存の無関係原稿改変を新検査が拒否することを確認した。モック解除後の実ファイルは未変更。

この追補はテスト実装と固定境界の検証であり、実ブラウザー確認、秘密情報検査、GitHubのCI、マージ・公開結果の代わりにはしない。AGENTS/SECURITY/CI/package設定を変更する補修は含まれない。
