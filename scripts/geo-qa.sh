#!/bin/bash
# geo-qa.sh — гейт геометрії для Хігсфілд-генерацій (relight/i2i/keyframes).
# Порівнює REF (оригінальний рендер) і GEN (згенерований кадр) по КОНТУРАХ,
# тому зміна освітлення (день/ніч) не валить перевірку, а зсув вікон/даху/перспективи — валить.
#
# Використання: geo-qa.sh REF.jpg GEN.jpg OUT_DIR [label]
# Вихід: OUT_DIR/<label>-overlay.png  (червоне=контури REF, зелене=GEN, жовте=збіг)
#        OUT_DIR/<label>-report.txt   (edge-diff score + вердикт)
# Скор: YAVG різниці edge-мап, 0 = ідеал. Пороги калібровані на smarts (див. GEO-QA-GATE.md):
#   ідентичні кадри = 0 · чесний relight день/ніч = 3.2–4.5 · реальна зміна фасаду = 8.6 · чужий ракурс = 27.5
#   ≤ 4.5  PASS   (рівень чесного relight: шум/листя/увімкнені вікна)
#   4.5–7  REVIEW (дивитись overlay очима — можлива локальна зміна)
#   > 7    FAIL   (геометрія/перспектива поїхала — перегенерувати)
# Overlay дивитись ЗАВЖДИ, навіть при PASS.
set -euo pipefail
REF="$1"; GEN="$2"; OUT="${3:-.}"; LABEL="${4:-geoqa}"
mkdir -p "$OUT"
# Порівнюємо на СПІЛЬНІЙ (меншій) ширині: різкий 4K проти апскейлу 1k інфлює скор
# різницею товщини контурів. Опційно GEOQA_CROP="w:h:x:y" (частки iw/ih у ffmpeg-виразі)
# зрізає сцену до самої будівлі — листя/машини/хмари не шумлять.
RW=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$REF")
GW=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$GEN")
W=$(( RW < GW ? RW : GW )); [ "$W" -gt 1920 ] && W=1920
CROPF=""
[ -n "${GEOQA_CROP:-}" ] && CROPF="crop=${GEOQA_CROP},"
# GEOQA_MACRO=1 — екстер'єр-режим: блюр гасить муар фальцевих ребер/текстур,
# лишаються тільки макро-контури. Пороги інші: PASS≤6.5 REVIEW≤7.5 FAIL>7.5.
EDGE="format=gray,edgedetect=low=0.08:high=0.18"; P1=4.5; P2=7
if [ "${GEOQA_MACRO:-}" = "1" ]; then EDGE="gblur=sigma=2.5,format=gray,edgedetect=low=0.1:high=0.25"; P1=6.5; P2=7.5; fi
ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$REF" >/dev/null # sanity
H=-2

ffmpeg -y -loglevel error -i "$REF" -vf "${CROPF}scale=${W}:${H},${EDGE}" "$OUT/_ref-edge.png"
ffmpeg -y -loglevel error -i "$GEN" -vf "${CROPF}scale=${W}:${H},${EDGE}" "$OUT/_gen-edge.png"
GH=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$OUT/_gen-edge.png")
RH=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$OUT/_ref-edge.png")
if [ "$GH" != "$RH" ]; then ffmpeg -y -loglevel error -i "$OUT/_gen-edge.png" -vf "scale=${W}:${RH}" "$OUT/_gen-edge2.png" && mv "$OUT/_gen-edge2.png" "$OUT/_gen-edge.png"; fi
W=${W}; H=${RH}

# скор: середня яскравість різниці edge-мап
ffmpeg -y -loglevel error -i "$OUT/_ref-edge.png" -i "$OUT/_gen-edge.png" -filter_complex \
  "[0:v][1:v]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=$OUT/_stats.txt" \
  -frames:v 1 -f null - 2>/dev/null

# оверлей: REF→червоний канал, GEN→зелений, screen-блендінг → жовте = збіг
ffmpeg -y -loglevel error -i "$OUT/_ref-edge.png" -i "$OUT/_gen-edge.png" -filter_complex \
  "[0:v]format=rgb24,lutrgb=g=0:b=0[r];[1:v]format=rgb24,lutrgb=r=0:b=0[g];[r][g]blend=all_mode=screen" \
  -frames:v 1 "$OUT/${LABEL}-overlay.png"

SCORE=$(grep -oE 'YAVG=[0-9.]+' "$OUT/_stats.txt" | head -1 | cut -d= -f2)
VERDICT="FAIL"
if awk -v s="$SCORE" -v p="$P1" 'BEGIN{exit !(s<=p)}'; then VERDICT="PASS"
elif awk -v s="$SCORE" -v p="$P2" 'BEGIN{exit !(s<=p)}'; then VERDICT="REVIEW"; fi
MODE="fine"; [ "${GEOQA_MACRO:-}" = "1" ] && MODE="macro"
echo "geo-qa($MODE): $LABEL | edge-diff YAVG=$SCORE | $VERDICT" | tee "$OUT/${LABEL}-report.txt"
rm -f "$OUT/_ref-edge.png" "$OUT/_gen-edge.png" "$OUT/_stats.txt"
