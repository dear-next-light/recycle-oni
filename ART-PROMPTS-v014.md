# v0.1.4 素材制作記録

組み込み image_gen を使用。開幕画像はユーザー提供画像をそのまま縮小・WebP圧縮（1440px幅）。生成素材は同画像を参照し、切り出しと縮小・WebP化のみ実施。

配布先: `dist/assets/opening-v014.webp`、`foreman-{calm,shout}-v014.webp`（192×192）、`oni-{wash,press,break,repair,compost}-v014.webp`（144×184）、`run-{wash,press,break,repair,compost}-v014.webp`（512×128 / 4コマ）、`cargo-v014.webp`（512×256 / 4列2段）。14ファイル合計514,288bytes。生成原寸PNGは配布しません。

## boss

Create a two-cell portrait sprite sheet, two equally sized square cells side by side. Reference supplied opening art: MATCH the large muscular adult red Oni foreman in center foreground, angular jaw, yellow eyes, large yellow horns, black work overalls with brass buckles, dark gloves. Same bold inked colorful shaded anime game illustration. Head and shoulders only, no hands or sack. LEFT cell stern calm closed mouth. RIGHT cell identical character and framing with mouth WIDE OPEN shouting a forceful encouraging command. Not a cute child. Both dark navy background. Identical size. No words, no frames, no UI. Canvas1024x512.

## run

Create transparent game sprite atlas matching small Oni workers in supplied opening art: yellow short horns, colored skin, big ears, short dark hair, dark work overalls and boots, gloves, cute stout proportions. NO tiger shorts. Exactly FOUR columns and FIVE rows, equal cells, canvas1024x1280. Row colors from top: blue, red, purple, yellow, green. COLUMN1 strict RIGHT SIDE PROFILE running pose A, nose/chest/feet pointing right. COLUMN2 same strict right side profile running pose B with opposite legs and arms. COLUMN3 BACK VIEW moving AWAY, no face. COLUMN4 FRONT VIEW moving toward viewer. All full body, identical scale and foot baseline within every cell, generous transparent margins, transparent alpha background. Columns1&2 must look sideways in direction of running, NEVER face camera, no crab walking. Strong clean outlines and shaded illustration matching reference. Empty hands, no props, no labels, no text, no grid lines.

## cargo

Create transparent sprite atlas with FOUR columns TWO rows in equal square cells canvas1024x512. Match painted outlined game illustration quality of recycling objects in reference. Each item centered with clear margins, slightly realistic material textures, 3/4 perspective, good silhouette at32px. Row1: crushed clear PET bottle with blue cap and torn label; dented silver drink can with orange band; worn taped brown cardboard parcel; folded worn pink cotton T-shirt with wrinkles. Row2: old black smartphone with cracked blue screen; yellow black AA battery with metal terminals; translucent tied bag containing vegetable scraps and banana peel; last cell empty. Exactly seven separate item icons. Actual transparent alpha background, no labels, no letters, no ground, no UI.

## 走行2コマ目の追加編集

Edit this exact transparent sprite atlas. Preserve all 4 columns x5 rows, exact canvas/cell grid, all character identities, colors, uniforms, scale, and transparency. Change ONLY the SECOND COLUMN in every row (the five right-facing side profile running figures). They must be a clearly DIFFERENT running frame: legs BOTH UNDER THE TORSO, front knee bent raised straight in front of chest, rear knee bent tucked under hips, both boots close together beneath belly. This is the passing/contact phase, while column1 stays extended long stride. Alternate the arms opposite to column1. Keep noses and torso strictly facing RIGHT, same head size and head position. Do NOT simply duplicate column1. Do not change columns1,3,4. No labels, no background.
