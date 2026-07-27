#!/usr/bin/env python3
"""pdf2pear — one-command prep pipeline for the Pear Assess "Snap Quiz" workflow.

    python run.py

Reads input/Problems.pdf (+ input/Answers.pdf or input/Answers.txt) and writes:
    output/answer_map.json         structured, verbatim answer key + inferred types
    output/placement_guide.html    page images + per-item answer/points to enter
    output/validation_report.html  ✓/⚠/✗ cross-checks against the problems
    output/assets/pages/*.png      page renders (guide + backup)
    output/backup/items.csv        portability (NOT importable by Pear)
    output/backup/qti_package.zip  portability (NOT importable by Pear)

Nothing is rewritten. OCR (if used) reads only the answer key.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)                    # make input/ and output/ relative to this file
sys.path.insert(0, HERE)

from src import config
from src.extract_pages import render_pages
from src.extract_figures import inventory_figures
from src.ocr_answer_key import read_answer_key
from src.parse_problems import parse_problems
from src.parse_answers import parse_answer_key
from src.build_guide import build_guide
from src.validate import validate
from src.build_backup import write_csv, write_qti
from src.click_points import compute_click_points


def main():
    out = config.OUTPUT_DIR
    os.makedirs(out, exist_ok=True)
    assets = os.path.join(out, "assets", "pages")
    figdir = os.path.join(out, "assets", "figures")
    backup = os.path.join(out, "backup")
    os.makedirs(backup, exist_ok=True)

    print("== pdf2pear ==")
    print("1/8 rendering problem pages ...")
    page_imgs = render_pages(config.PROBLEMS_PDF, assets, dpi=config.PAGE_DPI) \
        if os.path.exists(config.PROBLEMS_PDF) else []

    print("2/8 inventorying figures ...")
    figures = inventory_figures(config.PROBLEMS_PDF, figdir) \
        if os.path.exists(config.PROBLEMS_PDF) else []

    print("3/8 parsing problems (validation metadata) ...")
    problems = parse_problems(config.PROBLEMS_PDF)

    print("4/8 reading answer key ...")
    raw, backend = read_answer_key()
    with open(os.path.join(out, "answer_key_raw.txt"), "w", encoding="utf-8") as f:
        f.write(raw)
    print(f"     (backend: {backend})")

    print("5/8 parsing answers -> answer_map.json ...")
    answer_map = parse_answer_key(raw, problems)
    answer_map["ocr_backend"] = backend
    with open(os.path.join(out, "answer_map.json"), "w", encoding="utf-8") as f:
        json.dump(answer_map, f, indent=2, ensure_ascii=False)
    print(f"     {answer_map['count']} item(s)")

    print("6/8 building placement guide ...")
    build_guide(answer_map, page_imgs, os.path.join(out, "placement_guide.html"))

    print("7/8 validating ...")
    validate(answer_map, problems, figures, os.path.join(out, "validation_report.html"))

    print("8/8 writing backups + automation targets ...")
    write_csv(answer_map, os.path.join(backup, "items.csv"))
    write_qti(answer_map, os.path.join(backup, "qti_package.zip"))
    compute_click_points(config.PROBLEMS_PDF, os.path.join(out, "click_points.json"))

    print("\nDone. Open output/placement_guide.html and output/validation_report.html.")
    print("Then in Pear Assess: Create -> Snap Quiz -> upload input/Problems.pdf and "
          "enter the answers from the guide.")
    print("Optional (desktop OS): `python automate.py` to type answers as you place "
          "each box (supervised).")


if __name__ == "__main__":
    main()
