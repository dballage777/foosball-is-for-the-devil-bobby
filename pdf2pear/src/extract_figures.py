"""Inventory embedded figures/diagrams per page (for validation + backups).

In the recommended Snap Quiz workflow the figures need no extraction — the PDF
page IS the image. We still inventory them so validation can confirm every
diagram is accounted for, and so the CSV/QTI backup can reference cropped assets.
"""
import os


def inventory_figures(pdf_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    try:
        import fitz  # PyMuPDF
    except Exception:
        print("  [figures] PyMuPDF not installed; figure inventory skipped "
              "(not required for Snap Quiz).")
        return []
    doc = fitz.open(pdf_path)
    figs = []
    for pno in range(len(doc)):
        page = doc[pno]
        for idx, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            try:
                pix = fitz.Pixmap(doc, xref)
                if pix.n - pix.alpha >= 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                fn = os.path.join(out_dir, f"p{pno+1:02d}_fig{idx+1}.png")
                pix.save(fn)
                figs.append({"page": pno + 1, "index": idx + 1, "file": fn})
            except Exception:
                figs.append({"page": pno + 1, "index": idx + 1, "file": None})
    print(f"  [figures] found {len(figs)} embedded image(s)")
    return figs
