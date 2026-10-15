# 根拠表：フェイスメガタイガース決起集会の視聴メモ v1

- 執筆：/root。確認日：2026年10月15日。
- 対象：個別記事全体、番組一覧の追加カード・grid、homeのwatch紹介1文、リーグ決起集会表への感想リンクのみ。既存リーグの実戦状況・日程の全件再調査ではない。
- 独立検証：必須。別実行担当に依頼。今回の承認はコメント全文と記事実装・相互リンク。公開は未承認。

## 対象版

- `scripts/slot-tankyu/pages/watch-face-mega-tigers.json`: `d110023fa0d8dbe54347e926094de6c7c73ebb4772a617837e2a665e1f7deb35`
- `scripts/slot-tankyu/pages/watch-listing.json`: `bdd7340c5356fea2560e5d0b5fef4506345b69aab5eb05b913b4d1fdd80d2823`
- `scripts/slot-tankyu/pages/home.json`: `c2ac46fdc3ed235853725ca827288a09c4406a95b308a0ab49cdb3bc26d12c7e`
- `scripts/slot-tankyu/pages/league-4th.json`: `c78cfe0b398b9f9d295ff9731d6f0e6ceaa228c8e4a74cd8e08c8bd3feb75f29`
- `scripts/slot-tankyu/data/league-4th.json`: `a7ae9e6a2b2cf4693f0d1c80fdbd95690f017208547bc940824e1b8971f55979`
- `scripts/slot-tankyu/league_schedule.py`: `af1a8b9aa805d931568261874ec1a8d37bda5a0cbffb1dbc13cba46daf4e5d82`

## 主張と根拠

| 主張ID | 原稿箇所 | 主張・種別 | 資料URL | 確認箇所・短い要約 | 確認日 | 状態 | 担当 | 残す条件 |
|---|---|---|---|---|---|---|---|---|
| C1 | 個別video節・一覧カード | 頂 - ITADAKI - の決起集会動画／事実 | S1 | oEmbedのtitleとauthor_nameを前工程で取得 | 2026年10月15日 | 確認済み | /root | タイトル短縮、映像視聴済みとはしない |
| C2 | overview・description・一覧カード | チームが目指す姿・意気込み・関わり方を語る／本人視聴メモ | S2 | ユーザー提供要約と承認済み短縮案 | 2026年10月15日 | 条件付き確認 | /root | 概要直下に本人の視聴メモ由来と明記 |
| C3 | title・共有画像・author_comment | 作戦は分からなかったが熱い等の所感／本人コメント | S2 | 提供全文を最小校正して承認済み。6段落 | 2026年10月15日 | 対象外・考察 | /root | 人物評価を客観的事実にせず本人コメントのまま、感想を足さない |
| C4 | author_comment・sources | sasuke・橘リノ・たなちゅう・あさくら・天上アカネの名前／報道照合 | S3 | BLUEフェイスメガタイガースの5人一覧本文 | 2026年10月15日 | 条件付き確認 | /root | sourcesに一撃の報道で照合と明記、公式直接確認済みとしない |
| C5 | author_comment末段・コメント直前のoverview小注 | 11月1日本編公開開始予定／公式告知提供資料 | S4 | ユーザー提供公式告知文と既存leagueデータ：11月1日20:00 | 2026年10月15日 | 条件付き確認 | /root | コメント直前に提供された公式告知資料由来、放送＝動画公開予定と明記。原投稿は今回取得不可 |
| C6 | updated・sources・一覧カード | 紹介日10月15日／編集日付 | 外部URLなし（編集日付） | 今回の紹介日、動画公開日を推定していない | 2026年10月15日 | 確認済み | /root | 紹介日と公開日を区別 |
| C7 | league決起集会表・個別related | リーグから視聴メモへ、記事から日程表へ／内部導線 | S5 | rallyのwatch_slugと相対リンクを対応 | 2026年10月15日 | 確認済み | /root | 公式チャンネルリンクと既存予定・実戦状況は保持 |
| C8 | 個別overview・一覧 | 具体的展開を伏せた紹介／編集方針 | 対象外・考察 | ポーズ・初戦担当・動画展開を概要へ転載していない | 2026年10月15日 | 対象外・考察 | /root | 本人の非ネタバレ感想は保持 |

## 資料と探索範囲

- S1：`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=-Dfr-57rNFE&format=json`。公式メタデータ、前工程10月15日にタイトル『【チーム決起集会】フェイスメガタイガース - 777.LEAGUE4th 777リーグ4th【スリーセブンリーグ】@777PACHIGABU』、author_name『頂 - ITADAKI -』取得。原動画 `https://www.youtube.com/watch?v=-Dfr-57rNFE`。映像・公開日は未取得。独立担当が改めてメタデータを取得する。
- S2：10月15日ユーザー提供要約、6段落コメント全文と校正後の承認。公開URLなし（本人提供資料）。全会話や未採用素材を転載しない。
- S3：`https://1geki.jp/repo/20260817sammynw/`。一撃の二次報道。BLUEの当該チーム表：sasuke、たなちゅう／橘リノ／あさくら、ルーキー天上アカネ。本文読了。公式サイト `https://777league.jp/` はチーム紹介リンクを辿ったが `https://p-gabu.jp/sc/666/777league/company/` が403で選手名の本文を今回確認できず。旧メモの『朝倉青流』『茜店長』は採用しない。
- S4：`https://x.com/777_LEAGUE/status/2110204262278119909`。既存leagueデータと本人提供の公式告知文・画像で11月1日20:00を照合。今回web取得不可。第三者転載 `https://we.twstalker.com/face_850` の公式告知リポスト記載にも同内容あるが原投稿直接確認済みとはしない。コメントの日付は予定としてコメント直前の小注で範囲を明示。
- S5：公開予定の内部ページ `https://nick-shu3.github.io/docs/slot-tankyu/league/777league/#rallies` と今回のwatch記事。生成元 `league_schedule.py` と `data/league-4th.json`。今回変更は第1rallyのwatch_slugと表示導線だけ。

## 未確認

動画映像・公開日、公式選手紹介の今回の直接取得、公式X原投稿の今回の直接取得は未確認。本人メモと提供告知資料由来の範囲を本文にも明示し、詳細発言・仕様・動画展開は断定追加しない。
