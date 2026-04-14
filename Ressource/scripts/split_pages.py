# scripts/split_pages.py

from pathlib import Path
import re

INPUT_DIR = Path("content")
OUTPUT_DIR = Path("content/generated")

# matches :::page{id="filename.qmd"} ... :::
PAGE_RE = re.compile(
    r":::page\{id=\"(.*?)\"\}\s*(.*?)\s*:::",
    re.DOTALL
)

def split_file(path: Path):
    text = path.read_text(encoding="utf-8")

    matches = PAGE_RE.findall(text)

    if not matches:
        return

    out_dir = OUTPUT_DIR / path.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    for filename, body in matches:
        # ensure .qmd extension
        if not filename.endswith(".qmd"):
            filename += ".qmd"

        content = body.strip()

        out_file = out_dir / filename

        out_file.write_text(
            f"""---
title: {filename.replace('.qmd','')}
---

{content}
""",
            encoding="utf-8"
        )

        print(f"[split] {path.name} -> {out_file}")

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for qmd in INPUT_DIR.rglob("*.qmd"):
        if "generated" in qmd.parts:
            continue
        split_file(qmd)

if __name__ == "__main__":
    main()