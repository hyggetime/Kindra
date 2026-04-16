"""Generate public favicon PNGs from a square master asset."""
from PIL import Image
import os

SRC = os.path.join(os.path.dirname(__file__), "kindra-favicon-source.png")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public")
MASTER = 512


def main():
    src = os.path.normpath(SRC)
    if not os.path.isfile(src):
        raise SystemExit(f"Missing source: {src}")

    img = Image.open(src).convert("RGBA")
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    ox, oy = (side - w) // 2, (side - h) // 2
    canvas.paste(img, (ox, oy), img if img.mode == "RGBA" else None)

    master = canvas.resize((MASTER, MASTER), Image.Resampling.LANCZOS)
    master.save(os.path.join(OUT_DIR, "favicon.png"), format="PNG", optimize=True)

    master.resize((32, 32), Image.Resampling.LANCZOS).save(
        os.path.join(OUT_DIR, "favicon-32.png"), format="PNG", optimize=True
    )
    master.resize((180, 180), Image.Resampling.LANCZOS).save(
        os.path.join(OUT_DIR, "favicon-180.png"), format="PNG", optimize=True
    )

    print("OK:", os.path.join(OUT_DIR, "favicon.png"))
    print("OK:", os.path.join(OUT_DIR, "favicon-32.png"))
    print("OK:", os.path.join(OUT_DIR, "favicon-180.png"))


if __name__ == "__main__":
    main()
