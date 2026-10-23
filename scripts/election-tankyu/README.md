# 選挙探究の更新手順

正規データは `data/election-tankyu/catalog.json`。公開可能な公約要約・出典メタデータ・承認済み情報だけを置きます。内部の判定案、調査中の実績文章、審査者情報、取得資料本体はこの公開リポジトリに置きません。

```sh
python3 scripts/election-tankyu/build.py
python3 scripts/election-tankyu/build.py --check
python3 tests/election-tankyu-data.py
node tests/election-tankyu.cjs
node tests/security.cjs
node tests/security-regression.cjs
node tests/release.cjs
```

HTMLと公開JSONは自動生成です。本文を直接編集せず、正規データを修正して再生成します。`--check` は差分があれば失敗します。プレビューは `docs/election-tankyu/index.html` をブラウザで直接開けます。共通ガード `docs/security/` も必要です。依存はビルドがPython標準ライブラリ、既存セキュリティ検査がリポジトリ指定のacornです。

ブラウザ試験は `node tests/election-tankyu.browser.cjs`。Playwright 1.62.1とChromiumを用いた開発用テストです。`CHROMIUM_PATH` で既存ブラウザ実行ファイルを指定できます。Playwrightは検査環境に別途必要で、配信ファイルへ同梱しません。レポートは `ELECTION_QA_OUTPUT`、実行ファイルは `CHROMIUM_PATH` を環境変数で指定できます。省略時のレポート出力先はOSの一時ディレクトリです。

## 公約を追加する

既存IDは変更せず、未使用IDを発行します。`party_id`、`election_id`、`comparison_group`、`source_ids` と条件の参照をそろえ、本文・対象・金額・期間・期限・所在・未確認事項を記録します。同じ政策の比較でも対象・行為・条件が異なる点を要約に残します。比較群は一致や優劣を認定するものではありません。

原文の確認は `ai_checked`、転載だけの確認は `reproduction_checked`、未照合はその他の未確認状態として扱います。`original_human_approved` と `assessment_approved` は独立しています。実現期限と適用期間も独立です。

## 承認の境界

初期状態は全15件で人間承認なし、履行判定保留、法律の進捗未確認、成果未評価です。候補の実績を公開正規データに入れるとビルドが失敗します。承認済みの記録を反映する場合は、外部の人間審査工程から、公開可能な情報と対応する `public_approvals` を渡します。

受領記録の項目は `entity_type`（original / assessment）、`entity_id`、`actor_type`（human）、`decision`（approved）、`content_sha256`。内容ハッシュは `build.py` の `fingerprint()` で算出します。原文は対象・条件・出典本文ハッシュに、判定は原文・実績・関連出典のハッシュに依存します。承認後に依存内容が変わると再審査が必要です。実績・関与の各記録には `human_approved: true` と根拠 `source_ids` が必要で、全体が判定の内容ハッシュにも含まれます。

この受領記録は本人認証や電子署名ではなく、外部審査結果と対象版の整合性を確認する仕組みです。AIが人間承認を作成してはいけません。現時点では審査UI・認証・承認記録の自動取込は追加していません。旧版の内部審査データも無条件には移行しません。

数値比較は目標と実績それぞれの `unit, entity, period, calendar, price_basis, population, region, revision, direction` が一致し、不明値がない場合のみ許可します。`revision` は対応する統計の確報・速報等の比較条件です。資料の文書版と混同しないでください。目標ゼロ・削減方向では単純比を表示しません。目標と実績の両方に人間の確認が必要です。

## CIと公開

新規 `election-tankyu.yml` は対象パスの変更時だけ生成物の同期とデータ検査を実行します。既存の `verify` ワークフロー・安全検査・公開設定は変更していません。新規CI自身もPRのレビュー対象です。ブラウザ試験と出典内容の照合は、このCIの実行範囲に含めていません。

Push前に既存手順で秘密情報を検査し、オーナーの反映指示後にブランチとPRを作成します。現在HEADで既存の必須 `verify` の成功を確認してからマージします。
