# How the Algebra 1 notes .docx is generated

Two steps: `build.js` writes the Word document with [docx-js](https://docx.js.org);
`paginate.py` post-processes it to add the "keep together" / no-split pagination flags.

## Prerequisites
```bash
npm install docx            # Node library that builds the .docx
pip install python-docx     # Python library used by the paginator
```

## Build
```bash
# 1) generate the document
node build.js "Algebra1_Unit1_Lesson1_Variables_and_Expressions.docx"

# 2) stamp pagination properties (keep-with-next, keep-lines, cantSplit)
python3 paginate.py "Algebra1_Unit1_Lesson1_Variables_and_Expressions.docx"
```

Open the resulting `.docx` in Word, or upload to Google Drive and open with Google Docs.

## What each file does
- **build.js** — all content + formatting: title block, Objectives, Real Life Use,
  fill-in-the-blank Vocabulary table, Main Lesson Notes, Common Mistakes, the three
  blank practice tables (Sets A/B/C), Rules, Lesson Summary, Key Takeaways. Manual
  page breaks are placed at Vocabulary / Main Lesson Notes / Examples / Rules.
- **paginate.py** — walks the finished file and turns on, for Word **and** Google Docs:
  *Keep lines together* on every paragraph, *Keep with next* through headings → tables →
  list items, and `cantSplit` on every table row so nothing splits across a page.

## To adapt for another lesson
Edit the content arrays in `build.js` (each section is a clearly commented block),
then re-run both commands. The helpers (`sectionHeader`, `subHeader`, `cell`,
`answerCell`, `blankLine`, `callout`, …) keep every lesson on the same template.

---

# Lessons 2–6 (batch generator)

Lessons 2–6 are generated from a single data-driven pair:

- **specs.js** — all lesson content (objectives, applications, vocabulary,
  example sets, common mistakes, rules, summary, key takeaways) as plain data.
  Every problem/definition is preserved verbatim from the source files.
- **buildLessons.js** — the polished template renderer. Section order follows
  the master spec: 1 Objectives · 2 Real-World Applications · 3 Vocabulary
  (fill-in) · 4 Example Sets · 5 Common Mistakes · 6 Rules & Reference ·
  7 Lesson Summary · 8 Key Takeaways. Exponents (`x^2`) are typeset as real
  superscripts. Each lesson is laid out as **3 pages** with two manual page
  breaks so sections **6–8 sit together on the final study-guide page**.
- **est.py** — a layout estimator that reports the fill % of each page group,
  used to tune example workspace so no lesson spills past 3 pages.

```bash
npm install docx
pip install python-docx
node buildLessons.js       # writes all 5 lesson .docx files
python3 est.py             # sanity-check page fill (optional)
```

The `work:` value on each example set controls how many blank writing lines
appear under each problem — raise it for more student workspace (watch the
`est.py` fill %; keep page-2 under ~90% to stay at 3 pages).

---

# Opening these as native Google Docs

There is no Google Drive connector in this environment, so the files are
delivered as `.docx`. To get a fully editable **native Google Doc**:

1. Go to Google Drive → **New → File upload** and pick the `.docx`.
2. Right-click the uploaded file → **Open with → Google Docs**.
   (Or turn on Drive **Settings → “Convert uploaded files to Google Docs
   editor format”** first, so every upload converts automatically.)

Headings, tables, page breaks, superscripts, and the fill-in blanks all carry
over. Google Docs re-flows pages using its own metrics, so glance through to
confirm the 3-page layout, then delete the original `.docx` copy if you like.
