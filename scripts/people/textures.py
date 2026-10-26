"""Rocketbox TGA colour maps -> 1k JPG (body, head, equipment) and a small PNG (hair/scarf opacity).

Normal and specular maps are dropped. Two avatars get a warmer, darker skin tone so the whole
team reads as Bangladeshi. Needs Pillow + numpy.
usage: python scripts/people/textures.py <Rocketbox Assets dir> <outDir> <size>
"""
import sys, os, glob
import numpy as np
from PIL import Image

SRC = sys.argv[1]; OUT = sys.argv[2]; SIZE = int(sys.argv[3])
AV = {
  'receptionist': ('Female_Adult_06', False), 'dev1': ('Male_Adult_17', False), 'dev2': ('Male_Adult_15', False),
  'walker': ('Business_Female_01', False), 'ceo': ('Business_Male_05', False), 'cmo': ('Business_Male_06', True),
  'guard': ('Security_Male_01', True),
}
os.makedirs(OUT, exist_ok=True)

def darken_skin(im):
  a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
  hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32) / 255
  h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
  w = np.clip(1 - np.abs(h - 18) / 22, 0, 1) * np.clip((s - 0.12) / 0.12, 0, 1) * np.clip((v - 0.25) / 0.15, 0, 1)
  tgt = a * np.array([0.66, 0.6, 0.56])
  out = a * (1 - w[..., None]) + tgt * w[..., None]
  return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))

for key, (name, tint) in AV.items():
  for p in glob.glob(os.path.join(SRC, '**', name, 'Textures', '*.tga'), recursive=True):
    part = os.path.basename(p).split('_')[1]  # body | head | opacity | equipment
    im = Image.open(p)
    w, h = im.size
    if part == 'opacity':
      im = im.convert('RGBA').resize((SIZE // 2 * w // 2048, SIZE // 2 * h // 2048), Image.LANCZOS)
      im.quantize(96, method=Image.FASTOCTREE).save(os.path.join(OUT, f'{key}_{part}.png'), optimize=True)
      continue
    im = im.resize((SIZE * w // 2048, SIZE * h // 2048), Image.LANCZOS)
    if tint and part in ('head', 'body'):
      im = darken_skin(im)
    im.convert('RGB').save(os.path.join(OUT, f'{key}_{part}.jpg'), quality=82, optimize=True, progressive=False)
