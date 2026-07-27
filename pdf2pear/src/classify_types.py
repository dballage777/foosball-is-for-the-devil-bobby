"""Infer the Pear Assess question type for each item from its keyed answer and
(optionally) the problem's detected choices. Deterministic rules only.
"""
import re

MATH_HINT = re.compile(r"[=^√≤≥≠π∑∫]|/|\\frac|\\sqrt|[a-zA-Z]\^?\d|[a-zA-Z]\s*[+\-*/]\s*\d")
LETTERS_ONLY = re.compile(r"^[A-E](\s*[,;/&]| and )\s*[A-E]"  # 2+ letters
                          r"(\s*(?:[,;/&]| and )\s*[A-E])*$", re.I)
SINGLE_LETTER = re.compile(r"^[A-E]$", re.I)
TF = {"true", "false", "t", "f"}


def classify(answer, choices=None):
    """Return (type, normalized_answer)."""
    a = str(answer).strip()
    low = a.lower()

    # explicit multi-letter selection
    if LETTERS_ONLY.match(a):
        letters = re.findall(r"[A-E]", a.upper())
        return "multiple_select", letters

    if SINGLE_LETTER.match(a):
        return "multiple_choice", a.upper()

    if low in TF:
        return "true_false", ("True" if low in ("true", "t") else "False")

    # numeric-only (integer / decimal / fraction / negative) -> text entry
    if re.fullmatch(r"-?\d+(\.\d+)?", a) or re.fullmatch(r"-?\d+/\d+", a):
        return "text_entry", a

    # looks mathematical (expression / equation) -> math item
    if MATH_HINT.search(a):
        return "math", a

    # word-problem style "equation; value" -> math (keep whole string)
    if ";" in a:
        return "math", a

    # otherwise short free response
    return "text_entry", a
