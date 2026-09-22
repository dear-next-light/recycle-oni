# RECYCLE ONI v0.1.2 素材制作

ユーザー提供の参考画像を画風・密度の参考にし、組み込み画像生成でオリジナルの施設・小鬼・トラック・静的背景を制作。参考画像全体をゲーム画面として使用していません。UIの文字・看板・数値・操作ボタンはCanvasまたはHTML/CSSです。

## 制作指示の要約（再制作向け）

- 共通：親しみやすい日本のリサイクル拠点。描き込まれた明るい2Dゲームイラスト。読みやすい輪郭、斜め上から見た正面寄りの視点。文字・UI・ロゴは素材へ描かない。
- 施設：青い洗浄工場（水槽と容器）、紫の分解工場（電子機器と部品）、黄色の修理工場（工具と家電）、赤い圧縮工場（プレスと資源ブロック）、緑のコンポスト（木箱・土・植物）。各施設が分離した素材として切り出せる余白、透明背景。
- 小鬼：青・赤・紫・黄・緑の2〜3頭身キャラクター、小さな角、コミカルで怖すぎない表情、全身、透明背景。
- トラック：横から見た日本の小型回収車、段ボール・容器・家電・ごみ袋を積載、透明背景。
- 背景：上部に日本の住宅街と歩道、横一直線の道路、その下に広い砂地の作業場、外周にフェンス・植物・街灯・パレット。工場・キャラクター・車・UIは含めない。動かない部分のみを1枚に統合。

## 配布素材

保存先は dist/assets/。WebP圧縮（品質82付近）、透明素材はアルファ保持。背景1536×896、施設320×320、小鬼144×184、車384×220。ファイル名末尾 -v012.webp。全12点合計559,558 bytes。原寸の生成PNGは配布しません。

動く要素は独立Canvas描画。施設と背景は静的Canvasへキャッシュし、小鬼は座標・傾き・上下動でアニメーションします。画像取得に失敗しても手描きCanvasの代替表示でゲームを継続できます。

## v0.1.3 空荷トラック

組み込みimage_gen編集を使用。保存先：dist/assets/truck-empty-v013.webp（384×220）。元のtruck-v012.webpを編集対象とし、他の素材は再生成していません。

使用した編集指示：

Edit target: supplied isolated 2D game truck sprite. Remove ALL rubbish and cargo from the open truck bed so it is completely empty. Preserve the exact green-and-white truck body, wheel positions, cabin, perspective, orientation facing right, outlines, proportions and existing canvas framing. The empty inside of the bed should be visible, with no bags, bottles, cardboard or appliances. Do not change vehicle design. Actual transparent background with alpha, no ground, no text, no shadow outside existing sprite. This is the empty-load variant for the same game truck; matching silhouette and alignment are essential.
