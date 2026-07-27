"""Render each PDF page to a PNG for the placement guide.

Uses pypdfium2 (no poppler needed). If pypdfium2 is unavailable, returns [] and
the guide falls back to a text-only listing.
"""
import os


def render_pages(pdf_path, out_dir, dpi=150, prefix="page"):
    os.makedirs(out_dir, exist_ok=True)
    try:
        import pypdfium2 as pdfium
    except Exception as e:  # pragma: no cover
        print(f"  [pages] pypdfium2 unavailable ({e}); skipping page images")
        return []
    paths = []
    pdf = pdfium.PdfDocument(pdf_path)
    scale = dpi / 72.0
    for i in range(len(pdf)):
        page = pdf[i]
        bitmap = page.render(scale=scale)
        img = bitmap.to_pil()
        p = os.path.join(out_dir, f"{prefix}-{i+1:02d}.png")
        img.save(p)
        paths.append(p)
    pdf.close()
    print(f"  [pages] rendered {len(paths)} page image(s) -> {out_dir}")
    return paths
