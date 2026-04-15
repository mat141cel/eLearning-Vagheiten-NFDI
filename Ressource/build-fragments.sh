#!/usr/bin/env bash
set -e

SRC="content"
OUT="content/fragments"

mkdir -p "$OUT"

find "$SRC" -type f -name "*.qmd" | while read -r file; do
  filename=$(basename "$file")

  # skip combined
  if [[ "$filename" == *_combined.qmd ]]; then
    echo "skip: $filename"
    continue
  fi

  out="$OUT/${filename%.qmd}.inc.qmd"

  awk '
    BEGIN {in_yaml=0}
    /^---[[:space:]]*$/ {in_yaml = 1 - in_yaml; next}
    in_yaml == 0 {print}
  ' "$file" > "$out"

  echo "generated: $out"
done