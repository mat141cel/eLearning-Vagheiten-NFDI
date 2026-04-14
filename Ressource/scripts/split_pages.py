from pathlib import Path
import re

INPUT_DIR = Path("content")
OUTPUT_DIR = Path("numiscience")

PAGE_RE = re.compile(
    r":::page\{id=\"(?P<id>[^\"]+)\"\}\s*(?P<body>.*?)\s*:::",
    re.DOTALL
)

QMD_LINK_RE = re.compile(r"content/([a-zA-Z0-9_\-/]+)\.qmd")


def normalize(name: str) -> str:
    name = name.strip()
    return name if name.endswith(".qmd") else name + ".qmd"


def extract(text: str):
    return [
        (m.group("id"), m.group("body").strip())
        for m in PAGE_RE.finditer(text)
    ]


# ---------------------------
# LINK REWRITING (CORE FIX)
# ---------------------------
def rewrite_links(text: str) -> str:
    """
    Rewrites any reference to content/*.qmd → *.html
    Handles:
    - (content/file.qmd)
    - [text](content/file.qmd)
    - Windows paths
    """

    # normalize Windows paths first
    text = text.replace("\\", "/")

    # replace markdown links
    text = re.sub(
        r"\((content/[^)]+)\.qmd\)",
        lambda m: f"({Path(m.group(1)).name}.html)",
        text
    )

    # replace raw references (fallback)
    text = re.sub(
        r"content/([a-zA-Z0-9_\-/]+)\.qmd",
        lambda m: f"{Path(m.group(1)).name}.html",
        text
    )

    return text

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

        # IMPORTANT FIX
        body = rewrite_links(body)

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