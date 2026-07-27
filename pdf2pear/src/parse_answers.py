"""Turn raw answer-key text into the structured answer_map.

Accepts formats like:
    1. B
    2) 7x - 4
    3 - A, C
    4. True
    11. 14x + 30 = 156; 9
The leading number is the item; everything after the separator is the answer,
kept verbatim (no solving, no rewriting). Types are inferred by classify_types.
"""
import re
from . import config
from .classify_types import classify

LINE_RE = re.compile(r"^\s*(\d{1,3})\s*[\.\)\-:]\s*(.+?)\s*$")


def parse_answer_key(raw_text, problems=None):
    problems = problems or {"items": []}
    choices_by_n = {it["n"]: it.get("choices", []) for it in problems.get("items", [])}
    page_by_n = {it["n"]: it.get("page") for it in problems.get("items", [])}

    items, seen = [], set()
    for line in raw_text.splitlines():
        m = LINE_RE.match(line)
        if not m:
            continue
        n = int(m.group(1))
        if n in seen:                      # ignore accidental duplicates in OCR
            continue
        seen.add(n)
        raw = m.group(2).strip()
        qtype, norm = classify(raw, choices_by_n.get(n))
        items.append({
            "n": n,
            "page": page_by_n.get(n),
            "type": qtype,
            "answer": norm,
            "answer_raw": raw,
            "points": config.DEFAULT_POINTS,
        })
    items.sort(key=lambda x: x["n"])
    return {"source": "answer key", "count": len(items), "items": items}
