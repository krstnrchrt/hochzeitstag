# Alles Gute zum Hochzeitstag, Андрей & Ольга!

Eine kleine Webseite zum Hochzeitstag (21. Oktober 1989): Umschlag öffnen → Pixel-Animation
(Hochzeit in Есиль, zwei Töchter, Zugfahrt über Belarus und Berlin nach Düsseldorf, ein Sohn,
heute die ganze Familie) → Postkarte mit Nachricht und Fotos.

## Anpassen

| Was | Wo |
| --- | --- |
| Nachricht auf der Postkarte | `config.js` → `message` |
| Musik | MP3 als `music.mp3` in den Hauptordner legen |
| Fotos | Bilder in den Ordner `images/` legen |

**Fotos:** Die Bildunterschrift kommt aus dem Dateinamen, die Reihenfolge auch:
`1989-hochzeit.jpg` → „1989 · Hochzeit“. Die Fotoliste wird beim Veröffentlichen automatisch
erzeugt. Für die lokale Vorschau: `python3 scripts/update_photos.py`.
Tipp: Fotos vorher verkleinern (z. B. max. 1600 px), damit die Seite auf dem Handy schnell lädt:
`sips -Z 1600 images/*.jpg`

## Vorschau

```sh
python3 -m http.server 8000
```

Dann <http://localhost:8000> öffnen. Abkürzungen: `#film` (direkt zur Animation),
`#fotos` (Fotofilm), `#tage` (Tageszähler + Postkarte), `#karte` (direkt zur Postkarte),
`#frame=20` (Standbild bei Sekunde 20).

## Veröffentlichen

Jeder Push auf `main` veröffentlicht die Seite automatisch über GitHub Pages
(siehe `.github/workflows/pages.yml`). Dateien können auch direkt auf github.com
hochgeladen werden („Add file → Upload files“).
