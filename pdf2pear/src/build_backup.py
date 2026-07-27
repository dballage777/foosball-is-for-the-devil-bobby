"""Portability backups — CSV and a minimal QTI 2.1 package.

IMPORTANT: Pear Assess CANNOT import these. They exist so your item bank is
portable to platforms that DO import QTI/CSV (Canvas, Schoology, Moodle, etc.).
"""
import csv
import os
import zipfile
import xml.sax.saxutils as sx


def write_csv(answer_map, out_path):
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["item", "page", "type", "answer", "points"])
        for it in answer_map["items"]:
            ans = ("|".join(it["answer"]) if isinstance(it["answer"], list)
                   else it["answer"])
            wr.writerow([it["n"], it.get("page") or "", it["type"], ans, it["points"]])
    print(f"  [backup] wrote {out_path}")
    return out_path


def _qti_item(it):
    ident = f"item{it['n']}"
    ans = it["answer"]
    title = f"Question {it['n']}"
    if it["type"] in ("multiple_choice", "multiple_select"):
        letters = ans if isinstance(ans, list) else [ans]
        card = "multiple" if it["type"] == "multiple_select" else "single"
        correct = "".join(f'<value>{sx.escape(l)}</value>' for l in letters)
        choices = "".join(
            f'<simpleChoice identifier="{c}">{c}</simpleChoice>' for c in "ABCDE")
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
  identifier="{ident}" title="{sx.escape(title)}" adaptive="false" timeDependent="false">
  <responseDeclaration identifier="RESPONSE" cardinality="{card}" baseType="identifier">
    <correctResponse>{correct}</correctResponse>
  </responseDeclaration>
  <itemBody>
    <p>See Problems.pdf item {it['n']}.</p>
    <choiceInteraction responseIdentifier="RESPONSE" shuffle="false"
      maxChoices="{0 if card=='multiple' else 1}">{choices}</choiceInteraction>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
</assessmentItem>"""
    # text / math / true-false -> text entry with a correct string
    val = ans if isinstance(ans, str) else " ".join(ans)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
  identifier="{ident}" title="{sx.escape(title)}" adaptive="false" timeDependent="false">
  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string">
    <correctResponse><value>{sx.escape(val)}</value></correctResponse>
  </responseDeclaration>
  <itemBody>
    <p>See Problems.pdf item {it['n']}.</p>
    <textEntryInteraction responseIdentifier="RESPONSE" expectedLength="20"/>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
</assessmentItem>"""


def write_qti(answer_map, out_zip):
    items = answer_map["items"]
    refs = "".join(
        f'    <resource identifier="item{it["n"]}" type="imsqti_item_xmlv2p1" '
        f'href="item{it["n"]}.xml"><file href="item{it["n"]}.xml"/></resource>\n'
        for it in items)
    manifest = f"""<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="pdf2pear_qti" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
  <organizations/>
  <resources>
{refs}  </resources>
</manifest>"""
    os.makedirs(os.path.dirname(out_zip), exist_ok=True)
    with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("imsmanifest.xml", manifest)
        for it in items:
            z.writestr(f"item{it['n']}.xml", _qti_item(it))
    print(f"  [backup] wrote {out_zip} ({len(items)} items)  [portability only — "
          f"Pear cannot import this]")
    return out_zip
