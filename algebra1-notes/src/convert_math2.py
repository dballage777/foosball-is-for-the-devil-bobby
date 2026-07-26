#!/usr/bin/env python3
"""Convert plain-text math in Alg 1 Unit 1 Notes Packet 2 into native OMML
   equations (same structure the file already uses). Rules (CONVENTIONS.md):
   exponents -> superscripts; any ÷ and any genuine quotient a/b -> stacked
   fraction; leave label/prose slashes (M/D, A/S, Addition/Subtraction, etc.).
   Nothing but the listed math runs is touched; strict checks verify no
   alphanumeric content changes and the XML stays well-formed."""
import copy, re
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
M = "http://schemas.openxmlformats.org/officeDocument/2006/math"
XML = "http://www.w3.org/XML/1998/namespace"
def w(t): return f"{{{W}}}{t}"
def m(t): return f"{{{M}}}{t}"
DOC = "pk2/word/document.xml"

# exact run text -> ordered parts: ("t",str) | ("sup",base,exp) | ("frac",num,den)
TARGETS = {
 "m / 18": [("frac","m","18")],
 "2. m / 18": [("t","2. "),("frac","m","18")],
 "8. 2j ÷ 6": [("t","8. "),("frac","2j","6")],
 "7. -15/8 = w - 3/8": [("t","7. -"),("frac","15","8"),("t"," = w - "),("frac","3","8")],
 "10. n / 4 = 15": [("t","10. "),("frac","n","4"),("t"," = 15")],
 "11. -18 = y / 6": [("t","11. -18 = "),("frac","y","6")],
 "Marcus scored 15 points in the basketball game. This was 1/4 of the total points the team scored.":
   [("t","Marcus scored 15 points in the basketball game. This was "),("frac","1","4"),
    ("t"," of the total points the team scored.")],
 "7. 9a^2 + 4a^2 - 8a^3":
   [("t","7. 9"),("sup","a","2"),("t"," + 4"),("sup","a","2"),("t"," - 8"),("sup","a","3")],
 "8. 15k^3 + 8m - 7k^3 + 2m":
   [("t","8. 15"),("sup","k","3"),("t"," + 8m - 7"),("sup","k","3"),("t"," + 2m")],
 "11. -1/5(10x + 15) + 2x":
   [("t","11. -"),("frac","1","5"),("t","(10x + 15) + 2x")],
}

def alnum(s): return re.sub(r"[^0-9A-Za-z]", "", s or "")
for orig, parts in TARGETS.items():
    rebuilt = "".join(p[1] if p[0]=="t" else (p[1]+p[2]) for p in parts)
    assert alnum(rebuilt) == alnum(orig), f"spec mismatch: {orig!r}"

def m_run(text):
    r = etree.Element(m("r")); etree.SubElement(r, w("rPr"))
    t = etree.SubElement(r, m("t")); t.set(f"{{{XML}}}space","preserve"); t.text = text
    return r
def make_sup(base, exp):
    o = etree.Element(m("oMath")); s = etree.SubElement(o, m("sSup"))
    pr = etree.SubElement(s, m("sSupPr")); cp = etree.SubElement(pr, m("ctrlPr")); etree.SubElement(cp, w("rPr"))
    etree.SubElement(s, m("e")).append(m_run(base))
    etree.SubElement(s, m("sup")).append(m_run(exp))
    return o
def make_frac(num, den):
    o = etree.Element(m("oMath")); f = etree.SubElement(o, m("f"))
    pr = etree.SubElement(f, m("fPr")); cp = etree.SubElement(pr, m("ctrlPr")); etree.SubElement(cp, w("rPr"))
    etree.SubElement(f, m("num")).append(m_run(num))
    etree.SubElement(f, m("den")).append(m_run(den))
    return o
def make_text_run(rpr, text):
    r = etree.Element(w("r"))
    if rpr is not None: r.append(copy.deepcopy(rpr))
    t = etree.SubElement(r, w("t")); t.set(f"{{{XML}}}space","preserve"); t.text = text
    return r
def make_wrap_run(rpr, moved):
    r = etree.Element(w("r"))
    if rpr is not None: r.append(copy.deepcopy(rpr))
    for cn in moved: r.append(cn)
    return r

tree = etree.parse(DOC); root = tree.getroot()
def all_text(r): return "".join((t.text or "") for t in r.iter(w("t"), m("t")))
before_alnum = alnum(all_text(root))
before_omath = len(list(root.iter(m("oMath"))))
expected_hits = sum(1 for t in root.iter(w("t")) if t.text in TARGETS)
expected_added = sum(sum(1 for p in parts if p[0] in ("sup","frac")) for parts in TARGETS.values()
                     for _ in range(sum(1 for t in root.iter(w("t")) if t.text == list(TARGETS.keys())[list(TARGETS.values()).index(parts)]))) if False else None

converted = 0
for tnode in list(root.iter(w("t"))):
    txt = tnode.text
    if txt not in TARGETS: continue
    run = tnode.getparent(); para = run.getparent()
    kids = list(run); ti = kids.index(tnode); rpr = run.find(w("rPr"))
    before = [c for c in kids[:ti] if c is not rpr]
    after = kids[ti+1:]
    ridx = list(para).index(run)
    new = []
    if before: new.append(make_wrap_run(rpr, before))
    for kind, *args in TARGETS[txt]:
        if kind == "t": new.append(make_text_run(rpr, args[0]))
        elif kind == "sup": new.append(make_sup(*args))
        elif kind == "frac": new.append(make_frac(*args))
    if after: new.append(make_wrap_run(rpr, after))
    para.remove(run)
    for j, node in enumerate(new): para.insert(ridx + j, node)
    converted += 1

after_alnum = alnum(all_text(root))
after_omath = len(list(root.iter(m("oMath"))))
remaining = [t.text for t in root.iter(w("t")) if t.text in TARGETS]

print("candidate hits found  :", expected_hits)
print("target runs converted :", converted)
print("oMath equations        :", before_omath, "->", after_omath)
print("content preserved      :", before_alnum == after_alnum)
print("leftover target runs   :", remaining or "none")
assert converted == expected_hits, "missed some occurrences"
assert before_alnum == after_alnum, "content changed!"
assert not remaining, "target text still present as plain run"

tree.write(DOC, xml_declaration=True, encoding="UTF-8", standalone=True)
print("saved", DOC)
