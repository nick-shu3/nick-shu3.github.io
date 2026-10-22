# 10/21高崎終了・新台5機種追加の根拠表

確認日：2026年10月22日。担当：/root。基準main：333a2620882d2046af0a31d8f2d8aebb4a602066。
本人の「高崎は終了に変更」「新台カレンダーで未掲載のを掲載」「決起集会は別途」に基づく。今回の5機種は前回候補に挙げた未掲載分で、全新台の網羅やメーカー確定日一覧ではない。本文の参照日付はP-WORLD掲載予定。ライザとシャカラッシュは一撃との相違を同じ行に明記し、一撃リンクも付ける。

## 固定版

| 対象 | SHA-256 |
|---|---|
| `data/league-4th.json` | `8638b4d870c79ba8f151d41323e377d8c33ef82ad9634cb9728005a08706aa50` |
| `data/new-machines.json` | `98d6310e0cd8921be19d98fb2214e8ab115054096cc8685ef4d80b5f1e5d25a8` |
| `pages/league-4th.json` | `d74151f0dde8f34a914a93e5be3fa1bea11df9a0ece7921344553a3c62452470` |
| `pages/new-machines.json` | `722c1634eafec92e5164b39d504479c990056c103aca093446e8868d163a1da2` |

## 主張と元資料

| ID | 原稿箇所・主張 | 資料URL | 確認箇所・範囲 | 確認日 | 状態・残す条件 | 担当 |
|---|---|---|---|---|---|---|
| T1 | 高崎10/21はBLUE第5回戦 | https://x.com/777_LEAGUE/status/2112438699401363967 | 10/20付公式告知の10/21・BLUE5・高崎本店・橘リノを含む4名 | 2026-10-22 | 確認済み：開催予定と終了証拠を別にする | /root |
| T2 | 同回の収録終了 | https://x.com/Rino_Tachi/status/2112829620567556492 | 10/21付本人原投稿の高崎本店777リーグ収録終了明記。T1と照合 | 2026-10-22 | 確認済み：動画公開・勝敗は変更しない | /root |
| N1 | 魔女と野獣：12/21予定・オレンジ | https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi ; https://www.fujimarukun.co.jp/products/l_majo/ | 日程表12/21欄とメーカー欄、藤商事公式製品名・製品掲載。導入日画像は親担当未確認 | 2026-10-22 | 条件付き確認：日付は日程資料、製品掲載のみ公式確認と記載 | /root |
| N2 | Lブルーリフレクション帝：12/21予定・オリンピア | https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi ; https://www.heiwanet.co.jp/products/pachislot/sbr1/ | 日程表12/21欄・メーカー欄。平和公式本文は2026年12月まで | 2026-10-22 | 条件付き確認：公式の月予定と資料の具体日を同じ行で区分 | /root |
| N3 | ライザのアトリエ：P-WORLD1/12予定・北電子 | https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi ; https://www.kitadenshi.co.jp/slot/ryza/ ; https://1geki.jp/newmachinecalender/202701/ | P-WORLD1/12欄・メーカー欄、北電子公式ホームから製品ページ。対照一撃は1/18 | 2026-10-22 | 条件付き確認：P-WORLD1/12と一撃1/18・具体日は要確認を行内表示。メーカー確定日と扱わない | /root |
| N4 | モンキーターンRED：1/12予定・セブンリーグ | https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi ; https://yamasa-next.co.jp/slot/mktrd/ | 日程表1/12欄・メーカー欄、山佐の製品掲載・公式機種名。一撃も1/12 | 2026-10-22 | 条件付き確認：製品掲載は公式、日付は日程資料 | /root |
| N5 | シャカラッシュ：P-WORLD1/25予定・マルホン | https://www.p-world.co.jp/database/machine/introduce_calendar.cgi?type=Pachi ; https://1geki.jp/newmachinecalender/202701/ | P-WORLD1/25欄・メーカー欄。一撃は1/12 | 2026-10-22 | 条件付き確認：両日付とメーカー具体日未確認を行内表示。一方を確定日として選ばない | /root |

## 探索方法と取得結果

- 正式名＋メーカー公式の検索、メーカーの製品入口・公式製品ページを探索。P-WORLD公開カレンダーの本文をWeb取得し、更新日2026/10/22・対象5件の欄を確認。検索見出しだけで判定しない。
- X2件はWeb取得エラー、同じ公開URLの通常HTTP GETで200、本文と年月日を確認。ログインや制限回避はしていない。転載は根拠に加えていない。投稿内の11/5初戦配信という別の主張は今回の高崎回配信日へ転記しない。
- 北電子公式ホームのライザ製品リンク、山佐公式ホームのRED掲載と公式機種サイト、平和公式10/19製品掲載・製品ページ、藤商事の製品掲載を読んだ。画像中心のページを全仕様確認済みとは扱わない。
- マルホン公式ホーム・スロット入口とユニバーサルのホーム・IRニュース一覧も探索したが、親担当はシャカラッシュのメーカー具体日を確認できず、公式URLはnull。発売元・製造元の追加主張や仕様は今回載せない。
- 一撃2027/1月カレンダー本文（表示更新日10/17）の1/12シャカ・RED、1/18ライザを照合。P-WORLDとの差を削らず保持する。これは地域・店舗でずれる原因まで確認したことを意味しない。

## 変更境界と検証

既存12機種のオブジェクトを保持。他41収録行・決起集会rallies・全体の動画設定・日程照合日・表示基準日を保持。高崎の旧予定と旧確認日をstatus_historyへ保存。新着登録を追補、カレンダーの共有画像だけ10/22へ再生成。

終了の証拠日付検査は各回のstatus_checked_atを使うよう修正。日程全体の照合日を進めず個別の終了を追補するデータ設計と整合させる。証拠日より後の終了を拒否する負例を追加。旧27件・42件境界fixture、今回対象外保持、17機種・追加5件・日程差注記・代替URL危険値拒否を検査。SHA固定値更新はこの独立レビュー対象版だけに限定。

check.py / check_editorial.py / check_sao2.py / security.cjs / security-regression.cjs / release.cjs / git diff --check 合格。共有画像を目視し日付・日本語を確認。ブラウザー・実機Safari・SNS実カードは未実施。CSS/レイアウト変更なし。Gitleaks最終スキャン・PR HEAD verify・Pages・配信一致は公開工程で確認する。
