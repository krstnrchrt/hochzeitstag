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

Add `#frame=` followed by a number to the end of the link:
```
https://krstnrchrt.github.io/hochzeitstag/#frame=50
```

The number is the point in the animation, in seconds. You'll see a still image of that moment, with no animation and no music.

**Which number shows which scene:**

| Number | Scene |
| --- | --- |
| `#frame=2` – `9` | Wedding in Есиль (from about 5 with hearts and confetti) |
| `#frame=11` – `15` | 24 March 1991: Helena (snow) |
| `#frame=17` – `22` | 14 June 1995: Kristina (summer) |
| `#frame=24` – `34` | Train: Kazakhstan → Belarus (about 27) → Berlin (about 30) → Düsseldorf (about 33) |
| `#frame=37` – `45` | Düsseldorf, Thomas 2003 (from about 38) |
| `#frame=47` – `52` | Sayon arrives, rings and cockatiel (from about 50) |
| `#frame=54` – `61` | Finale: evening, "37" heart, glow (heart from about 56) |

Decimals work too, e.g. `#frame=50.5`. A value right at a scene boundary, like `9.5` or `53`, may show a dark fade frame.

**Other shortcuts:**
- `#film` plays the animation from the start, skipping the envelope.
- `#fotos` plays the photo film.
- `#tage` runs the day counter, then the postcard.
- `#karte` jumps straight to the postcard.

**Two things to know:**
- If you only change the number in the address bar, the page often doesn't update. Press **reload** (⌘R) after changing it.
- These numbers are animation time. Because the animation now runs at 1.5× slowness, the actual playback time is about 1.5 times longer: `#frame=50` comes up after about 75 seconds of real viewing.