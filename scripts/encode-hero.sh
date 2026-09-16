#!/usr/bin/env bash
# Encode hero source -> hero.av1.mp4 (AV1) + hero.webm (VP9 fallback)
# Usage: ./scripts/encode-hero.sh [path/to/source.mp4]
# Requires: ffmpeg with libaom-av1 + libvpx-vp9
#
# Defaults are tuned for ~700-900KB output at 720p24, 7s loop.
# Override via env: SS, T, CRF_AV1, CRF_VP9, FPS, HEIGHT

set -euo pipefail

SRC="${1:-public/hero.mp4}"
OUT_AV1="public/hero.av1.mp4"
OUT_VP9="public/hero.webm"
SS="${SS:-0}"
T="${T:-7}"
FPS="${FPS:-24}"
HEIGHT="${HEIGHT:-720}"
CRF_AV1="${CRF_AV1:-33}"
CRF_VP9="${CRF_VP9:-36}"
MAXRATE_AV1="${MAXRATE_AV1:-1100k}"
BUFSIZE_AV1="${BUFSIZE_AV1:-2200k}"
MAXRATE_VP9="${MAXRATE_VP9:-1200k}"
BUFSIZE_VP9="${BUFSIZE_VP9:-2400k}"

cleanup() {
  rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree
}
trap cleanup EXIT

if [[ ! -f "$SRC" ]]; then
  echo "Error: source not found: $SRC" >&2
  echo "Usage: $0 [path/to/source.mp4]" >&2
  exit 1
fi

SCALE="scale='min(${HEIGHT},ih)':-2:flags=lanczos,fps=${FPS}"

echo "▶ Source:  $SRC"
echo "▶ Trim:    -ss $SS -t $T"
echo "▶ Scale:   ${HEIGHT}p${FPS}, CRF av1=$CRF_AV1 / vp9=$CRF_VP9"
echo ""

# ── AV1: 2-pass for better bit allocation ─────────────────────
echo "▶ [1/4] AV1 pass 1 (analysis)..."
ffmpeg -hide_banner -loglevel warning -y \
  -ss "$SS" -t "$T" -i "$SRC" \
  -vf "$SCALE" \
  -c:v libaom-av1 -b:v 800k -minrate 400k -maxrate "$MAXRATE_AV1" -bufsize "$BUFSIZE_AV1" \
  -cpu-used 6 -tile-columns 2 -tile-rows 1 \
  -g $((FPS * 2)) -keyint_min $((FPS * 2)) \
  -an -pix_fmt yuv420p \
  -pass 1 -f null /dev/null

echo "▶ [2/4] AV1 pass 2 (encode)..."
ffmpeg -hide_banner -loglevel warning -y \
  -ss "$SS" -t "$T" -i "$SRC" \
  -vf "$SCALE" \
  -c:v libaom-av1 -crf "$CRF_AV1" -b:v 800k -minrate 400k -maxrate "$MAXRATE_AV1" -bufsize "$BUFSIZE_AV1" \
  -cpu-used 6 -tile-columns 2 -tile-rows 1 \
  -g $((FPS * 2)) -keyint_min $((FPS * 2)) \
  -movflags +faststart \
  -an -pix_fmt yuv420p \
  -pass 2 "$OUT_AV1"

# ── VP9: 2-pass fallback ─────────────────────────────────────
echo "▶ [3/4] VP9 pass 1 (analysis)..."
ffmpeg -hide_banner -loglevel warning -y \
  -ss "$SS" -t "$T" -i "$SRC" \
  -vf "$SCALE" \
  -c:v libvpx-vp9 -b:v 900k -minrate 400k -maxrate "$MAXRATE_VP9" -bufsize "$BUFSIZE_VP9" \
  -deadline good -cpu-used 2 \
  -row-mt 1 -tile-columns 2 -frame-parallel 1 \
  -g $((FPS * 2)) -keyint_min $((FPS * 2)) \
  -an -pix_fmt yuv420p \
  -pass 1 -f null /dev/null

echo "▶ [4/4] VP9 pass 2 (encode)..."
ffmpeg -hide_banner -loglevel warning -y \
  -ss "$SS" -t "$T" -i "$SRC" \
  -vf "$SCALE" \
  -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 900k -minrate 400k -maxrate "$MAXRATE_VP9" -bufsize "$BUFSIZE_VP9" \
  -deadline good -cpu-used 2 \
  -row-mt 1 -tile-columns 2 -frame-parallel 1 \
  -g $((FPS * 2)) -keyint_min $((FPS * 2)) \
  -an -pix_fmt yuv420p \
  -pass 2 "$OUT_VP9"

echo ""
echo "✓ Done. Final sizes:"
ls -lh "$OUT_AV1" "$OUT_VP9" | awk '{printf "  %-6s  %s\n", $5, $9}'

AV1_BYTES=$(stat -c%s "$OUT_AV1" 2>/dev/null || stat -f%z "$OUT_AV1")
VP9_BYTES=$(stat -c%s "$OUT_VP9" 2>/dev/null || stat -f%z "$OUT_VP9")
TOTAL=$((AV1_BYTES + VP9_BYTES))
TOTAL_KB=$((TOTAL / 1024))

echo ""
echo "  Total: ~${TOTAL_KB}KB"
echo ""
echo "Tuning knobs (env vars, no edit needed):"
echo "  SS=$SS             Start offset (try 2, 5, 10 for best loop segment)"
echo "  T=7                Duration in seconds (6 for smaller, 10 for longer loop)"
echo "  FPS=24             Frame rate (24 cinematic, 30 smoother but bigger)"
echo "  HEIGHT=720         Vertical resolution (540 smaller, 1080 sharper but 2x size)"
echo "  CRF_AV1=33         Lower = better quality / bigger (30 great, 36 smaller)"
echo "  CRF_VP9=36         Same logic for VP9 fallback"
echo "  MAXRATE_AV1=1100k  Cap bitrate spikes (raise if motion-heavy scenes)"
