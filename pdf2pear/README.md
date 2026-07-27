# pdf2pear

One-command **prep pipeline** for turning two Geometry PDFs (student problems +
answer key) into a **Pear Assess "Snap Quiz"** assignment with **zero content
variation**.

## Why this shape?
Pear Assess has **no import format (no QTI/CC/CSV) and no public API**, so a
fully hands-off import is impossible. The only native path that preserves your
diagrams and wording **pixel-perfectly** is **Snap Quiz**, which uses your
original PDF as the display surface. `pdf2pear` automates everything *around*
that: it reads the answer key, infers question types, renders page images,
builds a click-by-click **placement guide**, and runs a **validation report** —
so the only manual step is entering the pre-listed answers in Pear's UI.
(See `../pear-assess-research/Pear_Assess_Conversion_Research.md` for the full rationale.)

Nothing is ever rewritten. OCR is used only to read the **answer key**.

## Install
```bash
pip install -r requirements.txt      # pdfplumber, pypdfium2, pillow are enough for the offline path
```

## Use
1. Put your files in `input/`:
   - `Problems.pdf` (required — the student worksheet)
   - `Answers.pdf` **or** `Answers.txt` (the key; `Answers.txt` = one per line: `1. B`)
2. Run:
   ```bash
   python run.py
   ```
3. Open the results in `output/`:
   - `placement_guide.html` — page images + each item's type/answer/points to enter
   - `validation_report.html` — ✓/⚠/✗ cross-checks
   - `answer_map.json` — structured, verbatim key
   - `backup/items.csv`, `backup/qti_package.zip` — portability only (**Pear can't import these**)
4. In Pear Assess: **Create → Snap Quiz → upload `input/Problems.pdf`**, then place
   each item and set the answer/points from the guide. Publish.

*The repo ships with a tiny sample `input/` so `python run.py` works immediately as a demo — replace those files with your own.*

## Answer key without an API
The offline default reads `input/Answers.txt` (or the text layer of a text-based
`Answers.pdf`). For scanned/handwritten keys, set one of:
`MATHPIX_APP_ID`+`MATHPIX_APP_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, or
`OPENAI_API_KEY`, and add the vision call in `src/ocr_answer_key.py` (hooks are
stubbed). Mathpix is the most accurate for math; Gemini/Claude vision are strong
for reading a printed key.

## Optional: supervised browser automation
`src/automate_pear.py` (off unless `PDF2PEAR_PLAYWRIGHT=1`) drives Snap Quiz with
Playwright. Pear has no API, so this automates the real UI — **ToS-gray and
selector-fragile**; run supervised on your own login. Capture selectors with
`playwright codegen` and fill the placement loop.

## Question types inferred
`multiple_choice`, `multiple_select`, `true_false`, `text_entry`, `math`
(all supported by Snap Quiz). Rules are deterministic — see `src/classify_types.py`.

## Layout
```
input/            Problems.pdf, Answers.pdf|Answers.txt
src/              config, extract_pages, extract_figures, ocr_answer_key,
                  parse_problems, parse_answers, classify_types, build_guide,
                  validate, build_backup, automate_pear
output/           generated (gitignored)
run.py            orchestrator
```
