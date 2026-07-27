"""Parse the STUDENT PROBLEMS PDF for validation metadata only.

Token/position based so it works with multi-column worksheets (e.g. Kuta):
for each item it records the page it appears on and any multiple-choice option
letters near it. Never used to rewrite content — only to let validate.py confirm
counts/numbering and that a keyed letter is a legal choice.
"""
import os
import re

ITEM_TOK = re.compile(r"^(\d{1,3})[\.\)]$")     # "1)"  "10."
CHOICE_TOK = re.compile(r"^([A-E])[\.\)]$")      # "A)"  "B."


def parse_problems(pdf_path, max_expected=None):
    if not os.path.exists(pdf_path):
        print(f"  [problems] {pdf_path} not found; skipping problem parse")
        return {"items": [], "n_pages": 0}
    try:
        import pdfplumber
    except Exception:
        print("  [problems] pdfplumber unavailable; skipping")
        return {"items": [], "n_pages": 0}

    item_page = {}     # n -> page (first occurrence)
    item_pos = {}      # n -> (page, x0, top) for choice proximity
    choice_hits = []   # (page, x0, top, letter)
    n_pages = 0

    with pdfplumber.open(pdf_path) as pdf:
        n_pages = len(pdf.pages)
        for pno, pg in enumerate(pdf.pages, 1):
            for wd in pg.extract_words(use_text_flow=False):
                tok = wd["text"].strip()
                m = ITEM_TOK.match(tok)
                if m:
                    n = int(m.group(1))
                    if max_expected and n > max_expected:
                        continue
                    if n not in item_page:            # first occurrence wins
                        item_page[n] = pno
                        item_pos[n] = (pno, wd["x0"], wd["top"])
                    continue
                c = CHOICE_TOK.match(tok)
                if c:
                    choice_hits.append((pno, wd["x0"], wd["top"], c.group(1)))

    # attach choice letters to the nearest item start on the same page
    items = {}
    for n, pg in item_page.items():
        items[n] = {"n": n, "page": pg, "choices": []}
    for (pg, x0, top, letter) in choice_hits:
        cands = [(n, p) for n, p in item_pos.items() if p[0] == pg]
        best, bestd = None, 1e18
        for n, (p, ix, iy) in cands:
            # nearest item that starts above-or-near and left-or-near this choice
            d = (top - iy) if top >= iy - 5 else 1e9
            d += abs(x0 - ix) * 0.1
            if d < bestd:
                best, bestd = n, d
        if best is not None and letter not in items[best]["choices"]:
            items[best]["choices"].append(letter)

    ordered = [items[k] for k in sorted(items)]
    print(f"  [problems] detected {len(ordered)} item(s) across {n_pages} page(s)")
    return {"items": ordered, "n_pages": n_pages}
