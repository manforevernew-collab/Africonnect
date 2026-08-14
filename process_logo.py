"""Trim the AfriTalent logo image: drop the 'Made with AI' watermark zone,
crop to visible content (alpha-based), export navbar logo + icon + favicon."""
from PIL import Image

SRC = r"C:/Users/SHOPINVERSE/Downloads/IMG_7198.png"
OUT = "public"

img = Image.open(SRC).convert("RGBA")
w, h = img.size
alpha = img.getchannel("A").load()

def bbox(x0, y0, x1, y1, skip_watermark=False):
    minx, miny, maxx, maxy = x1, y1, x0, y0
    for y in range(y0, y1):
        for x in range(x0, x1):
            if skip_watermark and y < h * 0.10 and x > w * 0.55:
                continue  # 'Made with AI' watermark lives here
            if alpha[x, y] > 10:
                if x < minx: minx = x
                if x > maxx: maxx = x
                if y < miny: miny = y
                if y > maxy: maxy = y
    return minx, miny, maxx, maxy

pad = 10
minx, miny, maxx, maxy = bbox(0, 0, w, h, skip_watermark=True)
minx = max(0, minx - pad); miny = max(0, miny - pad)
maxx = min(w, maxx + pad); maxy = min(h, maxy + pad)
logo = img.crop((minx, miny, maxx, maxy))
logo.save(f"{OUT}/logo.png")
print("logo.png", logo.size)

# Icon: the Africa-in-circle mark is the left portion of the logo
lw, lh = logo.size
la = logo.getchannel("A").load()
iminx, iminy, imaxx, imaxy = lw, lh, 0, 0
for y in range(lh):
    for x in range(int(lw * 0.45)):
        if la[x, y] > 10:
            if x < iminx: iminx = x
            if x > imaxx: imaxx = x
            if y < iminy: iminy = y
            if y > imaxy: imaxy = y

cx, cy = (iminx + imaxx) // 2, (iminy + imaxy) // 2
side = max(imaxx - iminx, imaxy - iminy) + 2 * pad
half = side // 2
# crop with clamping, then center on a transparent square
left = max(0, cx - half); top = max(0, cy - half)
right = min(lw, cx + half); bottom = min(lh, cy + half)
piece = logo.crop((left, top, right, bottom))
icon = Image.new("RGBA", (side, side), (0, 0, 0, 0))
icon.paste(piece, ((side - piece.size[0]) // 2, (side - piece.size[1]) // 2), piece)

icon.resize((512, 512), Image.LANCZOS).save(f"{OUT}/logo-icon.png")
icon.resize((64, 64), Image.LANCZOS).save(f"{OUT}/favicon.png")
print("logo-icon.png + favicon.png", icon.size)
