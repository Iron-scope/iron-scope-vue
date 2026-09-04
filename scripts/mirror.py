#!/usr/bin/env python3
"""Mirror iron-scope.com into ./site_snapshot as a browsable static copy."""
import os, re, time, hashlib
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ORIGIN = "https://iron-scope.com"
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site_snapshot")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

PAGES = ["/", "/pricing", "/faq", "/about", "/requirements", "/contact",
         "/signup", "/login", "/terms", "/eula", "/agreement"]

SAME_SITE = ("iron-scope.com", "www.iron-scope.com")

seen_assets = {}   # abs url -> snapshot-root-relative local path (or None)
failed = []


def fetch(url, tries=3):
    for i in range(tries):
        try:
            req = Request(url, headers={
                "User-Agent": UA,
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.9",
            })
            with urlopen(req, timeout=45) as r:
                return r.read(), r.headers.get("Content-Type", "")
        except (HTTPError, URLError, TimeoutError, OSError) as e:
            if i == tries - 1:
                failed.append((url, str(e)))
                return None, None
            time.sleep(1.5 * (i + 1))
    return None, None


def page_path(route):
    """Local file path for a page route."""
    r = route.strip("/")
    return "index.html" if not r else r + "/index.html"


def asset_local_path(url):
    """Map an asset URL onto a local path under the snapshot root."""
    p = urlparse(url)
    path = unquote(p.path)
    if p.netloc and p.netloc not in SAME_SITE:
        base = "_external/" + p.netloc + path
    else:
        base = path.lstrip("/")
    if not base or base.endswith("/"):
        base += "index"
    if p.query:
        h = hashlib.md5(p.query.encode()).hexdigest()[:8]
        stem, ext = os.path.splitext(base)
        base = stem + "." + h + ext
    if not os.path.splitext(base)[1]:
        base += ".bin"
    # keep Windows happy
    base = re.sub(r'[:*?"<>|]', "_", base)
    return base


def save(relpath, data):
    full = os.path.join(ROOT, relpath.replace("/", os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as f:
        f.write(data)
    return full


def relative(from_file, to_file):
    """Relative href from one snapshot file to another."""
    frm = os.path.dirname(from_file)
    rel = os.path.relpath(to_file, frm if frm else ".")
    return rel.replace(os.sep, "/")


CSS_URL_RE = re.compile(rb"""url\(\s*['"]?([^'")]+)['"]?\s*\)""")
CSS_IMPORT_RE = re.compile(rb"""@import\s+['"]([^'"]+)['"]""")


def grab_asset(url):
    """Download an asset once; return its snapshot-root-relative path or None."""
    url = url.split("#")[0]
    if url in seen_assets:
        return seen_assets[url]
    seen_assets[url] = None          # guard against reference cycles
    data, ctype = fetch(url)
    if data is None:
        return None
    local = asset_local_path(url)
    save(local, data)
    seen_assets[url] = local
    print("    asset {:>9,}B  {}".format(len(data), local))
    if "css" in (ctype or "") or local.endswith(".css"):
        process_css(url, local, data)
    return local


def process_css(css_url, css_local, data):
    out = data
    refs = set(CSS_URL_RE.findall(data)) | set(CSS_IMPORT_RE.findall(data))
    for raw in refs:
        try:
            ref = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        if ref.startswith(("data:", "#", "about:")):
            continue
        abs_url = urljoin(css_url, ref)
        if not abs_url.startswith(("http://", "https://")):
            continue
        local = grab_asset(abs_url)
        if local:
            out = out.replace(raw, relative(css_local, local).encode("utf-8"))
    if out != data:
        save(css_local, out)


ATTR_RE = re.compile(
    r"""(?P<attr>\b(?:href|src|poster|data-src)\s*=\s*)(?P<q>["'])(?P<val>[^"']+)(?P=q)""",
    re.I)
SRCSET_RE = re.compile(r"""(\bsrcset\s*=\s*)(["'])([^"']+)(\2)""", re.I)
STYLE_BLOCK_RE = re.compile(r"(<style[^>]*>)(.*?)(</style>)", re.S | re.I)
INLINE_URL_RE = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""")

ASSET_EXT = re.compile(
    r"\.(css|js|mjs|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot"
    r"|mp4|webm|mp3|pdf|json|txt|xml|map)$", re.I)

PAGE_ROUTES = set(p.rstrip("/") or "/" for p in PAGES)


def rewrite_html(route, html_bytes):
    html = html_bytes.decode("utf-8", "replace")
    page_file = page_path(route)
    page_url = urljoin(ORIGIN, route)

    def fix_one(raw_val):
        val = raw_val.strip()
        if val.startswith(("data:", "mailto:", "tel:", "javascript:", "#", "about:")):
            return None
        abs_url = urljoin(page_url, val)
        pu = urlparse(abs_url)
        if pu.scheme not in ("http", "https"):
            return None
        same = pu.netloc in SAME_SITE
        looks_like_asset = bool(ASSET_EXT.search(pu.path))
        if same and not looks_like_asset:
            key = pu.path.rstrip("/") or "/"
            if key in PAGE_ROUTES:
                return relative(page_file, page_path(pu.path))
            return abs_url          # e.g. /dashboard, /api/... - leave live
        local = grab_asset(abs_url)
        if not local:
            return None
        return relative(page_file, local)

    def attr_sub(m):
        new = fix_one(m.group("val"))
        if new is None:
            return m.group(0)
        return m.group("attr") + m.group("q") + new + m.group("q")

    def srcset_sub(m):
        parts = []
        for chunk in m.group(3).split(","):
            chunk = chunk.strip()
            if not chunk:
                continue
            bits = chunk.split()
            new = fix_one(bits[0])
            if new:
                bits[0] = new
            parts.append(" ".join(bits))
        return m.group(1) + m.group(2) + ", ".join(parts) + m.group(4)

    def style_sub(m):
        body = m.group(2)
        for ref in set(INLINE_URL_RE.findall(body)):
            if ref.startswith(("data:", "#")):
                continue
            abs_url = urljoin(page_url, ref)
            if not abs_url.startswith("http"):
                continue
            local = grab_asset(abs_url)
            if local:
                body = body.replace(ref, relative(page_file, local))
        return m.group(1) + body + m.group(3)

    html = ATTR_RE.sub(attr_sub, html)
    html = SRCSET_RE.sub(srcset_sub, html)
    html = STYLE_BLOCK_RE.sub(style_sub, html)
    return html.encode("utf-8")


def main():
    os.makedirs(ROOT, exist_ok=True)
    for route in PAGES:
        url = urljoin(ORIGIN, route)
        print("[page] " + url)
        data, _ = fetch(url)
        if data is None:
            print("   !! FAILED")
            continue
        save("_original_html/" + (route.strip("/") or "index") + ".html", data)
        out = rewrite_html(route, data)
        save(page_path(route), out)
        print("   -> {}  ({:,}B)".format(page_path(route), len(out)))

    for extra in ["/robots.txt", "/sitemap.xml", "/favicon.ico",
                  "/manifest.json", "/site.webmanifest", "/opengraph-image"]:
        d, _ = fetch(urljoin(ORIGIN, extra))
        if d:
            save(extra.lstrip("/"), d)
            print("[extra] " + extra)

    print("\n=== done ===")
    ok = [v for v in seen_assets.values() if v]
    print("pages: {}   assets: {}   failed: {}".format(len(PAGES), len(ok), len(failed)))
    for u, e in failed:
        print("  FAIL {} :: {}".format(u, e))


if __name__ == "__main__":
    main()
