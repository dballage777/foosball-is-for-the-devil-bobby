"""Central configuration for pdf2pear.

No content is ever rewritten. OCR is used ONLY to read the answer key and to
build validation metadata — never to alter what a student sees.
"""
import os

# ---- inputs / outputs ----
INPUT_DIR = os.environ.get("PDF2PEAR_INPUT", "input")
OUTPUT_DIR = os.environ.get("PDF2PEAR_OUTPUT", "output")
PROBLEMS_PDF = os.path.join(INPUT_DIR, "Problems.pdf")
ANSWERS_PDF = os.path.join(INPUT_DIR, "Answers.pdf")

# Optional: a hand-written answer key, one per line ("1. B", "2. 7x - 4").
# If present, it is used verbatim and NO OCR/API call is made.
ANSWERS_TXT = os.path.join(INPUT_DIR, "Answers.txt")

# ---- rendering ----
PAGE_DPI = 150            # page PNGs for the placement guide

# ---- OCR backend selection ----
# order tried for reading the ANSWER KEY. First one that is usable wins.
#   "manual"     -> input/Answers.txt (offline, deterministic)
#   "pdftext"    -> pdfplumber text layer of Answers.pdf (offline; text PDFs only)
#   "mathpix"    -> Mathpix API   (needs MATHPIX_APP_ID / MATHPIX_APP_KEY)
#   "gemini"     -> Gemini vision (needs GEMINI_API_KEY)
#   "claude"     -> Claude vision (needs ANTHROPIC_API_KEY)
#   "openai"     -> OpenAI vision (needs OPENAI_API_KEY)
OCR_BACKENDS = os.environ.get("PDF2PEAR_OCR", "manual,pdftext,mathpix,gemini,claude,openai").split(",")

MATHPIX_APP_ID = os.environ.get("MATHPIX_APP_ID")
MATHPIX_APP_KEY = os.environ.get("MATHPIX_APP_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# ---- defaults ----
DEFAULT_POINTS = 1

# ---- optional browser automation (OFF by default; ToS-gray, supervised only) ----
ENABLE_PLAYWRIGHT = os.environ.get("PDF2PEAR_PLAYWRIGHT", "0") == "1"
PEAR_BASE_URL = "https://assessment.peardeck.com"
