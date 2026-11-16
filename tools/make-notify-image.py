"""The large image shown inside Android notifications."""
from PIL import Image, ImageDraw, ImageFilter
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")
W, H = 1024, 512

img = Image.new("RGB", (W, H), (251, 246, 244))
d = ImageDraw.Draw(img)

# soft wash
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(251 - 8 * t), int(246 - 12 * t), int(244 - 10 * t)))

bloom = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(bloom)
bd.ellipse([-160, -220, 520, 460], fill=(232, 116, 155, 70))
bd.ellipse([620, 120, 1180, 680], fill=(185, 139, 201, 60))
bloom = bloom.filter(ImageFilter.GaussianBlur(90))
img = Image.alpha_composite(img.convert("RGBA"), bloom).convert("RGB")

d = ImageDraw.Draw(img)
cx, cy, r = 300, 256, 104
d.ellipse([cx - r - 70, cy - r, cx + r - 70, cy + r], fill=(232, 116, 155))
d.ellipse([cx - r + 70, cy - r, cx + r + 70, cy + r], fill=(185, 139, 201))

# a quiet line of type-substitute: three dots
for i, col in enumerate([(232, 116, 155), (185, 139, 201), (201, 162, 75)]):
    x = 720 + i * 54
    d.ellipse([x, 246, x + 26, 272], fill=col)

img.save(os.path.join(OUT, "notify-hero.png"), "PNG", optimize=True)
print("wrote icons/notify-hero.png")
