#!/usr/bin/env python3
"""Extract readable content from the snapshot into scratch text files."""
import os, re, html, glob, sys

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "site_snapshot", "_original_html")
OUT = sys.argv[1] if len(sys.argv) > 1 else "extracted"
os.makedirs(OUT, exist_ok=True)

BLOCK = r"(?:div|section|h[1-6]|p|li|tr|br|header|footer|nav|main|article|button|a|span|td|th)"


def clean(raw):
    t = re.sub(r"<script.*?</script>", "", raw, flags=re.S | re.I)
    t = re.sub(r"<style.*?</style>", "", t, flags=re.S | re.I)
    t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
    # mark block boundaries so structure survives
    t = re.sub(r"<h([1-6])[^>]*>", r"\n\n[H\1] ", t, flags=re.I)
    t = re.sub(r"</h[1-6]>", "\n", t, flags=re.I)
    t = re.sub(r"<li[^>]*>", "\n  - ", t, flags=re.I)
    t = re.sub(r"<(?:p|div|section|tr|br|header|footer|nav|main|article)[^>]*>",
               "\n", t, flags=re.I)
    t = re.sub(r"<button[^>]*>", "\n[BTN] ", t, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t)
    t = re.sub(r"[ \t\xa0]+", " ", t)
    t = re.sub(r" *\n *", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


for f in sorted(glob.glob(os.path.join(SRC, "*.html"))):
    name = os.path.splitext(os.path.basename(f))[0]
    raw = open(f, encoding="utf-8").read()
    title = re.search(r"<title>(.*?)</title>", raw, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)"', raw, re.S)
    body = clean(raw)
    out = []
    out.append("TITLE: " + html.unescape(title.group(1)) if title else "")
    out.append("DESC: " + html.unescape(desc.group(1)) if desc else "")
    out.append("=" * 60)
    out.append(body)
    txt = "\n".join(out)
    open(os.path.join(OUT, name + ".txt"), "w", encoding="utf-8").write(txt)
    print("%-14s %6d chars" % (name, len(txt)))
