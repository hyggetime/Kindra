"""Emit ../src/data/kindraGalleryItems.ts.

Korean in this repo was garbled because gallery text was assembled from numeric
code points by hand (easy to pick the wrong syllable). This script keeps copy as
\\uXXXX escapes (ASCII-only file) so editors/agents cannot corrupt Hangul.

After editing INTRO, FOOTER_*, ALT*, C*, or TAGS* below, run:
  python scripts/emit_gallery_ts.py
Then: npm run build
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "kindraGalleryItems.ts"

INTRO = (
    "\uC544\uB798\uB294 \uC2E4\uC81C \uC544\uC774 \uADF8\uB9BC \uC608\uC2DC\uC785\uB2C8\uB2E4. "
    "\uC6D0\uBCF8 \uC704\uC5D0 \uB9C8\uC74C\uC774 \uBA38\uBB34\uB294 \uC9C0\uC810\uC744 \uD45C\uC2DC\uD558\uACE0, "
    "\uADF8 \uD55C \uC21C\uAC04\uC744 \uD655\uB300\uD574 \uD574\uC11D\uD558\uB294 \uBC29\uC2DD\uC744 \uBCF4\uC5EC \uB4DC\uB9BD\uB2C8\uB2E4. "
    "\uC120\uC73C\uB85C \uC774\uC5B4\uC9C4 \uC5F0\uACB0\uC120\uC740 Kindra\uAC00 \uD568\uAED8 \uBCF4\uC558\uB358 "
    "\u2018\uACB0\u2019\uC744 \uC774\uC5B4 \uC8FC\uB294 \uBAA8\uC2B5\uC774\uC5D0\uC694."
)

FOOTER_BEFORE = (
    "\uC0DD\uC77C \uCF00\uC774\uD06C, \uD574\uBCC0 \uC7A5\uBA74, \uC2A4\uCF00\uCE58 \uCE74\uB4DC, "
    "\uC624\uB824\uB0B8 \uC778\uD615 \uB4F1 \uCD94\uAC00 \uC608\uC2DC \uC774\uBBF8\uC9C0\uB294 \uC800\uC7A5\uC18C "
)

FOOTER_AFTER = "\uC5D0 \uD568\uAED8 \uB450\uC5C8\uC5B4\uC694."

LABEL_ORIGINAL = "\uC544\uC774 \uC6D0\uBCF8 \uADF8\uB9BC"
LABEL_MOBILE = "\uC138\uB85C \uC5F0\uACB0"
LABEL_ANALYSIS = "Kindra \uBD84\uC11D \u00B7 \uD655\uB300"
ZOOM_SUFFIX = " \u2014 \uD655\uB300 \uC601\uC5ED"

ALT1 = (
    "\uB124 \uBA85\uC774 \uD55C \uD504\uB808\uC784 \uC548\uC5D0 \uBAA8\uC5EC \uC788\uB294 \uC544\uC774\uC758 \uC778\uBB3C\uD654"
)

C1 = (
    "\uBA40\uB9AC \uC7A5\uC2DD\uACFC \uC758\uC0C1\uC758 \uC791\uC740 \uBB34\uB2AC\uAE4C\uC9C0 \uC815\uC131\uC2A4\uB7FD\uAC8C "
    "\uADF8\uB824\uC694. \uAC00\uC871\uC744 \uD55C\uB370 \uBAA8\uC544 \uBA38\uB9AC\uB97C \uD06C\uAC8C \uADF8\uB9AC\uB294 "
    "\uBC29\uC2DD\uC5D0\uC11C\uB294 \uAD00\uACC4\uC5D0 \uB300\uD55C \uAD00\uC2EC\uACFC \uC548\uC815\uAC10\uC774 "
    "\uB3D9\uC2DC\uC5D0 \uBCF4\uC785\uB2C8\uB2E4."
)

ALT2 = (
    "\uB098\uBB34 \uC0AC\uC774\uC5D0\uC11C \uBB3C\uC744 \uC8FC\uB294 \uC544\uC774\uC640, "
    "\uD558\uD2B8 \uBAA8\uC591\uC758 \uC78E\uC774 \uD3B4\uC9C0\uB294 \uC7A5\uBA74"
)

C2 = (
    "\uBB3C\uC744 \uC8FC\uB294 \uB3D9\uC791\uACFC \uD558\uD2B8 \uBAA8\uC591\uC758 \uC78E\uC774 \uB9CC\uB098\uB294 "
    "\uC7A5\uBA74\uC5D0\uC11C \uC815\uC11C\uC640 \uC774\uC57C\uAE30\uAC00 \uD55C \uADF8\uB9BC \uC548\uC5D0\uC11C "
    "\uC790\uC5F0\uC2A4\uB7FD\uAC8C \uC774\uC5B4\uC838\uC694. \uC11C\uB85C \uBC29\uD574\uD558\uC9C0 \uC54A\uACE0 "
    "\uAC01\uC790\uC758 \uC790\uB9AC\uB97C \uC9C0\uD0A4\uBA70 \uC0C9\uACFC \uC774\uC57C\uAE30\uAC00 "
    "\uC870\uD654\uB85C\uC2B5\uB2C8\uB2E4."
)

ALT3 = (
    "\uBC14\uB2E4\uC0AC\uC790 \uC1FC\uC640 \uAD00\uB78C\uAC1D\uC774 \uD55C \uC7A5\uBA74\uC5D0 \uBAA8\uC778 \uC2A4\uCF00\uCE58"
)

C3 = (
    "\uC5EC\uB7EC \uC778\uBB3C\uACFC \uB3D9\uBB3C, \uBE44\uB204\uBC29\uC6B8\uAE4C\uC9C0 \uD55C \uC7A5\uBA74\uC5D0 "
    "\uB2E4\uC591\uD55C \uAD6C\uC131\uB825\uC774 \uBCF4\uC5EC\uC694. \uB2E8\uC21C\uD788 \uBCF4\uC774\uB294 \uB300\uB85C "
    "\uADF8\uB9B0 \uAC83\uC774 \uC544\uB2C8\uB77C, \uADF8 \uC21C\uAC04\uC744 \uAE30\uB85D\uD558\uB824\uB294 "
    "\uB9C8\uC74C\uC774 \uB290\uAEF4\uC9D1\uB2C8\uB2E4."
)

TAGS1 = '["#\\uC18C\\uADFC\\uC721", "#\\uAC00\\uC871\\uAD00\\uACC4", "#\\uB514\\uD14C\\uC77C\\uD45C\\uD604"]'
TAGS2 = '["#\\uC758\\uBBF8\\uC788\\uB294\\uC11C\\uC0AC", "#\\uC815\\uC11C\\uD45C\\uD604", "#\\uC0C9\\uC758\\uC870\\uD654"]'
TAGS3 = '["#\\uC7A5\\uBA74\\uAD6C\\uC131", "#\\uAD00\\uCC30\\uB825", "#\\uC774\\uC57C\\uAE30\\uC804\\uAC1C"]'


def esc_ts(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def main() -> None:
    t1, t2, t3 = eval(TAGS1), eval(TAGS2), eval(TAGS3)
    tags1 = "[" + ", ".join(f"'{esc_ts(t)}'" for t in t1) + "]"
    tags2 = "[" + ", ".join(f"'{esc_ts(t)}'" for t in t2) + "]"
    tags3 = "[" + ", ".join(f"'{esc_ts(t)}'" for t in t3) + "]"

    body = f"""export type GalleryItem = {{
  id: string
  src: string
  alt: string
  marker: {{ left: string; top: string }}
  zoomBg: {{ size: string; posX: string; posY: string }}
  line: {{ x1: number; y1: number; x2: number; y2: number }}
  tags: string[]
  comment: string
}}

