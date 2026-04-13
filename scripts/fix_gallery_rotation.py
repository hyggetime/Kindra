from PIL import Image
import os

base = os.path.join(os.path.dirname(__file__), '..', 'public', 'gallery')

# beach-scene: 90° 시계 방향 (CW) = rotate(-90) in PIL
img = Image.open(os.path.join(base, 'beach-scene.png'))
img = img.rotate(-90, expand=True)
img.save(os.path.join(base, 'beach-scene.png'))
print('beach-scene.png: 90° CW 완료')

# sketches-card: 180°
img = Image.open(os.path.join(base, 'sketches-card.png'))
img = img.rotate(180, expand=True)
img.save(os.path.join(base, 'sketches-card.png'))
print('sketches-card.png: 180° 완료')

# paper-dolls-a: 180°
img = Image.open(os.path.join(base, 'paper-dolls-a.png'))
img = img.rotate(180, expand=True)
img.save(os.path.join(base, 'paper-dolls-a.png'))
print('paper-dolls-a.png: 180° 완료')
