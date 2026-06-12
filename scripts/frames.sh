#!/usr/bin/env bash
# frames.sh — розбір відеозапису юзера (закони I1/I2): кадри + контактні листи.
# Використання: bash scripts/frames.sh "/шлях/Запис.mov" /tmp/td-name [fps]
set -euo pipefail
SRC="$1"; OUT="${2:-/tmp/td}"; FPS="${3:-1.2}"
mkdir -p "$OUT/f" "$OUT/sheets"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC" | sed "s|^|тривалість: |"
ffmpeg -hide_banner -loglevel error -i "$SRC" -vf "fps=$FPS,scale=1280:-2" -q:v 4 "$OUT/f/f-%03d.jpg"
( cd "$OUT" && ffmpeg -hide_banner -loglevel error -pattern_type glob -i 'f/f-*.jpg' -vf "scale=600:-2,tile=3x3" -q:v 5 sheets/s-%02d.jpg )
echo "кадрів: $(ls "$OUT/f" | wc -l | tr -d ' ') · листів 3x3: $(ls "$OUT/sheets" | wc -l | tr -d ' ') → $OUT/sheets/"
echo "Дивись листи по черзі (Read), на переходах — щільніше: ffmpeg -ss <сек> -t 3 -i \"$SRC\" -vf fps=6 ..."
