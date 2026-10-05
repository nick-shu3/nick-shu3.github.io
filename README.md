# シュウ３のゲームと道具箱

ゲームと便利ツールを追加していく、GitHub Pages向けの作品集です。ビルドや外部サービスのAPIキーは不要です。

## 収録作品

- カギとトビラ：第1章・1〜10階。
- SQUAD FRONT：援軍と武器を強化してボスを倒す、防衛シューティングの試作版。

未公開の第2章・第3章は、この公開用ソースに含めていません。

## GitHubで管理・公開する

このファイルを含むフォルダの中身を、作成済みの `nick-shu3/nick-shu3.github.io` リポジトリのルートに配置します。ブランチ名は `main` です。GitHub Desktopでリポジトリをクローンしてから、既存のREADMEの内容を確認して統合してください。

1. HTML・CSS・JavaScriptなどのソースを配置し、ローカルでコミットします。
2. PNG画像とSVGアイコンを元の相対パスに配置し、ローカルで別のコミットを作成します。画像を追加する前にPushすると、参照先が欠けた状態で公開処理が動きます。
3. 全ファイルが揃っていることを確認してから、GitHub DesktopでPushします。隠しフォルダ `.github` も必要です。
4. GitHub Pagesは `main` ブランチの `/(root)` から公開します。`index.html` が作品集の入口、`docs/` 以下にゲームを配置しています。
5. Actions の **Verify portfolio** と Pages の **pages build and deployment** が成功し、公開URLが表示されることを確認します。

`nick-shu3/nick-shu3.github.io` として公開した場合の予定URL：
https://nick-shu3.github.io/

公開の完了状況はGitHub Actionsで確認してください。リポジトリ名を変更した場合は、カギとトビラの `index.html` のOG画像URLと `app.js` の結果画像に表示するURLも変更してください。

## ソースの場所

| 場所 | 内容 |
| --- | --- |
| `docs/index.html` | 作品集のトップページ・作品カード |
| `index.html` | 現在のPages公開元がリポジトリ直下でも作品集を表示するための同内容の入口。`docs/index.html` の `<head>` に `<base href="docs/">` を加えたもの |
| `docs/style.css` | 作品集の見た目 |
| `docs/catalog.js` | カテゴリ切り替え・シューティングの紹介イラスト |
| `docs/games/kagi-to-tobira/` | カギとトビラ第1章 |
| `docs/games/squad-front/` | SQUAD FRONT |
| `.github/workflows/pages.yml` | 公開ファイルとゲームロジックの自動テスト |
| `tests/` | 公開用ファイルとゲームロジックのテスト |

トップページを更新するときは `docs/index.html` を編集し、直下の `index.html` も同期してください。`tests/release.cjs` が一致を検査します。

便利ツールはまだありません。追加するときは `docs/tools/` に作品を配置し、トップページに `data-type="tool"` のカードを追加してください。カテゴリボタンの件数も更新します。

## 手元で試す

Python 3がある環境でリポジトリのルートから実行します。

```sh
python3 -m http.server 8000 --directory docs
```

ブラウザで http://localhost:8000/ を開きます。

Node.jsがある環境で、次のテストを実行できます。

```sh
node tests/release.cjs
node tests/squad.cjs
node tests/kagi.cjs
```

ローカルリンクと公開範囲、第1章全10階の攻略可能性、シューティングの勝敗・強化処理を検証します。スマホでの描画、音声、画像保存は実機確認が必要です。

## 保存データと公開範囲

進行状況はブラウザのローカルストレージに保存します。以前のサイトとGitHub Pagesでは保存先のドメインが違うため、以前のクリア状況は自動で移行されません。ブラウザのデータを削除すると記録も消えます。

公開リポジトリに入れたファイルは、トップページからリンクしなくても閲覧できます。未公開作品や秘密情報は、このリポジトリに追加しないでください。

## 移行元

既存ゲームの以下の版をもとに、相対リンク・作品集への戻り先・公開用共有URLを調整しました。元のサイトは変更していません。

- カギとトビラ：`cd5c209fb22e2fadf4635b0caf5d0f99cbec56ff`
- SQUAD FRONT：`e2e6aa7236b7643e560751bf2a02a84405d5f274`

第三者への再利用許諾を示すライセンスは、まだ設定していません。
