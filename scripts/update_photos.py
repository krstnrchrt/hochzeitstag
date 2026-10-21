#!/usr/bin/env python3
"""Erzeugt photos.js aus allen Bildern im Ordner images/.

Bildunterschriften kommen aus dem Dateinamen:
  1989-hochzeit.jpg        ->  1989 · Hochzeit
  2001_urlaub-am-meer.png  ->  2001 · Urlaub am meer
Die Reihenfolge folgt dem Dateinamen (am besten mit der Jahreszahl beginnen).
"""
import json
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def caption(stem: str) -> str:
    m = re.match(r"^(\d{4})[-_ ]*(.*)$", stem)
    year, rest = (m.group(1), m.group(2)) if m else (None, stem)
    rest = re.sub(r"[-_]+", " ", rest).strip()
    rest = rest[:1].upper() + rest[1:]
    return " · ".join(part for part in (year, rest) if part)


files = sorted(
    (p for p in IMAGES.iterdir() if p.suffix.lower() in EXTS and not p.name.startswith(".")),
    key=lambda p: p.name.lower(),
) if IMAGES.is_dir() else []

photos = [
    {"src": "images/" + urllib.parse.quote(p.name), "caption": caption(p.stem)}
    for p in files
]

(ROOT / "photos.js").write_text(
    "// Automatisch erzeugt mit scripts/update_photos.py – nicht von Hand bearbeiten.\n"
    "window.PHOTOS = " + json.dumps(photos, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)
print(f"{len(photos)} Bild(er) eingetragen.")
