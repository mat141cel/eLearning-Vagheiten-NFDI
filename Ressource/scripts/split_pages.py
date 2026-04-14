from pathlib import Path
import re

INPUT_DIR = Path("content")
OUTPUT_DIR = Path("content/numiscience")

PAGE_RE = re.compile(
    r":::page\{id=\"(?P<id>[^\"]+)\"\}\s*(?P<body>.*?)\s*:::",
    re.DOTALL
)

def normalize(name: str) -> str:
    name = name.strip()
    return name if name.endswith(".qmd") else name + ".qmd"


def extract(text: str):
    return [
        (m.group("id"), m.group("body").strip())
        for m in PAGE_RE.finditer(text)
    ]


def wrap(body: str, title: str) -> str:
    return f"""---
title: {title}
---

{body}
"""


def split_file(path: Path):
    text = path.read_text(encoding="utf-8")
    pages = extract(text)

    if not pages:
        return

    out_dir = OUTPUT_DIR / path.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    for name, body in pages:
        filename = normalize(name)

        title = Path(filename).stem.replace("_", " ").title()

        out_file = out_dir / filename

        out_file.write_text(
            wrap(body, title),
            encoding="utf-8"
        )

        print(f"[split] {path.name} -> {out_file}")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for qmd in INPUT_DIR.rglob("*.qmd"):
        if "numiscience" in qmd.parts:
            continue
        split_file(qmd)


if __name__ == "__main__":
    main()