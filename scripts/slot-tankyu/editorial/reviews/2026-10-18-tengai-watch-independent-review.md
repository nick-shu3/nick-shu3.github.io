# テンガイ決起集会紹介：独立内容検証

- 実施担当：`/root/editorial_independent_review`。原稿編集担当`/root`とは別に実行した検証担当。
- 確認日：2026年10月18日（日本の日付）。
- 基準：main `a9094443dedf5e4f0a8bc821a2ddfbbab92227aa`。
- 対象：新紹介記事の全本文・表・見出し・description・本人コメント7段落・共有画像、一覧/トップ/新着/リーグの追加導線、限定的な回帰検査変更。
- 新紹介JSON：`f21f33428691055dba7190e95524a1f864cf115221bc1cf6e7aafd99ef806cc8`。下表の版を確認し、生成HTMLとの完全一致も独自実行で確認。
- 適用規則：最上位AGENTS.md・SECURITY.md、スロ探究AGENTS.md・README、editorial README/DECISIONS/WORKLOG/official-source-checklist。

## 独自取得した根拠と範囲

1. https://www.youtube.com/watch?v=gvdjRDYu2ek
   - Web取得はDisabledError。アクセス制限を回避せず、同じ公開URLを通常HTTPで独自取得し200成功。
   - `ytInitialPlayerResponse.videoDetails`の題名・author・shortDescriptionを直接読んだ。チーム名・5人の名前・「バトル本編 11月1日(日)20時より公開予定」の範囲を確認。
   - `microformat.playerMicroformatRenderer.publishDate`は`2026-10-17T04:00:18-07:00`（日本時間10月17日20:00:18）。動画公開日10月17日と記事紹介日10月18日を区別。
   - 題名/説明欄/公開メタデータの確認であり、映像や字幕を直接確認したものではない。本文にその制限を維持。
2. https://1geki.jp/repo/20260817sammynw/
   - Web本文・通常HTTPの両方を独自取得。REDリーグのテンガイ表でリーダーまりも、メンバーレビン/スロミック・エイキ/七瀬静香、ルーキー内藤沙季を確認。メーカー公式とせず報道として扱う。
3. 本人コメント
   - 親担当より、この会話で本人が00:08に提供した原文全文の転送を受領して照合。00:14の公開依頼は親担当からの引き渡しに基づく。別のユーザー履歴検索による承認確認ではない。
   - 私自身の動画視聴から感想の妥当性を評価したものではなく、本人の表明した期待や印象を変更していないかを確認。

## 主張と照合結果

| ID | 原稿箇所・主張 | 参照箇所 | 確認日・担当 | 結果・残す条件 |
|---|---|---|---|---|
| T01 | videoの動画名・チャンネル・対象チーム | YouTube videoDetails.title/author、説明欄 | 2026年10月18日・/root/editorial_independent_review | 確認済み。タイトルは末尾の重複検索語等を省く短い表記で対象同定を変えない。 |
| T02 | 動画公開日10月17日 | YouTube publishDate | 同上 | 確認済み。時差変換しても日本の日付10月17日。紹介日へ転記していない。 |
| T03 | チームの選手5名 | YouTube説明欄の冒頭・チーム一覧 | 同上 | 確認済み。スロミック・エイキは説明欄先頭の表記にも一致。音声誤認名を採用していない。 |
| T04 | リーダー/メンバー/ルーキーの区分 | 一撃のテンガイ表 | 同上 | 条件付き確認。近接注記で一撃を報道として表示。動画説明欄だけで役割まで確認したとは扱わない。 |
| T05 | 本編11月1日20時予定 | YouTube説明欄のバトル本編案内 | 同上 | 確認済み。2026年の当該シーズン、日曜の11月1日と一致。テンガイ初戦前編の公開日と断定しない制限が同じ段落に残る。 |
| T06 | overview/コメントの印象・得意機種への期待 | 本人提供原文、overview近接注記 | 同上 | 対象外・考察。公式の選手評価・実戦結果予測へ昇格せず本人の見立てと明示。GOD/吉宗/モンキーターンは仕様解説ではなく期待・印象。 |
| T07 | 本人コメント7段落 | 親から受領した00:08本人原文 | 同上 | 内容適合。最も安定感を感じる、3人への安心感、まりも/シズコの引き、レビンの機種の深さ/チームのための挑戦、未知の2人への期待の意味を保持。口語の「ぶっ飛んだ」「一撃かまして」を保持。 |
| T08 | 未確認経歴・規約・初出場・初戦前編を追加しない | 本文/コメント全文と本人原文の差分 | 同上 | 確認済み。同期・ライバル・14年・同年齢・初出場トップバッター・弟子・出場規約詳細・収録終了推測を採用していない。これらを検証済みの事実とは記録しない。 |
| T09 | シズコ＝七瀬静香 | 本人原文で3人の並びと七瀬静香→シズコの参照 | 同上 | 本人の呼称として適合。新しい公称の事実へ昇格させない。 |
| T10 | 紹介日10月18日と新着の種別 | JSON updated/sources・latest追加entry | 同上 | 確認済み。紹介日として登録、動画公開日や本編予定日と区別。既存新着を除去せず1件追加。 |
| T11 | 一覧/トップ/リーグ相互リンク | 基準JSONとの比較・新ページのrelated | 同上 | 確認済み。新カード/トップ1リンク/テンガイwatch_slugと対応リンクだけ除くと旧全内容一致。リーグ日程・収録状態・確認日は不変。 |
| T12 | 共有画像とメタ情報 | 2PNGを実際に開いて目視、JSON share_lines | 同上 | タイトル・期待の表現・10月18日が一致、文字切れなし。SNSカード表示やブラウザーの実表示の確認ではない。 |

