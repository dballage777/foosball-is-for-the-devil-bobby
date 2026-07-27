#!/usr/bin/env python3
"""Supervised Snap Quiz automation launcher.

    python automate.py                      # assist mode, uses output/answer_map.json
    python automate.py --mode assist --points
    python automate.py --answers path/to/answer_map.json
    python automate.py --mode auto          # requires src/selectors.py + click_points

Requires a desktop OS with a display (on ChromeOS: the Linux/Crostini container).
This drives Pear's real UI on your login — supervised, ToS-gray. Read src/automate_pear.py.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

from src import config
from src.automate_pear import run


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["assist", "auto"], default="assist")
    ap.add_argument("--answers", default=os.path.join(config.OUTPUT_DIR, "answer_map.json"))
    ap.add_argument("--problems", default=config.PROBLEMS_PDF)
    ap.add_argument("--points", action="store_true", help="also type point values")
    ap.add_argument("--headless", action="store_true", help="(debugging only)")
    ap.add_argument("--profile", default=os.path.join(HERE, ".pear_profile"),
                    help="persistent browser profile dir (keeps you logged in)")
    args = ap.parse_args()

    if not os.path.exists(args.answers):
        sys.exit(f"answer map not found: {args.answers}\nRun `python run.py` first.")
    answer_map = json.load(open(args.answers, encoding="utf-8"))
    print(f"Loaded {answer_map['count']} items from {args.answers}")

    run(answer_map, args.problems, mode=args.mode, headless=args.headless,
        type_points=args.points, user_data_dir=args.profile)


if __name__ == "__main__":
    main()
