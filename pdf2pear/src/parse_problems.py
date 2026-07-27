"""Parse the STUDENT PROBLEMS PDF for validation metadata only.

Extracts, per item: the page it appears on and the multiple-choice option
letters present (A, B, C, ...). This is never used to rewrite content; it only
lets validate.py confirm counts, numbering, and that a keyed letter is legal.
"""
import os
import re

ITEM_RE = re.compile(r"^\s*(\d{1,3})[\.\)]\s")
CHOICE_RE = re.compile(r"(?:^|\s)([A-E])[\.\)]\s")


def parse_problems(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"  [problems] {pdf_path} not found; skipping problem parse")
        return {"items": [], "n_pages": 0}
    try:
        import pdfplumber
    except Exception:
        print("  [problems] pdfplumber unavailable; skipping")
        return {"items": [], "n_pages": 0}

    items = {}
    n_pages = 0
    with pdfplumber.open(pdf_path) as pdf:
        n_pages = len(pdf.pages)
        for pno, pg in enumerate(pdf.pages, 1):
            text = pg.extract_text() or ""
            cur = None
            for line in text.splitlines():
                m = ITEM_RE.match(line)
                if m:
                    cur = int(m.group(1))
                    items.setdefault(cur, {"n": cur, "page": pno, "choices": []})
                # collect choice letters on this line for the current item
                if cur is not None:
                    for c in CHOICE_RE.findall(line):
                        if c not in items[cur]["choices"]:
                            items[cur]["choices"].append(c)
    ordered = [items[k] for k in sorted(items)]
    print(f"  [problems] detected {len(ordered)} item(s) across {n_pages} page(s)")
    return {"items": ordered, "n_pages": n_pages}
