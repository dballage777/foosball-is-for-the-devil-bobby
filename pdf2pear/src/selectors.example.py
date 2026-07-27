"""Pear Assess Snap Quiz selectors for AUTO mode.

These CANNOT be guessed — Pear's UI is private and changes. Capture them on YOUR
logged-in account:

    pip install playwright
    playwright codegen https://assessment.peardeck.com

Click through: Create -> Snap Quiz -> upload -> choose a question type -> place a
box -> type an answer -> set points -> save. `codegen` prints the selectors it
used; paste the right ones below, then copy this file to  src/selectors.py.

If a selector is flaky, prefer role/text locators, e.g.:
    'role=button[name="Multiple choice"]'   or   'text=Text Entry'
"""

# the element that renders the uploaded PDF (answer boxes are dropped on it)
PDF_CANVAS = "CHANGE_ME_pdf_canvas_selector"

# button per question type (keys must match answer_map 'type' values)
TYPE_BUTTON = {
    "multiple_choice": "CHANGE_ME",
    "multiple_select": "CHANGE_ME",
    "true_false":      "CHANGE_ME",
    "text_entry":      "CHANGE_ME",
    "math":            "CHANGE_ME",
}

ANSWER_FIELD = "CHANGE_ME_correct_answer_input"
POINTS_FIELD = "CHANGE_ME_points_input"
SAVE_ITEM = "CHANGE_ME_save_or_done_button"
