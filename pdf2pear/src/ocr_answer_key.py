"""Read the ANSWER KEY into raw text lines.

Tries the backends in config.OCR_BACKENDS order; first usable one wins.
Only the answer key is read here — never the student-facing content.
Returns raw text (one answer per line, ideally).
"""
from . import config


def _manual():
    import os
    if os.path.exists(config.ANSWERS_TXT):
        with open(config.ANSWERS_TXT, encoding="utf-8") as f:
            txt = f.read().strip()
        if txt:
            print(f"  [ocr] using manual key: {config.ANSWERS_TXT}")
            return txt
    return None


def _pdftext():
    import os
    if not os.path.exists(config.ANSWERS_PDF):
        return None
    try:
        import pdfplumber
    except Exception:
        return None
    out = []
    with pdfplumber.open(config.ANSWERS_PDF) as pdf:
        for pg in pdf.pages:
            out.append(pg.extract_text() or "")
    txt = "\n".join(out).strip()
    if txt:
        print("  [ocr] using pdfplumber text layer of Answers.pdf")
        return txt
    return None


def _mathpix():
    import os
    if not (config.MATHPIX_APP_ID and config.MATHPIX_APP_KEY):
        return None
    if not os.path.exists(config.ANSWERS_PDF):
        return None
    try:
        import requests
    except Exception:
        return None
    # Mathpix PDF endpoint (returns lines/markdown). Simplified single-call form.
    print("  [ocr] calling Mathpix API ...")
    with open(config.ANSWERS_PDF, "rb") as f:
        r = requests.post(
            "https://api.mathpix.com/v3/pdf",
            headers={"app_id": config.MATHPIX_APP_ID, "app_key": config.MATHPIX_APP_KEY},
            data={"options_json": '{"conversion_formats":{"md":true}}'},
            files={"file": f}, timeout=120,
        )
    r.raise_for_status()
    # NOTE: the real flow polls pdf_id -> .md; left as a TODO hook for your key.
    # Return None so the pipeline falls through if not fully wired for your account.
    print("  [ocr] Mathpix submitted; wire polling for your account to enable.")
    return None


def _gemini():
    if not config.GEMINI_API_KEY:
        return None
    # Hook: send Answers.pdf pages to Gemini vision with a strict prompt:
    #   "Transcribe ONLY the answer key as 'N. answer' lines. Do not solve or
    #    rewrite anything." Left as a stub to keep the repo runnable offline.
    print("  [ocr] Gemini key present; add vision call to enable.")
    return None


def _claude():
    if not config.ANTHROPIC_API_KEY:
        return None
    print("  [ocr] Anthropic key present; add vision call to enable.")
    return None


def _openai():
    if not config.OPENAI_API_KEY:
        return None
    print("  [ocr] OpenAI key present; add vision call to enable.")
    return None


_BACKENDS = {
    "manual": _manual, "pdftext": _pdftext, "mathpix": _mathpix,
    "gemini": _gemini, "claude": _claude, "openai": _openai,
}


def read_answer_key():
    for name in config.OCR_BACKENDS:
        fn = _BACKENDS.get(name.strip())
        if not fn:
            continue
        try:
            txt = fn()
        except Exception as e:  # pragma: no cover
            print(f"  [ocr] backend '{name}' error: {e}")
            txt = None
        if txt:
            return txt, name.strip()
    raise SystemExit(
        "No answer key could be read. Provide input/Answers.txt (one answer per "
        "line) or a text-based Answers.pdf, or set an OCR API key.")
