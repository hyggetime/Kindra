"""
킨드라 OG 이미지 생성 → public/og-image.png (1200×630)
배경: public/gallery/beach-scene.png

이미지를 바꾼 뒤에는 `lib/site-og.ts` 의 `OG_IMAGE_CACHE_VERSION` 을 1 올려 주세요.
(SITE_OG_IMAGE.url 의 `?v=` 가 함께 바뀝니다.) 카카오톡 등 OG 캐시 무효화용입니다.
"""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "public")
SRC = os.path.join(BASE, "gallery", "beach-scene.png")
DST = os.path.join(BASE, "og-image.png")

W, H = 1200, 630

FONT_REG = r"C:\Windows\Fonts\malgun.ttf"
FONT_BOLD = r"C:\Windows\Fonts\malgunbd.ttf"

CREAM = (255, 249, 242)
CHARCOAL = (42, 42, 42)
LOGO_GRAY = (155, 150, 145)
PANEL_FILL = (255, 252, 246, 175)

# 메인 카피만 (상단 소제목 생략 — 미리보기에서 가독성 우선)
MAIN_LINES = [
    "아이를 잘 보고 있다는 것,",
    "킨드라의 리포트가 함께 느껴드립니다.",
]


def f(path, size):
    return ImageFont.truetype(path, size)


def main():
    if not os.path.isfile(SRC):
        raise SystemExit(f"Missing background: {SRC}")

    img = Image.open(SRC).convert("RGB")
    iw, ih = img.size

    if iw / ih > W / H:
        new_w = int(ih * W / H)
        off = (iw - new_w) // 2
        img = img.crop((off, 0, off + new_w, ih))
    else:
        new_h = int(iw * H / W)
        off = (ih - new_h) // 2
        img = img.crop((0, off, iw, off + new_h))

    img = img.resize((W, H), Image.LANCZOS)
    warm = Image.new("RGB", (W, H), CREAM)
    img = Image.blend(img, warm, 0.38)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    panel_w, panel_h = 920, 240
    px = (W - panel_w) // 2
    py = (H - panel_h) // 2 - 8
    r = 20
    od.rounded_rectangle([px, py, px + panel_w, py + panel_h], radius=r, fill=PANEL_FILL)
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)

    f_main = f(FONT_BOLD, 46)

    # 본문 블록 세로 중앙 정렬
    gap = 14
    heights = []
    for line in MAIN_LINES:
        bb = draw.textbbox((0, 0), line, font=f_main)
        heights.append(bb[3] - bb[1])
    block_h = sum(heights) + gap * (len(MAIN_LINES) - 1)
    y = py + (panel_h - block_h) // 2

    for line in MAIN_LINES:
        bb = draw.textbbox((0, 0), line, font=f_main)
        tw = bb[2] - bb[0]
        draw.text(((W - tw) // 2, y), line, font=f_main, fill=CHARCOAL)
        y += (bb[3] - bb[1]) + gap

    # 로고
    f_logo = f(FONT_REG, 19)
    logo_text = "Kindra · 킨드라"
    bb_l = draw.textbbox((0, 0), logo_text, font=f_logo)
    lw = bb_l[2] - bb_l[0]
    lh = bb_l[3] - bb_l[1]
    draw.text((W - lw - 38, H - lh - 28), logo_text, font=f_logo, fill=LOGO_GRAY)

    img.save(DST, format="PNG", optimize=True)
    print("saved:", DST)
    print("[다음 단계] OG 이미지를 교체했다면 lib/site-og.ts 의 OG_IMAGE_CACHE_VERSION 을 1 증가시키세요.")


if __name__ == "__main__":
    main()
