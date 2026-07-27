"""Compute a normalized click target for each item from the Problems PDF.

For auto mode: where on the page (as a fraction of page width/height) the answer
box should be dropped. We anchor near each item's number marker and offset to the
right, where the answer blank usually sits. Approximate by design — Pear renders
the PDF in its own canvas, so auto mode still needs supervision.
"""
import json
import os
import re

ITEM_TOK = re.compile(r"^(\d{1,3})[\.\)]$")


def compute_click_points(pdf_path, out_path, x_offset_frac=0.18):
    if not os.path.exists(pdf_path):
        return {}
    try:
        import pdfplumber
    except Exception:
        return {}
    points = {}
    with pdfplumber.open(pdf_path) as pdf:
        for pno, pg in enumerate(pdf.pages, 1):
            W, H = pg.width, pg.height
            for wd in pg.extract_words():
                m = ITEM_TOK.match(wd["text"].strip())
                if not m:
                    continue
                n = int(m.group(1))
                if n in points:
                    continue
                cx = (wd["x0"] + wd["x1"]) / 2 / W + x_offset_frac
                cy = (wd["top"] + wd["bottom"]) / 2 / H
                points[n] = {"page": pno, "x_frac": round(min(cx, 0.97), 4),
                             "y_frac": round(cy, 4)}
    with open(out_path, "w") as f:
        json.dump(points, f, indent=2)
    print(f"  [points] wrote {out_path} ({len(points)} targets)")
    return points
