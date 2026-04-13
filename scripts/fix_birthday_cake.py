from PIL import Image

path = r"C:\DATA\Dev\kindra\public\gallery\birthday-cake.png"
img = Image.open(path)
rotated = img.rotate(180, expand=True)
rotated.save(path)
print(f"birthday-cake.png: 180deg -> {rotated.size}")
