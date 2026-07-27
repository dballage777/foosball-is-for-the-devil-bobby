"""Supervised browser automation for the Pear Assess "Snap Quiz" flow.

Pear has no public API, so this drives the real UI with Playwright — only doing
what a human does, on YOUR login. Two modes:

  assist  (default, robust, selector-free)
      You log in, open Snap Quiz, upload the PDF, and place each answer box.
      For every item the script types the pre-parsed answer into the field you
      just focused (via keyboard), then optionally the points. No Pear-specific
      selectors are needed, so it does not break when Pear changes its UI.

  auto    (advanced scaffold, selector-dependent, fragile)
      Fully clicks type -> location -> answer using selectors YOU capture with
      `playwright codegen` into src/selectors.py, plus click_points.json.

Run via:  python automate.py --mode assist   (see automate.py)

IMPORTANT: requires a desktop OS with a display. On ChromeOS use the Linux
(Crostini) container. This is ToS-gray; keep it supervised and low-rate.
"""
import os
from . import config, browser


def _fmt(ans):
    return ", ".join(ans) if isinstance(ans, list) else str(ans)


def run(answer_map, problems_pdf, mode="assist", headless=False,
        type_points=False, user_data_dir=None, shots_dir=None):
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        print("playwright not installed: pip install playwright")
        return None

    items = answer_map["items"]
    shots_dir = shots_dir or os.path.join(config.OUTPUT_DIR, "screenshots")
    os.makedirs(shots_dir, exist_ok=True)

    with sync_playwright() as pw:
        ctx, page = browser.launch(pw, headless=headless, user_data_dir=user_data_dir)
        page.goto(config.PEAR_BASE_URL)

        print("\n" + "=" * 64)
        print("STEP 1 — In the opened browser: sign in to Pear Assess, then")
        print("         Create -> Snap Quiz and UPLOAD your Problems.pdf.")
        print("         Get the PDF on screen so you can place answer boxes.")
        print("Return here and press Enter when ready.")
        print("=" * 64)
        input("  [ready? press Enter] ")

        if mode == "assist":
            _assist_loop(page, items, type_points, shots_dir)
        elif mode == "auto":
            _auto_loop(page, items, shots_dir)
        else:
            print(f"unknown mode: {mode}")

        print("\nDone. Review the assignment in Pear, then Publish/Assign.")
        try:
            ctx.close()
        except Exception:
            pass


def _assist_loop(page, items, type_points, shots_dir):
    print("\nASSIST MODE — for each item: place the box in Pear, CLICK INTO the "
          "answer field, then press Enter here to type the answer.\n"
          "(commands: Enter=type answer · s=skip · p=type points too · q=quit)\n")
    for it in items:
        ans = _fmt(it["answer"])
        prompt = (f"  Item {it['n']} [{it['type']}] pg{it.get('page') or '?'} "
                  f"-> answer: {ans!r} (pts {it['points']})  ")
        cmd = input(prompt).strip().lower()
        if cmd == "q":
            break
        if cmd == "s":
            continue
        # type into whatever field the user focused in the browser
        page.keyboard.type(ans, delay=15)
        if type_points or cmd == "p":
            page.keyboard.press("Tab")
            page.keyboard.type(str(it["points"]), delay=15)
        try:
            page.screenshot(path=os.path.join(shots_dir, f"item_{it['n']:02d}.png"))
        except Exception:
            pass
    print("  [assist] finished item list.")


def _auto_loop(page, items, shots_dir):
    import json
    try:
        from . import selectors
    except Exception:
        print("  [auto] src/selectors.py not found. Copy selectors.example.py to "
              "selectors.py and fill it using `playwright codegen`. Aborting auto.")
        return
    cp_path = os.path.join(config.OUTPUT_DIR, "click_points.json")
    points = json.load(open(cp_path)) if os.path.exists(cp_path) else {}

    canvas = page.locator(selectors.PDF_CANVAS).first
    for it in items:
        n = str(it["n"])
        pt = points.get(n)
        try:
            # 1) choose question type
            page.click(selectors.TYPE_BUTTON[it["type"]])
            # 2) click the location on the PDF canvas
            box = canvas.bounding_box()
            if pt and box:
                page.mouse.click(box["x"] + pt["x_frac"] * box["width"],
                                 box["y"] + pt["y_frac"] * box["height"])
            # 3) enter answer + points
            page.fill(selectors.ANSWER_FIELD, _fmt(it["answer"]))
            page.fill(selectors.POINTS_FIELD, str(it["points"]))
            page.click(selectors.SAVE_ITEM)
            page.screenshot(path=os.path.join(shots_dir, f"item_{it['n']:02d}.png"))
            print(f"  [auto] placed item {n}")
        except Exception as e:
            print(f"  [auto] item {n} failed ({e}); switch to assist mode for it.")
