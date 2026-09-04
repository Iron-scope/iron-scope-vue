#!/usr/bin/env python3
"""Downscale the Iron Scope seal into web-sized assets + favicons.

The original is a 522x522 / 444KB PNG used at ~40px in the header. This emits
tight 2x-ready PNG + WebP variants and an .ico, all served locally.
"""
import os
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "site_snapshot", "ironscope-seal-v2.png")
IMG = os.path.join(BASE, "ironscope-web", "src", "assets", "img")
PUB = os.path.join(BASE, "ironscope-web", "public")

os.makedirs(IMG, exist_ok=True)
os.makedirs(PUB, exist_ok=True)

src = Image.open(SRC).convert("RGBA")
print("source: %dx%d  %.0f KB" % (src.width, src.height, os.path.getsize(SRC) / 1024))


def emit(size, stem, where=IMG, webp=True):
    im = src.resize((size, size), Image.LANCZOS)
    p = os.path.join(where, stem + ".png")
    im.save(p, "PNG", optimize=True)
    print("  %-26s %4dpx %7.1f KB" % (os.path.basename(p), size,
                                      os.path.getsize(p) / 1024))
    if webp:
        pw = os.path.join(where, stem + ".webp")
        im.save(pw, "WEBP", quality=90, method=6)
        print("  %-26s %4dpx %7.1f KB" % (os.path.basename(pw), size,
                                          os.path.getsize(pw) / 1024))


emit(96, "seal-96")        # header @2x (48px display)
emit(256, "seal-256")      # footer / cards
emit(512, "seal-512")      # hero / social

# favicon: multi-resolution .ico + png for modern browsers
ico = os.path.join(PUB, "favicon.ico")
src.resize((64, 64), Image.LANCZOS).save(
    ico, "ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("  %-26s        %7.1f KB" % ("favicon.ico", os.path.getsize(ico) / 1024))

for s in (180, 192, 512):
    im = src.resize((s, s), Image.LANCZOS)
    name = "apple-touch-icon.png" if s == 180 else "icon-%d.png" % s
    p = os.path.join(PUB, name)
    # apple touch icons must not be transparent
    if s == 180:
        bg = Image.new("RGBA", im.size, "#16213e")
        bg.alpha_composite(im)
        im = bg.convert("RGB")
    im.save(p, "PNG", optimize=True)
    print("  %-26s %4dpx %7.1f KB" % (name, s, os.path.getsize(p) / 1024))
