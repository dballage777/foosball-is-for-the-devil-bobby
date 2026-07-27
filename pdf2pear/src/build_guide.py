"""Build the human-facing Snap Quiz placement guide (HTML).

Shows each page image next to the items on it, with the keyed answer, inferred
type, and points — so entering them in Snap Quiz is mechanical. No content is
regenerated; the page image is the original PDF page.
"""
import base64
import html
import os


def _data_uri(path):
    try:
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        return f"data:image/png;base64,{b64}"
    except Exception:
        return None


def _badge(t):
    colors = {"multiple_choice": "#2E74B5", "multiple_select": "#7030A0",
              "true_false": "#375623", "text_entry": "#9C4221", "math": "#1F3864"}
    return (f'<span style="background:{colors.get(t, "#555")};color:#fff;'
            f'border-radius:4px;padding:1px 7px;font-size:12px">{t}</span>')


def build_guide(answer_map, page_images, out_path, title="Snap Quiz Placement Guide"):
    items = answer_map["items"]
    by_page = {}
    for it in items:
        by_page.setdefault(it.get("page") or 0, []).append(it)

    rows = "".join(
        f"<tr><td>{it['n']}</td><td>{_badge(it['type'])}</td>"
        f"<td><b>{html.escape(str(it['answer']))}</b></td>"
        f"<td>{it['points']}</td><td>{it.get('page') or '?'}</td></tr>"
        for it in items)

    page_blocks = []
    imgs = {i + 1: p for i, p in enumerate(page_images)}
    pages = sorted(set(list(by_page) + list(imgs)))
    for pg in pages:
        if pg == 0:
            continue
        img = imgs.get(pg)
        uri = _data_uri(img) if img else None
        img_html = (f'<img src="{uri}" style="max-width:520px;border:1px solid #ccc">'
                    if uri else '<div style="color:#999">[no page image]</div>')
        li = "".join(
            f"<li><b>{it['n']}.</b> {_badge(it['type'])} &rarr; "
            f"<b>{html.escape(str(it['answer']))}</b> ({it['points']} pt)</li>"
            for it in by_page.get(pg, []))
        page_blocks.append(
            f'<div class="page"><h3>Page {pg}</h3>'
            f'<div class="row">{img_html}<ul>{li or "<li>(no items detected)</li>"}</ul></div></div>')

    doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>{html.escape(title)}</title>
<style>
body{{font-family:Arial,Helvetica,sans-serif;margin:28px;color:#111}}
h1{{color:#1F3864}} table{{border-collapse:collapse;margin:10px 0}}
td,th{{border:1px solid #bbb;padding:5px 10px;font-size:14px}} th{{background:#DEEAF6}}
.page{{margin:22px 0;padding:12px;border-top:2px solid #2E74B5}}
.row{{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}}
ul{{line-height:1.9}}
.note{{background:#F2F6FB;border-left:5px solid #2E74B5;padding:10px 14px}}
</style></head><body>
<h1>{html.escape(title)}</h1>
<p class="note"><b>How to use:</b> In Pear Assess choose <b>Snap Quiz</b> and upload
<code>Problems.pdf</code>. For each item below, click the matching question-type tool,
click the item's location on the page, then set the <b>answer</b> and <b>points</b> shown
here. Nothing is rewritten — students see the original PDF.</p>
<h2>All items ({len(items)})</h2>
<table><tr><th>#</th><th>Type</th><th>Answer</th><th>Pts</th><th>Page</th></tr>{rows}</table>
{''.join(page_blocks)}
</body></html>"""
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"  [guide] wrote {out_path}")
    return out_path
