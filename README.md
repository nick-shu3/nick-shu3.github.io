# シュウ３のゲームと道具箱／スロ探究

シュウ３が制作したブラウザゲーム・Webツールと、パチスロの個人メディア「スロ探究」を公開するリポジトリです。生成AIと相談しながら制作し、実際のプレイや実戦記録をもとに改善しています。

## 公開サイト

- [ゲームと道具箱](https://nick-shu3.github.io/)
- [スロ探究](https://nick-shu3.github.io/docs/slot-tankyu/)

PC・スマートフォンのブラウザで利用できます。各作品の制作状況はトップページや作品内の案内を確認してください。

## ゲーム・ツール

| 作品 | 内容 | 公開先 |
| --- | --- | --- |
| カギとトビラ | 箱・鍵・扉を使うパズル。第1章は全10階、一手戻し対応 | [遊ぶ](https://nick-shu3.github.io/docs/games/kagi-to-tobira/) |
| SQUAD FRONT | 援軍と武器を育てる防衛シューティング | [遊ぶ](https://nick-shu3.github.io/docs/games/squad-front/) |
| ハチよけライン | 線を描いて蜂から守るお絵かき防衛。全5ステージ | [遊ぶ](https://nick-shu3.github.io/docs/games/hachiyoke-line/) |
| 勇者は何度でも | 装備を引き継いで再挑戦する育成オートRPG | [遊ぶ](https://nick-shu3.github.io/docs/games/hero-again/) |
| 麻雀 点数チャレンジ | 4択で点数・逆転条件を学ぶ、別サイト公開のゲーム | [遊ぶ](https://shu3-mahjong-challenge.nagata-sh3.chatgpt.site) |
| アイムジャグラーEX ブドウシミュレーター | 実測・差枚逆算・確率分布を比較する非公式ツール | [使う](https://nick-shu3.github.io/docs/tools/im-juggler-grape/) |

麻雀 点数チャレンジの実装はこのリポジトリに含みません。トップページには公開先へのリンクを掲載しています。

## スロ探究

**シュウ３が実戦中に知りたいことを、ここに。**

設定示唆ややめどき、写真付きの実戦記録をまとめています。新台情報・業界ニュース・777リーグの日程もチェックできます。

| ページ | 掲載内容 |
| --- | --- |
| [機種ガイド](https://nick-shu3.github.io/docs/slot-tankyu/#guides) | 東京喰種、リコリス・リコイル、タコスロ。設定推測・示唆の条件や実戦データの読み方 |
| [実戦記録](https://nick-shu3.github.io/docs/slot-tankyu/records/) | 機種ごとの結果・実戦写真・判断の振り返り。複数機種の収支合計は当日まとめに掲載 |
| [777リーグ](https://nick-shu3.github.io/docs/slot-tankyu/league/777league/) | 4thの収録日、終了状況、放送・配信日の確認状況を一覧化 |
| [新台カレンダー](https://nick-shu3.github.io/docs/slot-tankyu/new-machines/) | パチスロの全国導入予定。店舗ごとの導入日とは区別 |
| [業界ニュース](https://nick-shu3.github.io/docs/slot-tankyu/news/) | 稼働動向・メーカーの動きなどを、事実と考察に分けて紹介 |
| [編集方針](https://nick-shu3.github.io/docs/slot-tankyu/about/) | 根拠、未確認情報、実戦写真、訂正の扱い |

非公式の個人メディアです。設定推測一覧の重要度は編集上の評価であり、設定期待度や勝率を表すものではありません。情報基準日・条件・出典を各ページに記載し、不明な内容は「未確認」とします。

### 更新運用

毎週月曜に直近7日の業界ニュースと今後8週間のパチスロ新台予定を収集し、シュウ３へ報告します。承認された内容のみ、検査とPRレビューを経て公開します。収集タスクはリポジトリやサイトへ自動で書き込みません。

日程表・ニュースは静的ページです。ページを開くたびに最新情報へ更新される仕組みではありません。777リーグの「終了」は収録実施の裏付けがある場合に表示し、放送日が確認できない場合は「未確認」と記載します。

Google Search Consoleの所有権確認タグをスロ探究トップに保持しています。検索の表示回数・クリック数などを確認するためのもので、サイト全体のPV計測とは別です。このリポジトリにはアクセス解析用トラッカーを追加していません。個人用の分析結果や認証情報は公開リポジトリに保存しません。

## 技術・ディレクトリ構成

HTML・CSS・JavaScriptをGitHub Pagesで配信します。ゲーム・ツールの処理は基本的にブラウザ内で完結し、このリポジトリにはバックエンド・データベース・ログイン機能はありません。

| 場所 | 内容 |
| --- | --- |
| `index.html` / `docs/index.html` | 作品集トップ。ルート版は`docs/`を参照するbaseタグ以外を同期 |
| `docs/style.css` / `docs/catalog.js` | 作品集の表示・カテゴリ切り替え |
| `docs/assets/` | 作品集の画像 |
| `docs/games/` | このリポジトリ内の4ゲーム |
| `docs/tools/im-juggler-grape/` | ブドウシミュレーター |
| `docs/slot-tankyu/` | スロ探究の生成済みHTMLと画像・CSS |
| `scripts/slot-tankyu/pages/` | スロ探究の記事・ページの編集元JSON |
| `scripts/slot-tankyu/templates/` | 機種ガイド・実戦記事・当日まとめの共通テンプレート |
| `scripts/slot-tankyu/data/` | リーグ日程・新台予定・ニュースの編集元データ |
| `scripts/slot-tankyu/*.py` | 静的ページの生成・整合性検査・共有画像生成 |
| `docs/security/` | 共通のスタンドアロン表示ガード |
| `tests/` | セキュリティ・公開範囲・ゲームロジック等の検査 |
| `scripts/scan-secrets.sh` | 固定バージョン・ダイジェスト照合済みGitleaksによる秘密情報検査 |
| `.github/workflows/pages.yml` | PR・main更新・週次・手動の`verify`検査 |

スロ探究は生成済みHTMLを直接編集せず、編集元JSONと共通レイアウトから再生成します。詳しい編集・画像基準は[スロ探究の共通テンプレート](scripts/slot-tankyu/README.md)を参照してください。

## 開発環境と検査

Git、Node.js/npm、Python 3を使用します。Acornはセキュリティ検査専用で、公開ページへは配信しません。Pillowと日本語フォントは共有画像を再生成する場合のみ必要です。

リポジトリのルートで実行します。

```sh
npm ci --ignore-scripts --no-audit --no-fund
node tests/security.cjs
node tests/security-regression.cjs
node tests/release.cjs
```

変更対象に応じて、以下のゲーム・ツール検査も実行します。

```sh
node tests/kagi.cjs
node tests/squad.cjs
node tests/hachiyoke.cjs
node tests/hero.cjs
node tests/grape.cjs
```

勇者の個別検査は`tests/hero-*.cjs`も参照してください。スロ探究のデータ・記事を更新した場合は次の順で生成・検査します。

```sh
python3 scripts/slot-tankyu/league_schedule.py
python3 scripts/slot-tankyu/news_calendar.py
python3 scripts/slot-tankyu/build.py
python3 scripts/slot-tankyu/check.py
```

リーグ・新台・ニュースのデータを変更していなければ、最後の2コマンドで記事を生成・検査できます。共有画像を変更したときは1200×630pxと文言の一致も確認します。

コミット・Push前の秘密情報検査は省略しません。Linux x64では次を実行します。ネットワーク接続と`curl`・`sha256sum`・`tar`が必要です。

```sh
bash scripts/scan-secrets.sh
git diff --check
```

他の環境でのGitleaks導入・検査手順は[SECURITY.md](SECURITY.md)を参照してください。自動検査とは別に、スマートフォン・PCの表示、リンク、画像、対象作品の操作、直接表示とiframe内での非表示を確認します。実行できない検査は理由を記録し、合格扱いにしません。

## ローカル表示

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

- 作品集：`http://localhost:8000/`
- スロ探究：`http://localhost:8000/slot-tankyu/`

JavaScriptを有効にし、ブラウザで直接開いてください。共通ガードにより、iframe等の埋め込み表示ではUIを非表示にします。

## 公開手順

1. 作業ブランチで変更し、ローカルの秘密情報検査・必須テスト・対象機能の確認を行う。
2. 変更内容と検査結果をシュウ３へ提示し、公開の承認を得る。
3. 作業ブランチへPushし、PRを作成する。mainへ直接Pushしない。
4. PRの最新HEADで既存の`verify`チェックが成功したことを確認し、レビュー後にマージする。
5. mainの検査とGitHub Pagesのデプロイ成功を確認する。
6. 公開URLの内容・表示・リンクを確認し、未実施項目があれば報告する。

`.github/workflows/pages.yml`は検査用ワークフローです。Pagesの公開処理はGitHub側の設定・デプロイ状況も確認します。CIはPush後に動くため、アップロード前の秘密情報検査の代わりにはなりません。

## セキュリティとプライバシー

[AGENTS.md](AGENTS.md)と[SECURITY.md](SECURITY.md)の要件を維持します。CSP、スタンドアロン表示ガード、必須検査や権限を緩和して公開する運用はしません。表示ガードはHTTPヘッダーによる埋め込み禁止と同等の保証ではありません。

対応作品では進行状況・記録をブラウザ内に保存します。ブラウザの保存データを削除すると記録も失われます。保存データは利用者が改変できるため、権限や課金の判定には使いません。

公開リポジトリ内のファイルは、サイトからリンクしていなくても閲覧され得ます。APIキー、パスワード、個人情報、非公開の分析データや原本は追加しません。外部サービス・認証・決済などを追加する場合は、事前にセキュリティ境界を見直します。検査の成功は脆弱性がないことの保証ではありません。

## 制作記録・フィードバック

- [シュウ３のnote](https://note.com/shu3note)
- [GitHubプロフィール](https://github.com/nick-shu3)

表示崩れや操作の問題は、作品名・端末・ブラウザ・再現手順を添えてお知らせください。公開のIssue等に個人情報や秘密情報を記載しないでください。

## ライセンス

現時点では、第三者への再利用許諾を示すライセンスを設定していません。掲載素材には第三者の権利が関わるものもあります。ソースコード・画像・ゲーム素材等の無断転載・再配布はご遠慮ください。
