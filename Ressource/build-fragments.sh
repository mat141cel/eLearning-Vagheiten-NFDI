#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo SCRIPT_DIR
SRC="$SCRIPT_DIR/content"
OUT="$SCRIPT_DIR/content/fragments"

mkdir -p "$OUT"

find "$SRC" -type f -name "*.qmd" | while read -r file; do
  filename=$(basename "$file")

  if [[ "$filename" == *_combined.qmd ]]; then
    echo "skip: $filename"
    continue
  fi

  out="$OUT/${filename%.qmd}.inc.qmd"

  awk '
    /^---[[:space:]]*$/ {in_yaml = 1 - in_yaml; next}
    in_yaml == 0 {print}
  ' "$file" > "$out"

  echo "generated: $out"
done