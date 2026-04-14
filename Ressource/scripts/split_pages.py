from pathlib import Path
import re

INPUT_DIR = Path("content")
OUTPUT_DIR = Path("content/generated")

# :::page{id="filename.qmd"} ... :::
PAGE_RE = re.compile(
    r":::page\{id=\"(?P<id>[^\"]+)\"\}\s*(?P<body>.*?)\s*:::",
    re.DOTALL
)

def normalize_filename(name: str) -> str:
    name = name.strip()

    if not name.endswith(".qmd"):
        name += ".qmd"

    return name


def extract_pages(text: str):
    return [
        (m.group("id"), m.group("body").strip())
        for m in PAGE_RE.finditer(text)
    ]


def wrap_qmd(content: str, title: str) -> str:
    return f"""---
title: {title}
---

{content}
"""


def split_file(path: Path):
    text = path.read_text(encoding="utf-8")

    pages = extract_pages(text)

    if not pages:
        return

    out_dir = OUTPUT_DIR / path.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    for raw_filename, body in pages:

        filename = normalize_filename(raw_filename)

        # derive a stable title
        title = Path(filename).stem.replace("_", " ").title()

        out_file = out_dir / filename

        out_file.write_text(
            wrap_qmd(body, title),
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