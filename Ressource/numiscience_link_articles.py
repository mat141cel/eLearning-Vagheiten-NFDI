import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE = "https://pecunia.zaw.uni-heidelberg.de/NumiScience"
LOGIN_URL = f"{BASE}/login/?log_him_in"
TREE_URL = f"{BASE}/admin-managepages/"
DESIGNER_URL = f"{BASE}/admin-managepages/designer"

USER = (os.getenv("NUMISCIENCE_USER") or "").strip()
PWD = (os.getenv("PASSWORD") or "").strip()

IFRAME_BASE = "https://mat141cel.github.io/eLearning-Vagheiten-NFDI"


def norm(s):
    return (s or "").strip().lower()


def login(s):
    r = s.post(
        LOGIN_URL,
        params={"log_him_in": ""},
        data={"username": USER, "password": PWD},
    )
    if "Zugangsdaten falsch" in r.text or "login" in r.url.lower():
        raise RuntimeError("login failed")


def fetch_tree_map(s):
    html = s.get(TREE_URL).text

    i = html.find("'data':")
    i = html.find("[", i)

    depth = 0
    for j in range(i, len(html)):
        if html[j] == "[":
            depth += 1
        elif html[j] == "]":
            depth -= 1
            if depth == 0:
                data = json.loads(html[i:j + 1].replace("'", '"'))
                break

    out = {}

    def walk(n):
        if isinstance(n, dict):
            t = n.get("text", "").split("[")[0].strip()
            if t:
                out[norm(t)] = int(n["id"].replace("node_", "")) if n.get("id") else None
            for c in n.get("children", []):
                walk(c)
        else:
            for x in n:
                walk(x)

    walk(data)
    return out


def extract_local(path="content"):
    base = Path(path)
    out = {}

    for f in base.rglob("*.qmd"):
        text = f.read_text(encoding="utf-8")
        for line in text.splitlines():
            if line.startswith("subtitle:"):
                title = norm(line.split(":", 1)[1].strip().strip('"').strip("'"))
                rel = f.relative_to(base).with_suffix("").as_posix()
                out[title] = rel
                break

    return out


def add_iframe(s, node_id, url):
    page_id = f"node_{node_id}"

    html = f"""
<iframe src="{url}" style="width:100%;height:90vh;border:0;"></iframe>
"""

    r = s.post(
        DESIGNER_URL,
        params={"save": "", "page_id": page_id},
        data={"page_content": html},
        headers={"Referer": f"{DESIGNER_URL}?save&page_id={page_id}"},
    )

    if r.status_code != 200:
        raise RuntimeError(f"update failed {page_id}")


def main():
    if not USER or not PWD:
        raise RuntimeError("missing env vars")

    s = requests.Session()
    login(s)

    site = fetch_tree_map(s)
    local = extract_local()

    for title, node_id in site.items():
        if not node_id:
            continue
        if title in local:
            url = f"{IFRAME_BASE}/content/{local[title]}"
            add_iframe(s, node_id, url)


if __name__ == "__main__":
    main()