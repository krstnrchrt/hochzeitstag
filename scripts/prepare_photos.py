#!/usr/bin/env python3
"""Macht Fotos web-tauglich: richtig drehen, auf max. 1600 px verkleinern, Metadaten (inkl. GPS) entfernen.

  python3 scripts/prepare_photos.py originals/

Die Originale bleiben unverändert; die kleinen Versionen landen in images/.
"""
import pathlib
import sys

from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "images"
MAX = 1600
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "originals")
OUT.mkdir(exist_ok=True)
files = sorted(p for p in src.iterdir() if p.suffix.lower() in EXTS and not p.name.startswith("."))
for p in files:
    with Image.open(p) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((MAX, MAX), Image.LANCZOS)
        target = OUT / (p.stem.lower() + ".jpg")
        im.save(target, "JPEG", quality=82, optimize=True, progressive=True)
        print(f"{p.name} -> {target.name} {im.width}x{im.height} {target.stat().st_size // 1024} KB")