## 回帰検査の変更レビュー

- `check_editorial.py`：リーグ全体の無条件除外ではない。テンガイ1件のwatch_slugが指定値であることを要求し、そのキーだけ除いて旧データ全体と比較。新JSONも上記SHAに固定。他のデータ・本人コメント・安全保護の比較を維持。
- `check_sao2.py`：リーグ追加リンク1個と一覧追加カード1個だけを明示的に取り除き、一覧の更新日以外は旧オブジェクト全体と比較。元の数値・条件・全既存記事・安全資材比較は維持。
- 独自に`python3 scripts/slot-tankyu/check_editorial.py`および`python3 scripts/slot-tankyu/check_sao2.py`を実行し両方合格。
- 追加でmain a909444基準のhome/listing/リーグJSON・latest/data leagueを独自比較。今回の承認された追加だけ除くと旧内容に完全一致。
- 新紹介JSONと生成HTMLの完全一致を独自確認。CSP/ガード/外部YouTubeボタンのtarget/relは既存共通テンプレートのまま。動画埋め込み・転載画像・トラッカー・有料依存なし。

## 指摘・解消と判定

- 修正必須の内容不一致：なし。
- 初期確認時は本人原文が見えていなかったため親に照合資料を依頼。全文の転送受領後、T06〜T09を照合して解消。単なる役割名を独立性の根拠とせず、元資料を独自取得して確認した。
- 独立内容検証：**対象版は内容適合**。T04の報道区分とT05〜T06の制限を保持する条件。
- 映像・字幕の直接照合、PC/スマホのブラウザー実表示・クリック・別タブ動作・横スクロール、SNS実カード表示：**未実施**。
- 安全/回帰/公開資材検査・秘密情報検査の全項目は実装担当の当該版結果と合わせて判断。本記録で全体を合格としない。
- 総合公開候補判定：**実表示未実施につき保留**。この記録は公開承認の代替ではない。ユーザーが未実施を承知して今回の公開を指示した範囲は、親担当の承認記録に従う。
- 対象を変更した場合は新版の再照合とSHA更新が必要。旧版検証の流用は禁止。

## 対象版SHA-256

| ファイル | SHA-256 |
|---|---|
| `scripts/slot-tankyu/pages/watch-tengai-golden-manes.json` | `f21f33428691055dba7190e95524a1f864cf115221bc1cf6e7aafd99ef806cc8` |
| `scripts/slot-tankyu/pages/watch-listing.json` | `bdd2b6533721cb40f641bbecdcff3fe6e7f6b49955291472d88936553bd6fe62` |
| `scripts/slot-tankyu/pages/home.json` | `f0eaedd483276e76d31edddf491b6325b0e8bcce452e345bfefc19cdb3b98083` |
| `scripts/slot-tankyu/data/latest.json` | `339acdf6ed9ce995fc64bdf2c967dfadccbd155c86d63240e5311d4bb858c0e3` |
| `scripts/slot-tankyu/data/league-4th.json` | `2962e49bd9dbc17247a44ac5852014985fc34807df9889634e1ffe2611d47eb6` |
| `scripts/slot-tankyu/pages/league-4th.json` | `930ee78aa56610a334277366841b0b2f51c1169d6090ef882874ce6dc9a53b18` |
| `scripts/slot-tankyu/check_editorial.py` | `b10b2e9fc720112352c9a08285b18f2b24b26a092698cd51207c520c1bc31a76` |
| `scripts/slot-tankyu/check_sao2.py` | `4755d872ecded194b4397069ce64f20e77103ff640f7f2dab451f3513cecd62a` |
| `docs/slot-tankyu/watch/tengai-golden-manes-rally/index.html` | `58ab8963536af5d69d9801e47eb5099a481e4b10dd1caec0322a1e667f9bdcef` |
| `docs/slot-tankyu/watch/index.html` | `ffdcee480e4ffe3c1029ada10ad4711720081eb56fdef9631a6f06a7b38734a9` |
| `docs/slot-tankyu/index.html` | `9f2bedc634bfa5ec62b8d38c06c04879ccd02ceb1f332fafda6f3a5b69418860` |
| `docs/slot-tankyu/league/777league/index.html` | `8edb8c6a79b847949218b5fc999057850690584762b11a5f8afd8f1156bce878` |
| `docs/slot-tankyu/assets/share-watch.png` | `78c2974a2777100f0a0a8bb11643dcd7c2594ac2cbc549ae2934ada7330d24b5` |
| `docs/slot-tankyu/assets/share-watch-tengai-golden-manes.png` | `58a22c482268984a7853fdf697ff83e007393c1f779a97ad3299449150cb578e` |
