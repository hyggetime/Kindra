from PIL import Image
import os

gallery = r"C:\DATA\Dev\kindra\public\gallery"

fixes = {
    "beach-scene.png":   90,
    "sketches-card.png": 180,
    "paper-dolls-a.png": 180,
    "paper-dolls-b.png": 180,
}

for fname, angle in fixes.items():
    path = os.path.join(gallery, fname)
    img = Image.open(path)
    rotated = img.rotate(angle, expand=True)
    rotated.save(path)
    print(f"{fname}: {angle}deg CCW -> {rotated.size}")

print("done")
