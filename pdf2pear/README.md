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

## Supervised browser automation (`python automate.py`)
Pear has no API, so this drives the **real Snap Quiz UI** with Playwright — only
doing what a human does, on **your** login. **ToS-gray, supervised, low-rate.**
Requires a **desktop OS with a display** (on ChromeOS: the Linux/Crostini
container). Install: `pip install playwright` (a Chromium is auto-located; set
`PDF2PEAR_CHROME=/path/to/chrome` if needed).

Two modes:

- **assist** (default, robust, **no Pear selectors needed**):
  ```bash
  python automate.py            # or: --points to also type point values
  ```
  A browser opens; you sign in, open **Create → Snap Quiz**, and upload
  `Problems.pdf`. Then for each item the terminal shows the answer; you place the
  box and click into its field, press **Enter**, and the script **types the
  pre-parsed answer** into the focused field (`s`=skip, `p`=also type points,
  `q`=quit). Because it types into whatever you focused, it does **not** break
  when Pear changes its UI. A screenshot per item is saved to `output/screenshots/`.

- **auto** (advanced scaffold, fragile): fully clicks type → location → answer
  using selectors you capture once with `playwright codegen` into
  `src/selectors.py` (template: `src/selectors.example.py`) plus
  `output/click_points.json` (auto-generated). Falls back to a clear message per
  item if a selector fails.
  ```bash
  cp src/selectors.example.py src/selectors.py   # then fill it via codegen
  python automate.py --mode auto
  ```

**What automation can't remove:** you still must be logged in and have the PDF
uploaded; auto mode's click coordinates are approximate (Pear renders the PDF in
its own canvas), so supervise it. The assist mode is the recommended, reliable
path — it removes the lookup/typing, you keep the placement clicks.

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
