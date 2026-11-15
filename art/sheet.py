"""Contact sheet: python art/sheet.py out.png file1 file2 ..."""
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
cell = 512
cols = min(3, len(files)); rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rows * cell), 'white')
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB'); im.thumbnail((cell - 8, cell - 8))
    sheet.paste(im, ((i % cols) * cell + 4, (i // cols) * cell + 4))
sheet.save(out)
