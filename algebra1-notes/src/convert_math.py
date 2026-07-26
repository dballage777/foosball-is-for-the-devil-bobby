#!/usr/bin/env python3
"""Convert the plain-text math in the Unit 1 packet into native OMML equations
   (same <m:oMath> structure the file already uses), preserving everything else.
   Each target run is matched by its EXACT text and split into text + equation
   parts. Nothing else in the document is touched. Strict checks verify that no
   alphanumeric content is lost and the XML stays well-formed."""
import copy, re, sys
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
M = "http://schemas.openxmlformats.org/officeDocument/2006/math"
XML = "http://www.w3.org/XML/1998/namespace"
def w(t): return f"{{{W}}}{t}"
def m(t): return f"{{{M}}}{t}"

DOC = "pk/word/document.xml"

# ---- segmentation specs: exact run text -> ordered parts ----
# part kinds: ("t", str) plain text ; ("sup", base, exp) ; ("frac", num, den)
TARGETS = {
 "7. Evaluate (m + n)^3; use m = 2 and n = 4":
   [("t","7. Evaluate "),("sup","(m + n)","3"),("t","; use m = 2 and n = 4")],
 "8. Evaluate (8 - a)^5; use a = 5":
   [("t","8. Evaluate "),("sup","(8 - a)","5"),("t","; use a = 5")],
 "9. Evaluate (3d)^2 - f^2; use d = 4 and f = 12":
   [("t","9. Evaluate "),("sup","(3d)","2"),("t"," - "),("sup","f","2"),("t","; use d = 4 and f = 12")],
 "7. -15/8 = w - 3/8":
   [("t","7. -"),("frac","15","8"),("t"," = w - "),("frac","3","8")],
 "10. n / 4 = 15":
   [("t","10. "),("frac","n","4"),("t"," = 15")],
 "11. -18 = y / 6":
   [("t","11. -18 = "),("frac","y","6")],
 "Marcus scored 15 points in the basketball game. This was 1/4 of the total points the team scored.":
   [("t","Marcus scored 15 points in the basketball game. This was "),("frac","1","4"),("t"," of the total points the team scored.")],
}

def alnum(s): return re.sub(r"[^0-9A-Za-z]", "", s or "")

# verify every spec reproduces the original alphanumerics
for orig, parts in TARGETS.items():
    rebuilt = "".join(
        p[1] if p[0]=="t" else (p[1]+p[2]) for p in parts)
    assert alnum(rebuilt) == alnum(orig), f"spec mismatch: {orig!r}"

def m_run(text):
    r = etree.Element(m("r")); etree.SubElement(r, w("rPr"))
    t = etree.SubElement(r, m("t")); t.set(f"{{{XML}}}space","preserve"); t.text = text
    return r
def make_sup(base, exp):
    o = etree.Element(m("oMath")); s = etree.SubElement(o, m("sSup"))
    pr = etree.SubElement(s, m("sSupPr")); cp = etree.SubElement(pr, m("ctrlPr")); etree.SubElement(cp, w("rPr"))
    e = etree.SubElement(s, m("e")); e.append(m_run(base))
    sp = etree.SubElement(s, m("sup")); sp.append(m_run(exp))
    return o
def make_frac(num, den):
    o = etree.Element(m("oMath")); f = etree.SubElement(o, m("f"))
    pr = etree.SubElement(f, m("fPr")); cp = etree.SubElement(pr, m("ctrlPr")); etree.SubElement(cp, w("rPr"))
    n = etree.SubElement(f, m("num")); n.append(m_run(num))
    d = etree.SubElement(f, m("den")); d.append(m_run(den))
    return o

tree = etree.parse(DOC)
root = tree.getroot()

def all_text(r):
    # visible text in DOCUMENT ORDER (both Word runs and math runs)
    return "".join((t.text or "") for t in r.iter(w("t"), m("t")))
before_alnum = alnum(all_text(root))
before_omath = len(list(root.iter(m("oMath"))))

def make_text_run(rpr, text):
    r = etree.Element(w("r"))
    if rpr is not None:
        r.append(copy.deepcopy(rpr))
    t = etree.SubElement(r, w("t")); t.set(f"{{{XML}}}space","preserve"); t.text = text
    return r

def make_wrap_run(rpr, moved_children):
    """A <w:r> carrying rPr + the given (existing) sibling nodes, in order."""
    r = etree.Element(w("r"))
    if rpr is not None:
        r.append(copy.deepcopy(rpr))
    for cn in moved_children:
        r.append(cn)          # lxml moves the node out of its old parent
    return r

converted = 0
for tnode in list(root.iter(w("t"))):
    txt = tnode.text
    if txt not in TARGETS:
        continue
    run = tnode.getparent()                      # <w:r> (may hold breaks + Answer too)
    para = run.getparent()                        # <w:p>
    kids = list(run)
    ti = kids.index(tnode)
    rpr = run.find(w("rPr"))
    before = [c for c in kids[:ti] if c is not rpr]   # siblings before target text (not rPr)
    after  = kids[ti + 1:]                             # siblings after target text
    ridx = list(para).index(run)

    new_nodes = []
    if before:
        new_nodes.append(make_wrap_run(rpr, before))
    for kind, *args in TARGETS[txt]:
        if kind == "t":
            new_nodes.append(make_text_run(rpr, args[0]))
        elif kind == "sup":
            new_nodes.append(make_sup(args[0], args[1]))
        elif kind == "frac":
            new_nodes.append(make_frac(args[0], args[1]))
    if after:
        new_nodes.append(make_wrap_run(rpr, after))

    para.remove(run)
    for j, node in enumerate(new_nodes):
        para.insert(ridx + j, node)
    converted += 1

after_alnum = alnum(all_text(root))
after_omath = len(list(root.iter(m("oMath"))))

print("target runs converted :", converted, "of", len(TARGETS))
print("oMath equations        :", before_omath, "->", after_omath)
print("alphanumeric preserved :", before_alnum == after_alnum,
      "" if before_alnum == after_alnum else f"(DIFF {len(before_alnum)}->{len(after_alnum)})")
assert converted == len(TARGETS), "did not find every target run!"
assert before_alnum == after_alnum, "content changed!"

tree.write(DOC, xml_declaration=True, encoding="UTF-8", standalone=True)
print("saved", DOC)
