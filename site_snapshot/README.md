# iron-scope.com — snapshot

Captured **2026-08-31** from https://iron-scope.com/ (all 11 URLs listed in the site's
`sitemap.xml`). Reference material for the rebuild.

Regenerate at any time with:

```bash
python scripts/mirror.py
```

## Layout

| Path | Contents |
| --- | --- |
| `index.html`, `about/`, `faq/`, … | Pages, with links rewritten to **relative** paths so the copy browses offline |
| `_original_html/` | Byte-identical originals, untouched — use these if a rewrite ever looks wrong |
| `_next/static/css/e77a8223c568105f.css` | The entire stylesheet (21 KB). This is the whole design system |
| `_next/static/chunks/` | Minified JS bundles (client behavior only) |
| `_external/` | Google Fonts CSS + the two **Sora** woff2 files |
| `ironscope-seal-v2.png` | The only image on the site (454 KB logo/seal) |
| `robots.txt`, `sitemap.xml` | As served |

## Browsing it

Open `index.html` directly, or serve it (nicer, since directory URLs resolve):

```bash
python -m http.server 8899 --bind 127.0.0.1
```

Verified: all 11 pages render with correct CSS, webfonts, and logo. **0 broken local
references.**

## Notes for the rebuild

- **Stack:** Next.js (App Router) + NextAuth, hosted on Render behind Cloudflare.
- **Pricing is behind auth.** `/pricing` serves the *login form* to logged-out visitors,
  so `pricing/index.html` is a copy of `login/index.html`. The real pricing table is not
  in this snapshot — it needs a logged-in capture.
- **Two images 404 on the live site.** The stylesheet's hero/parallax rules reference
  `/images/parallax-1.jpg` and `/images/parallax-2.jpg`; both return 404 in production.
  That is why hero sections fall back to a bare gradient. Pre-existing bug, not a
  snapshot artifact — worth fixing or dropping in the rebuild.
- **Console errors when browsing offline are expected:** React hydration mismatches
  (#418/#423) and NextAuth failing to reach `/api/auth/session`. Artifacts of running a
  static copy of a server-rendered app; nothing to do with page content.
- Routes excluded by `robots.txt` and not captured: `/dashboard`, `/queue`, `/admin`, `/api/`.
- Typeface is **Sora** (Google Fonts). Theme color `#16213e`; teal accent around `#0d9488`.
