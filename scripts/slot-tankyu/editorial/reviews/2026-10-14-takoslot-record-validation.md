# 2026年10月14日 タコスロ実戦：生成・安全検査

- 対象：10月14日の機種別実戦、当日まとめ、既存の一覧・ガイド・トップへの紹介追加。
- 状態：ローカル候補。GitHub書き込み・公開は未実施。

## 検査結果

| 検査 | 結果 |
|---|---|
| security.cjs | 合格 |
| security-regression.cjs | 合格 |
| release.cjs | 合格 |
| check.py | 合格：16ページ、内部リンク・アンカー・メタデータ・共有画像 |
| git diff --check | 合格 |
| Gitleaks 作業ファイル・全履歴 | 合格：機密情報検出なし |
| 差枚・ボーナス分母・取得率 | 449−200＝249、820÷7＝117.1、19÷21＝90.5％を確認 |
| 実戦画像 | 4枚とも幅900px、EXIFなし。元画像を維持して切り出し・縮小 |
| ブラウザー表示 | 未実施。画像の目視点検と区別する |
| 外部リンク自動検査 | 未実施。check.pyは外部URLを検査しない |

## 原稿の対象版

- `record-tako-20261014.json`：`7a70c31b8bf47df229c544aeab1449b958d24ba6d31196bdba10f037e74baff0`
- `daily-20261014.json`：`be0d822c180205f3fb1350a50a3c9759081f96dcff92864c1209df1c0483fc78`
- `listing.json`：`8a031b766ac3e1587eb851ac3145cea598b9b2141a34699d9d1cb6601bed3f7a`
- `guide-tako.json`：`2997c9d1c5832356aea97bdccbc7b360e561dc62afbff6e64f5552c4f9adfa78`
- `home.json`：`5295dace7f37ce052fd5d8c94808227bd45e7fde44809efaf982c071046000bd`

独立内容検証は別担当の `2026-10-14-takoslot-record-independent-review.md` を参照。安全検査の合格だけで内容確認・表示確認・公開承認が済んだとは扱わない。
