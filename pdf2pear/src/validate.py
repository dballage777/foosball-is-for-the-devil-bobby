"""Cross-check the answer map against the problems PDF and emit an HTML report.

Never edits content — only flags ✓ / ⚠ / ✗ for human review.
"""
import html


def validate(answer_map, problems, figures, out_path):
    items = answer_map["items"]
    prob_items = {it["n"]: it for it in problems.get("items", [])}
    checks = []          # (level, item, message)   level in ok/warn/err

    ans_ns = [it["n"] for it in items]
    prob_ns = sorted(prob_items)

    # count match
    if prob_ns and len(ans_ns) != len(prob_ns):
        checks.append(("err", "-", f"item count mismatch: answers={len(ans_ns)} "
                                    f"problems={len(prob_ns)}"))
    else:
        checks.append(("ok", "-", f"item count = {len(ans_ns)}"))

    # numbering continuity
    if ans_ns:
        expected = list(range(ans_ns[0], ans_ns[0] + len(ans_ns)))
        if ans_ns != expected:
            checks.append(("warn", "-", f"numbering not contiguous: {ans_ns}"))
        dupes = {n for n in ans_ns if ans_ns.count(n) > 1}
        if dupes:
            checks.append(("err", "-", f"duplicate item numbers: {sorted(dupes)}"))

    # per-item checks
    for it in items:
        n = it["n"]
        p = prob_items.get(n)
        # MC legality: keyed letter must exist among detected choices
        if it["type"] in ("multiple_choice", "multiple_select") and p and p.get("choices"):
            keyed = it["answer"] if isinstance(it["answer"], list) else [it["answer"]]
            bad = [k for k in keyed if k not in p["choices"]]
            if bad:
                checks.append(("warn", n, f"keyed {bad} not in detected choices "
                                          f"{p['choices']}"))
            else:
                checks.append(("ok", n, f"answer {keyed} within choices {p['choices']}"))
        # OCR garbage
        if any(ch in str(it["answer"]) for ch in ("□", "�")):
            checks.append(("err", n, "answer contains OCR replacement char — review"))
        # unknown page
        if not it.get("page"):
            checks.append(("warn", n, "no page located (place manually)"))

    if figures:
        checks.append(("ok", "-", f"{len(figures)} embedded figure(s) inventoried"))

    n_err = sum(1 for c in checks if c[0] == "err")
    n_warn = sum(1 for c in checks if c[0] == "warn")

    def row(c):
        color = {"ok": "#375623", "warn": "#9C4221", "err": "#b00020"}[c[0]]
        icon = {"ok": "✓", "warn": "⚠", "err": "✗"}[c[0]]
        return (f'<tr><td style="color:{color};font-weight:bold">{icon}</td>'
                f'<td>{c[1]}</td><td>{html.escape(c[2])}</td></tr>')

    doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>Validation Report</title>
<style>body{{font-family:Arial;margin:28px;color:#111}}h1{{color:#1F3864}}
table{{border-collapse:collapse}}td,th{{border:1px solid #bbb;padding:5px 10px;font-size:14px}}
th{{background:#DEEAF6}} .sum{{font-size:16px;margin:8px 0}}</style></head><body>
<h1>Validation Report</h1>
<p class="sum">Errors: <b style="color:#b00020">{n_err}</b> &nbsp;
Warnings: <b style="color:#9C4221">{n_warn}</b> &nbsp;
Items: <b>{len(items)}</b></p>
<table><tr><th></th><th>Item</th><th>Check</th></tr>{''.join(row(c) for c in checks)}</table>
<p style="color:#555;margin-top:16px">Nothing is auto-corrected. Resolve ✗/⚠ before publishing.</p>
</body></html>"""
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"  [validate] {n_err} error(s), {n_warn} warning(s) -> {out_path}")
    return {"errors": n_err, "warnings": n_warn, "path": out_path}
