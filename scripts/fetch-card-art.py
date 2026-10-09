#!/usr/bin/env python3
"""Download the public-domain 1909 Rider–Waite–Smith deck and resize it for the web.

Source files live on Wikimedia Commons in
"Category:Rider-Waite tarot deck (Roses & Lilies)".
Pamela Colman Smith drew the cards in 1909; they were published before 1931
and are in the public domain. See README for attribution.
"""

from __future__ import annotations

import io
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parents[1] / "public" / "cards"
UA = "DaodaoTarot/1.0 (tarot app; bundling public-domain 1909 Rider-Waite-Smith scans)"

MAJORS = [
    "00 Fool",
    "01 Magician",
    "02 High Priestess",
    "03 Empress",
    "04 Emperor",
    "05 Hierophant",
    "06 Lovers",
    "07 Chariot",
    "08 Strength",
    "09 Hermit",
    "10 Wheel of Fortune",
    "11 Justice",
    "12 Hanged Man",
    "13 Death",
    "14 Temperance",
    "15 Devil",
    "16 Tower",
    "17 Star",
    "18 Moon",
    "19 Sun",
    "20 Judgement",
    "21 World",
]
SUITS = ["Wands", "Cups", "Swords", "Pentacles"]


def jobs() -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for index, name in enumerate(MAJORS):
        pairs.append((f"RWS1909 - {name}.jpeg", f"major-{index:02d}.jpg"))
    for suit in SUITS:
        for number in range(1, 15):
            pairs.append(
                (f"RWS1909 - {suit} {number:02d}.jpeg", f"{suit.lower()}-{number:02d}.jpg")
            )
    return pairs


def thumb_url(title: str) -> str:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": f"File:{title}",
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": "500",
            "format": "json",
        }
    )
    request = urllib.request.Request(
        "https://commons.wikimedia.org/w/api.php?" + params,
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.load(response)
    pages = payload["query"]["pages"]
    page = next(iter(pages.values()))
    info = page["imageinfo"][0]
    return info.get("thumburl") or info["url"]


def fetch(title: str) -> bytes:
    request = urllib.request.Request(thumb_url(title), headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def save_jpeg(data: bytes, path: Path) -> int:
    image = Image.open(io.BytesIO(data)).convert("RGB")
    image.thumbnail((640, 1120), Image.Resampling.LANCZOS)
    image.save(path, "JPEG", quality=78, optimize=True)
    return path.stat().st_size


def download_one(title: str, filename: str) -> str:
    path = OUT / filename
    if path.exists() and path.stat().st_size > 8000:
        return f"skip {filename}"
    last_error: Exception | None = None
    for attempt in range(6):
        try:
            size = save_jpeg(fetch(title), path)
            return f"saved {filename} {size}"
        except Exception as error:  # noqa: BLE001
            last_error = error
            time.sleep(3 + attempt * 3)
    assert last_error is not None
    raise last_error


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    work = jobs()
    failures: list[str] = []
    for title, name in work:
        try:
            print(download_one(title, name), flush=True)
        except Exception as error:  # noqa: BLE001
            failures.append(f"{name}: {error}")
            print(f"FAIL {name}: {error}", flush=True)
        time.sleep(0.8)
    print(f"done {len(work) - len(failures)}/{len(work)}")
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
