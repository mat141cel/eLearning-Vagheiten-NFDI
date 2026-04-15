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

IFRAME_URL = "https://mat141cel.github.io/eLearning-Vagheiten-NFDI/content/digital_scientific_data_tables"


def norm(s):
    return (s or "").strip().lower()


def login(s):
    r = s.post(
        LOGIN_URL,
        params={"log_him_in": ""},
        data={"username": USER, "password": PWD},
        allow_redirects=True,
    )

    if "Zugangsdaten falsch" in r.text or "login" in r.url.lower():
        raise RuntimeError("Login failed")

    print("login OK")


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
                raw = html[i:j + 1]
                break
    else:
        raise RuntimeError("tree not found")

    data = json.loads(raw.replace("'", '"'))
    out = {}

    def walk(n):
        if isinstance(n, dict):
            t = n.get("text", "").split("[")[0].strip()
            if t:
                out[norm(t)] = int(n["id"].replace("node_", "")) if "id" in n else None
            for c in n.get("children", []):
                walk(c)
        elif isinstance(n, list):
            for x in n:
                walk(x)

    walk(data)
    return out


def extract_subtitles(path="content"):
    out = {}

    for f in Path(path).rglob("*.qmd"):
        subtitle = None

        for line in f.read_text(encoding="utf-8").splitlines():
            if line.startswith("subtitle:"):
                subtitle = line.split(":", 1)[1].strip().strip('"').strip("'")
                break

        if subtitle:
            out[norm(subtitle)] = f.name

    return out


def compare(site, local):
    matches, only_local, only_site = [], [], []

    for title, file in local.items():
        if title in site:
            matches.append((file, title, site[title]))
        else:
            only_local.append((file, title))

    for title, sid in site.items():
        if title not in local:
            only_site.append((title, sid))

    return matches, only_local, only_site


def add_iframe(session, node_id, iframe_url):
    page_id = f"node_{node_id}"

    iframe_html = (
        f'<p><iframe frameborder="0" height="800" '
        f'src="{iframe_url}" width="100%"></iframe></p>'
    )

    r = session.post(
        DESIGNER_URL,
        params={"save": "", "page_id": page_id},
        data={"page_content": iframe_html},
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": f"{DESIGNER_URL}?save&page_id={page_id}",
        },
    )

    if r.status_code != 200:
        raise RuntimeError(f"update failed for {page_id} ({r.status_code})")


def main():
    if not USER or not PWD:
        raise RuntimeError("missing env vars")

    s = requests.Session()
    login(s)

    site = fetch_tree_map(s)
    local = extract_subtitles()

    matches, only_local, only_site = compare(site, local)

    print("\nMATCHES")
    for f, t, sid in matches:
        print(f, "→", t, "→", sid)

        # only update when we have a valid node id
        if sid is not None:
            add_iframe(s, sid, IFRAME_URL)

    print("\nONLY LOCAL")
    for f, t in only_local:
        print(f, "→", t)

    print("\nONLY SITE")
    for t, sid in only_site:
        print(t, "→", sid)


if __name__ == "__main__":
    main()