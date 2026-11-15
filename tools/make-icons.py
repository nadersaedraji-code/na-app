"""Generate N&A app icons — two overlapping lives on a dark ground."""
from PIL import Image, ImageDraw, ImageFilter
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")
os.makedirs(OUT, exist_ok=True)

S = 1024
BG_TOP = (36, 26, 33)
BG_BOT = (20, 15, 20)
C_N = (236, 118, 158)
C_A = (201, 166, 222)


def rounded_rect_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius, fill=255)
    return m


def gradient(size, top, bot):
    img = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        img.putpixel((0, y), tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return img.resize((size, size))


def mark(scale=1.0, glow=1.0):
    """Two translucent circles, screen-blended so the overlap lights up."""
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    r = 186 * scale
    gap = 92 * scale
    cx, cy = S / 2, S / 2

    for color, off in ((C_N, -gap), (C_A, gap)):
        c = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(c).ellipse(
            [cx + off - r, cy - r, cx + off + r, cy + r], fill=color + (232,)
        )
        layer = Image.alpha_composite(layer, c)

    # soft bloom behind the mark
    bloom = layer.filter(ImageFilter.GaussianBlur(46 * scale))
    bloom.putalpha(bloom.getchannel("A").point(lambda v: int(v * 0.55 * glow)))
    return Image.alpha_composite(bloom, layer)


def build(size, maskable=False, path=None):
    bg = gradient(S, BG_TOP, BG_BOT).convert("RGBA")
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    canvas.alpha_composite(bg)
    if not maskable:
        canvas.putalpha(rounded_rect_mask(S, int(S * 0.2237)))
    art = mark(scale=0.78 if maskable else 1.0, glow=0.9)
    canvas = Image.alpha_composite(canvas, art)
    if not maskable:
        canvas.putalpha(rounded_rect_mask(S, int(S * 0.2237)))
    canvas.resize((size, size), Image.LANCZOS).save(path, "PNG", optimize=True)
    print("wrote", path)


build(192, path=os.path.join(OUT, "icon-192.png"))
build(512, path=os.path.join(OUT, "icon-512.png"))
build(180, path=os.path.join(OUT, "apple-touch-icon.png"))
build(512, maskable=True, path=os.path.join(OUT, "icon-maskable-512.png"))
