# Converting Two Geometry PDFs → a Pear Assess (Edulastic) Assignment
### Research + Automation Architecture Report
*Prepared July 2026. Findings verified against public documentation and third‑party sources (linked at the end). Engineering recommendations are labeled as such.*

---

## 0. The one finding that changes everything (read first)

**Pear Assess (formerly Edulastic) has no general content‑import format and no public authoring API.** It cannot import QTI 2.1, QTI 3.0, IMS Common Cartridge, CSV item banks, JSON, or XML. This is confirmed both by the absence of any importer in the product and by the fact that the leading third‑party migration tool (GETMARKED Digitaliser) does **not** hand Pear a QTI file — it logs in and **programmatically recreates the quiz through the UI on your behalf** (browser automation).

The native ways content gets *into* Pear Assess are only these (all visible on your "Author Test" screen):

| Path | What it ingests | Rewrites content? | Diagram fidelity |
|---|---|---|---|
| **Snap Quiz** | your **PDF**, used as the actual test canvas | **No** | **Perfect** (students see the original PDF) |
| **Content Converter** | PDF/DOCX/JPG/PNG (≤10 MB); extracts text + questions | No (extracts, doesn't paraphrase) | Poor for vector geometry (text‑extraction) |
| **Google Forms import** | a Google Form (≤50 items) | No | N/A (Forms can't hold real geometry figures) |
| **Using AI / Question Generator** | a prompt/standard | **Yes — generates/rewrites** | N/A |
| **Smart Build** | an item bank pool | N/A | N/A |

Because your hard requirement is **zero content variation and pixel‑perfect diagrams**, the "Using AI" path is disqualified, and QTI/CSV/JSON packages are worthless (nothing consumes them). **The only native path that guarantees pixel‑perfect diagrams and zero rewriting is Snap Quiz**, precisely because it *keeps your original PDF as the display surface* and only overlays interactive answer regions.

Everything below is built around that reality.

---

## 1. Executive Summary

- **Best achievable workflow:** **Snap Quiz** (PDF‑as‑canvas) + a local "**prep**" pipeline (Claude Code/Python) that reads both PDFs and produces an **answer‑key map**, a **question‑placement guide**, cleaned/split PDF assets, and a **validation report**. You upload the Problems PDF to Snap Quiz once; the guide tells you exactly where to click and which answer/points to set for every question. Optional Playwright automation can perform the clicks, but that is ToS‑gray and brittle.
- **Why not a "one‑command import":** Pear exposes **no import format and no API**, so a fully hands‑off "generate package → import → done" is **technically impossible** with zero variation. The limiting factor is **the platform**, not AI or OCR.
- **Fidelity ranking of realistic options:** Snap Quiz (highest, pixel‑perfect) → Content Converter (good for pure‑text MC, loses geometry figures) → third‑party browser‑bot recreation (GETMARKED; re‑renders items, math/diagrams degrade) → AI generation (disqualified).
- **What the local pipeline *can* fully automate:** OCR of the answer key, structured answer map, per‑question type inference, page/coordinate placement hints, and a diff‑style validation report between the two PDFs. That is ~80–90% of the human effort removed even though the final placement stays in Pear's UI.
- **Estimated time savings:** Manual re‑authoring of a 25‑item geometry test with figures ≈ 60–120 min. Snap Quiz + prep guide ≈ 10–20 min. **~75–85% reduction**, with **100% content fidelity** (the PDF is the content).

---

## 2. Best Workflow (recommended) — "Snap Quiz + Prep Pipeline"

**Concept:** Never re‑create the questions. Upload the *actual* Problems PDF into Snap Quiz so students see the original pages (diagrams, congruence/parallel/angle symbols, radicals, fractions, coordinate grids — all intact because they are the original raster/vector of the PDF). Use PDF #2 only to set the **answer key + point values**.

**Steps**
1. **Prep (automated, local):** run the pipeline on `Problems.pdf` + `Answers.pdf`. It outputs:
   - `answer_map.json` — `{item, page, type, correct_answer, points}` parsed from the Answer Key.
   - `placement_guide.pdf/html` — the Problems PDF with each question number, its detected answer, and suggested question‑type badge, so placement is mechanical.
   - `assets/` — cropped diagram images + per‑page PNGs (backup / for the CSV/Content‑Converter fallback).
   - `validation_report.html` — cross‑checks (see §9).
2. **Create → Snap Quiz** in Pear Assess; upload `Problems.pdf`.
3. For each item: click the question‑type tool, click the spot on the page, set the **correct answer** and **points** from `answer_map.json`. (Snap Quiz supports MC, true/false, multiple‑select, text entry, drop‑down, math, essay.)
4. **Review** against `validation_report.html`; **Publish/Assign**.

**Why this wins:** zero paraphrasing, identical wording/numbering/choices (they're the PDF), pixel‑perfect diagrams, teacher‑only answer key, and native auto‑grading for objective types.

---

## 3. Alternative Workflows (ranked, with trade‑offs)

**A. Content Converter (fast, text‑only tests).** Upload PDF/DOCX; Pear "pulls out the text and questions exactly as they appear" into editable items (no paraphrasing). *Best when the test is mostly text MC with no figures.* **Limitation for you:** it extracts text — **geometry diagrams/coordinate grids are not preserved as authored**; complex math may degrade. Not acceptable when figures matter. Good as a **speed option for the non‑figure items** or as a backup.

**B. Third‑party migration bot (GETMARKED Digitaliser).** Accepts Word/QTI/Common Cartridge/many LMS exports and **recreates** the quiz inside Pear via automation. Useful if you already have a QTI/Word bank. **Limitation:** it *re‑renders* items, so math/diagram fidelity depends on the source and its converter — **not pixel‑perfect**, and it's a paid third party operating in Pear on your credentials.

**C. Your own browser automation (Playwright/Selenium/Puppeteer) driving Snap Quiz.** Uploads the PDF and performs the placement clicks from `answer_map.json`. **Highest automation of the faithful path**, but **ToS‑gray, brittle** (selectors change), and requires your login. Recommended only as an optional module, human‑supervised.

**D. Google Forms bridge.** Build a Form (≤50 items), import via Content Converter/Forms path. **Disqualified for geometry:** Forms can't hold real figures/notation; you'd be recreating content = variation.

**E. QTI/CC/CSV package.** **Not viable** — Pear has no importer. Produce it only as a **portable backup** for other platforms, never as the Pear ingestion path.

---

## 4. Automation‑Level Comparison

| Workflow | Content fidelity | Diagram fidelity | Automation of *prep* | Automation of *upload into Pear* | ToS risk |
|---|---|---|---|---|---|
| Snap Quiz + guide (recommended) | 100% | 100% | Full | Manual clicks (guided) | None |
| Snap Quiz + Playwright | 100% | 100% | Full | Full (fragile) | Gray |
| Content Converter | High (text) | Low | Full (file prep) | Native (few clicks) | None |
| GETMARKED bot | Medium | Medium | Full | Full (their bot) | Vendor‑dependent |
| AI generation | Low (rewrites) | None | Full | Native | None |

**Bottom line:** the *only* variable you truly control for zero‑variation is "don't let anything re‑render your content." Snap Quiz is the sole native path that satisfies that.

---

## 5. PDF Extraction & OCR (for the answer key and backups)

You need two very different extractions:
- **Diagrams/figures/coordinate grids:** never OCR these into text. **Crop them as images** (vector‑preserving where possible) so any fallback keeps them intact. In Snap Quiz they need no extraction at all — the PDF *is* the image.
- **Answer key + question text (for the map, validation, and backups):** this is where OCR matters.

**Math OCR ranking for geometry (verified):**
1. **Mathpix** — best measured accuracy on math (avg BLEU ~0.72 vs Nougat ~0.57); handles fractions, radicals, exponents, and many math symbols; paid API. **Recommended primary.**
2. **Gemini (vision) / Claude (vision)** — recent benchmarks show top LLM vision models now rival Mathpix on many pages and are excellent at *layout + light math*; strongest for reading an answer key ("1. B, 2. 7x−4, …"). Great **primary for the answer‑key map**, secondary for equations.
3. **Google Document AI / Azure Document Intelligence** — excellent layout/tables/printed text, weaker on standalone equations. Use for **tables/coordinate‑table extraction**.
4. **Nougat / texify** — free, self‑hosted, scientific‑doc trained; good offline fallback.
5. **Tesseract** — plain text only; not for math. Last resort.

**Symbols that break naive OCR** (≅ congruent, ∥ parallel, ∠ angle, ⊥ perpendicular, △ triangle, →, √, superscripts, mixed numbers): Mathpix/Gemini handle most; always keep the **cropped image** as the source of truth and treat OCR text as metadata, not as replacement content.

---

## 6. Is a public Pear/Edulastic API available? (reverse‑engineering note)

- **No public developer/authoring API** was found (no developer portal, no documented endpoints for login, create‑assessment, upload‑item, import). Integrations are limited to **SSO (Google/Office 365/Clever/rostering)** and **LTI**, not content authoring.
- The app is a SPA that talks to an **internal/private JSON backend**. It is technically observable in your browser's network tab, but it is **undocumented, unauthenticated for third parties, and subject to change** — using it programmatically is reverse‑engineering a private API and is **ToS‑gray**. This report does **not** recommend hitting private endpoints.
- **Sanctioned automation** = browser automation that does exactly what a human does in the UI (Playwright), supervised, on your own account. That's the only defensible "automated upload."

---

## 7. Zero‑Variation Guarantee — how each requirement is met

| Requirement | How Snap Quiz guarantees it |
|---|---|
| Identical wording | The PDF text is displayed as‑is; nothing is re‑typed. |
| Identical numbering | Original numbers are on the page. |
| Identical answer choices | Choices are on the page image; you only mark which is correct. |
| Identical diagrams/images/grids | The page **is** the image — pixel‑perfect. |
| Identical point values | Set from `answer_map.json` (source of truth = Answer Key). |
| Identical teacher answers / grading | Answer key entered from PDF #2; objective types auto‑grade. |
| No AI rewriting | No generation step anywhere in the path. |

**The only unavoidable differences** are interaction‑layer, not content: e.g., a student types an answer in an overlay box instead of on paper, and free‑response/geometric‑construction items still require manual grading (no auto‑grader can grade a proof). These are **platform limitations, not AI or fidelity losses.**

---

## 8. Claude Code Project — architecture & implementation plan

**Name:** `pdf2pear` — a local, one‑command **prep** pipeline (no rewriting, deterministic).

**Inputs:** `Problems.pdf`, `Answers.pdf`
**Outputs:** `answer_map.json`, `placement_guide.html`, `assets/` (page PNGs + cropped figures), `validation_report.html`, `backup/qti_package.zip` + `backup/items.csv` (portability only), optional `screenshots/` from a supervised Playwright run.

### Folder structure
```
pdf2pear/
├── input/
│   ├── Problems.pdf
│   └── Answers.pdf
├── src/
│   ├── config.py            # API keys, options, question-type rules
│   ├── extract_pages.py     # PDF -> per-page PNG @300dpi (pdf2image/pypdfium2)
│   ├── extract_figures.py   # detect + crop diagrams/grids (bboxes) -> assets/
│   ├── ocr_answer_key.py    # Mathpix/Gemini -> raw answer text per item
│   ├── parse_answers.py     # normalize -> answer_map.json (item,type,answer,points)
│   ├── parse_problems.py    # item count, numbering, choice letters (validation only)
│   ├── classify_types.py    # infer MC / T-F / multi-select / text / math per item
│   ├── build_guide.py       # placement_guide.html (page image + answer badges)
│   ├── build_backup.py      # OPTIONAL QTI 2.1 + CSV (portability, NOT for Pear)
│   ├── validate.py          # cross-check problems vs answers -> report
│   └── automate_pear.py     # OPTIONAL Playwright: upload + place (supervised)
├── output/
│   ├── answer_map.json
│   ├── placement_guide.html
│   ├── validation_report.html
│   ├── assets/
│   └── backup/
├── requirements.txt
├── run.py                   # orchestrates: python run.py
└── README.md
```

### `answer_map.json` (schema)
```json
{
  "source": "Answers.pdf",
  "items": [
    {"n": 1, "page": 1, "type": "multiple_choice", "answer": "B", "points": 1},
    {"n": 2, "page": 1, "type": "text_entry",      "answer": "7x - 4", "points": 1},
    {"n": 3, "page": 2, "type": "multiple_select",  "answer": ["A","C"], "points": 2},
    {"n": 4, "page": 2, "type": "math",             "answer": "\\frac{3xy}{r}", "points": 1}
  ]
}
```

### Required Python packages
`pypdfium2` or `pdf2image`+`poppler` (render), `pymupdf`/`fitz` (figure bboxes + image crops), `pdfplumber` (text/coords), `mpxpy` or `requests` (Mathpix API), `google-generativeai` / `anthropic` / `openai` (vision OCR fallback), `pillow`, `lxml` (QTI backup), `jinja2` (HTML guide/report), `playwright` (optional automation), `pytest` (tests).

### Required APIs / keys
- **Mathpix** (`APP_ID`,`APP_KEY`) — primary math OCR (optional but recommended).
- **Gemini or Claude or OpenAI vision key** — answer‑key reading / OCR fallback.
- **No Pear API** (doesn't exist). Playwright uses your normal Pear login, supervised.

### Implementation plan (phases)
1. **Render & figures** — pages → PNG; detect image/vector regions; crop to `assets/` with bbox metadata.
2. **Answer‑key OCR & parse** — read `Answers.pdf`, normalize to `answer_map.json`. Human confirms once.
3. **Type inference** — from choice patterns (A–D ⇒ MC; two options ⇒ T/F; "select all" ⇒ multi‑select; blank line ⇒ text; expression ⇒ math).
4. **Placement guide** — render each page with the item number + parsed answer + type badge overlaid → `placement_guide.html`. This is what you follow while clicking in Snap Quiz.
5. **Validation** — §9.
6. **Backups** — emit QTI 2.1 + CSV for portability to other platforms (never for Pear).
7. **(Optional) Playwright** — supervised upload + placement; capture `screenshots/` for verification. Feature‑flagged off by default.

*Deliverable note:* I can scaffold this repo (all stub files + working `parse_answers`, `validate`, and `build_guide`) on request; the Mathpix/Playwright modules need your API keys/login to run.

---

## 9. Validation System (automated diff against the PDFs)

`validate.py` produces `validation_report.html` checking:
- **Item count** in Problems vs Answers vs `answer_map` (must match).
- **Numbering sequence** continuous (no gaps/dupes).
- **Choice completeness** (every MC has the expected letters).
- **Answer legality** (MC answer letter exists in that item's choices).
- **Point total** vs the key's stated total (if present).
- **Figure inventory** (every detected diagram is accounted for on some item's page).
- **Symbol sanity** (flags OCR items containing replacement chars □/� for manual review).
- **Type coverage** (no item left "unknown").

Output: a table with ✓ / ⚠ / ✗ per item and a "differences" list. Anything ⚠/✗ is a human‑review queue — the pipeline never "fixes" content silently.

---

## 10. Best Import Format — ranked for Pear specifically

| Format | Pear import? | Fidelity if it worked | Verdict for Pear |
|---|---|---|---|
| **PDF via Snap Quiz** | ✅ native | Pixel‑perfect | **#1 — use this** |
| **PDF/DOCX via Content Converter** | ✅ native | Text high, figures low | #2 (text tests / backup) |
| Google Form | ✅ native | No figures, ≤50 | Niche |
| QTI 2.1 / 3.0 | ❌ none | (High) | Backup/portability only |
| IMS Common Cartridge | ❌ none | (Med) | Backup only |
| CSV / JSON / XML | ❌ none | (Low‑Med) | Backup only |
| Item‑bank export | ❌ (Pear‑internal only) | — | N/A |

---

## 11. Risk Analysis

- **Platform lock‑in (high):** no API/QTI means you depend on Snap Quiz/Content Converter UI; Pear can change these. *Mitigation:* keep the source PDFs + `answer_map.json` + QTI backup so you can move platforms.
- **Browser‑automation fragility & ToS (medium):** selectors break; automating logged‑in actions may violate ToS. *Mitigation:* keep Playwright optional, supervised, low‑rate; default to the guided‑manual path.
- **OCR error on the answer key (low‑medium):** a misread key silently mis‑grades. *Mitigation:* human confirmation of `answer_map.json`; validation flags illegal answers.
- **Snap Quiz auto‑grade scope (medium):** proofs/constructions/free‑response can't auto‑grade. *Mitigation:* mark those as manually graded; that's inherent to the content.
- **File size / page count limits (low):** Content Converter ≤10 MB, Forms ≤50 items; Snap Quiz handles multi‑page PDFs. *Mitigation:* split large PDFs.

---

## 12. Known Limitations (platform vs AI, clearly separated)

**Platform limitations (cause the only unavoidable differences):**
- No import of QTI/CC/CSV/JSON; no authoring API.
- Snap Quiz answer regions are overlays; students interact in boxes, not on paper.
- Auto‑grading covers objective types only.

**AI/OCR limitations (avoidable by design):** none affect displayed content in the Snap Quiz path, because **no AI touches the questions**. OCR is used only to read the *answer key* and to build validation metadata; errors there are caught by human confirmation + validation, and never alter what students see.

---

## 13. Estimated Accuracy

- **Displayed content (wording/numbering/choices/diagrams/math):** **100%** — it is the original PDF.
- **Answer‑key transcription (automated):** ~97–99% with Mathpix/LLM + human confirmation of the flagged items ⇒ effectively **100% after review**.
- **Auto‑grading correctness:** 100% for objective items with a correct key; manual for proofs/constructions.

---

## 14. Estimated Time Savings

- Manual re‑authoring (25 items, figures): **60–120 min**.
- Snap Quiz + prep guide: **10–20 min** (upload once, click‑place with answers pre‑listed).
- **Net savings ~75–85%**, at full fidelity. Adding supervised Playwright can push placement toward near‑zero touch but adds setup/maintenance risk.

---

## 15. Recommendation

1. **Use Snap Quiz** as the ingestion path — it is the only native method that preserves your geometry PDFs pixel‑perfectly with **zero rewriting**.
2. **Build the `pdf2pear` prep pipeline** so the human step in Pear is reduced to mechanical, guided clicks with the answer key pre‑parsed and validated. This is the "one command" you actually can have — it produces the guide + validation, not a magic import (which Pear does not support).
3. **Keep QTI 2.1 + CSV backups** purely for portability to other platforms; **do not** expect Pear to import them.
4. **Treat full browser automation as optional**: only if you accept the ToS‑gray/fragility trade‑off, run it supervised on your own login.
5. **Do not use the "Using AI"/Question Generator path** for this goal — it rewrites and generates, which violates your zero‑variation requirement.

**Why a truly hands‑off "upload two PDFs → one command → done" is impossible here:** the blocking factor is entirely **Pear Assess's lack of an import format and authoring API**. Given that constraint, Snap Quiz + a local prep/validation pipeline is the closest achievable workflow, and it reaches **100% content fidelity** — the residual human effort exists solely because Pear requires content to be placed through its UI, not because of any AI or OCR shortcoming.

---

## Sources
- GETMARKED Digitaliser — importing quizzes into Pear Assessment (confirms no native import; third‑party recreates via automation): https://digitaliser.getmarked.ai/blog/how-to-import-edulastic-quiz-from-any-learning-platform/ · User guide: https://digitaliser.getmarked.ai/guide/
- Pear Deck Learning — Content Converter (accepts PDF/DOCX/JPG/PNG ≤10 MB; extracts content, does not paraphrase): https://www.peardeck.com/blog/quickly-convert-existing-materials-into-dynamic-digital-lessons-with-content-converter
- Pear Deck Learning — Pear Assessment release notes / product updates: https://www.peardeck.com/product-updates/pear-assessment-release-notes
- Pear Deck Learning — Question Generator / Assisted Rubric (AI features, i.e., the rewriting path to avoid): https://www.peardeck.com/blog/harness-the-power-of-ai-with-pear-assessment-question-generator-and-assisted-rubric
- GoGuardian Support — SnapQuiz: turn a paper‑based assessment digital: https://support.goguardian.com/s/article/SnapQuiz-Turn-a-Paper-Based-Assessment-to-Digital-1629330178216
- Edulastic Knowledge Base — Create Assessments (Scratch / SnapQuiz / Import items): https://edulastic.zendesk.com/hc/en-us/sections/202321003-Create-Assessments
- DSST — Creating Assessments (SnapQuiz question types & workflow): https://dsst.zendesk.com/hc/en-us/articles/360046790572-Creating-Assessments
- Math OCR benchmark (Mathpix vs Nougat vs LLM vision): https://igorrivin.github.io/blog/ocr-benchmark/ · texify (open‑source math OCR): https://github.com/VikParuchuri/texify · LaTeX extraction overview: https://www.llamaindex.ai/glossary/latex-extraction-from-pdf
