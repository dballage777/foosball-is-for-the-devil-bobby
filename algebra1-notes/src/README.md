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
