#!/usr/bin/env python3
"""Convert the snapshot's legal pages into structured JSON for the Vue app.

Walks the rendered HTML and emits an ordered list of blocks
({h2|h3|p|ul|note}) so the rebuild renders the exact same text without
anyone retyping it.
"""
import os, re, html, json

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "site_snapshot", "_original_html")
OUT = os.path.join(BASE, "ironscope-site", "src", "content", "legal.json")

PAGES = {
    "terms": "Terms & Conditions",
    "eula": "End User License Agreement",
    "agreement": "Service Agreement",
}

TAG = re.compile(
    r"<(?P<tag>h1|h2|h3|h4|p|li|ul|/ul)\b[^>]*>(?P<body>.*?)(?=<(?:h1|h2|h3|h4|p|li|ul|/ul|/div|/main|footer)\b)",
    re.S | re.I)


def text_of(frag):
    t = re.sub(r"<br\s*/?>", " ", frag, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def main():
    out = {}
    for slug, title in PAGES.items():
        raw = open(os.path.join(SRC, slug + ".html"), encoding="utf-8").read()
        raw = re.sub(r"<script.*?</script>", "", raw, flags=re.S | re.I)
        raw = re.sub(r"<style.*?</style>", "", raw, flags=re.S | re.I)
        # confine to <main>, so nav/footer chrome is excluded
        m = re.search(r"<main\b[^>]*>(.*?)</main>", raw, re.S | re.I)
        body = m.group(1) if m else raw

        blocks, bullets, intro, eyebrow, updated = [], [], None, None, None
        for mt in TAG.finditer(body):
            tag = mt.group("tag").lower()
            txt = text_of(mt.group("body"))
            if tag == "li":
                if txt:
                    bullets.append(txt)
                continue
            if bullets and tag != "li":
                blocks.append({"type": "ul", "items": bullets})
                bullets = []
            if not txt or tag in ("ul", "/ul"):
                continue
            if tag == "h1":
                intro = txt
            elif tag in ("h2", "h3", "h4"):
                blocks.append({"type": "h2" if tag == "h2" else "h3", "text": txt})
            elif tag == "p":
                if re.match(r"(?i)^(last updated|effective)", txt) and updated is None:
                    updated = txt
                else:
                    blocks.append({"type": "p", "text": txt})
        if bullets:
            blocks.append({"type": "ul", "items": bullets})

        # the short line above the h1 is the eyebrow; drop it from body flow
        if blocks and blocks[0]["type"] == "p" and len(blocks[0].get("text", "")) < 40:
            eyebrow = blocks.pop(0)["text"]

        out[slug] = {
            "slug": slug,
            "title": intro or title,
            "navTitle": title,
            "eyebrow": eyebrow,
            "updated": updated,
            "blocks": blocks,
        }
        words = sum(len(b.get("text", "")) + sum(len(i) for i in b.get("items", []))
                    for b in blocks)
        print("%-11s %3d blocks  %6d chars  updated=%s"
              % (slug, len(blocks), words, (updated or "-")[:40]))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print("\nwrote " + OUT)


if __name__ == "__main__":
    main()