export const KINDRA_GALLERY_INTRO = '{esc_ts(INTRO)}'

export const KINDRA_GALLERY_FOOTER_BEFORE = '{esc_ts(FOOTER_BEFORE)}'

export const KINDRA_GALLERY_FOOTER_AFTER = '{esc_ts(FOOTER_AFTER)}'

export const KINDRA_GALLERY_LABEL_ORIGINAL = '{esc_ts(LABEL_ORIGINAL)}'

export const KINDRA_GALLERY_LABEL_MOBILE = '{esc_ts(LABEL_MOBILE)}'

export const KINDRA_GALLERY_LABEL_ANALYSIS = '{esc_ts(LABEL_ANALYSIS)}'

export const KINDRA_GALLERY_ZOOM_SUFFIX = '{esc_ts(ZOOM_SUFFIX)}'

export const KINDRA_GALLERY_ITEMS: GalleryItem[] = [
  {{
    id: '1',
    src: '/gallery/family-four.png',
    alt: '{esc_ts(ALT1)}',
    marker: {{ left: '62%', top: '38%' }},
    zoomBg: {{ size: '260% 260%', posX: '58%', posY: '36%' }},
    line: {{ x1: 28, y1: 34, x2: 72, y2: 40 }},
    tags: {tags1},
    comment:
      '{esc_ts(C1)}',
  }},
  {{
    id: '2',
    src: '/gallery/watering-scene.png',
    alt: '{esc_ts(ALT2)}',
    marker: {{ left: '70%', top: '36%' }},
    zoomBg: {{ size: '280% 280%', posX: '68%', posY: '34%' }},
    line: {{ x1: 30, y1: 32, x2: 72, y2: 38 }},
    tags: {tags2},
    comment:
      '{esc_ts(C2)}',
  }},
  {{
    id: '3',
    src: '/gallery/seal-show.png',
    alt: '{esc_ts(ALT3)}',
    marker: {{ left: '48%', top: '44%' }},
    zoomBg: {{ size: '300% 300%', posX: '46%', posY: '42%' }},
    line: {{ x1: 28, y1: 44, x2: 72, y2: 46 }},
    tags: {tags3},
    comment:
      '{esc_ts(C3)}',
  }},
]
"""
    OUT.write_text(body, encoding="utf-8")
    print("Wrote", OUT)


if __name__ == "__main__":
    main()
