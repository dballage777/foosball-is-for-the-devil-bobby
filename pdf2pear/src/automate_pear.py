"""OPTIONAL supervised browser automation for Snap Quiz (feature-flagged OFF).

Pear Assess has no public API, so this drives the real UI with Playwright, doing
only what a human does. It is ToS-gray and selector-fragile: run supervised, on
your own account, and expect to update selectors when Pear's UI changes.

Enable with: PDF2PEAR_PLAYWRIGHT=1  and:  playwright install chromium
This module intentionally does NOT hard-code Pear's private endpoints.
"""
from . import config


def upload_and_place(answer_map, problems_pdf, headless=False):
    if not config.ENABLE_PLAYWRIGHT:
        print("  [automate] disabled (set PDF2PEAR_PLAYWRIGHT=1 to enable).")
        return None
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        print("  [automate] playwright not installed: pip install playwright && "
              "playwright install chromium")
        return None

    print("  [automate] launching supervised browser — you will log in manually.")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        page = browser.new_page()
        page.goto(config.PEAR_BASE_URL)
        # --- MANUAL STEP: log in (SSO) in the opened window ---
        page.pause()  # opens Playwright Inspector so you sign in + reach Author Test
        # From here you would: click Snap Quiz, upload problems_pdf, then loop the
        # answer_map to place items. Selectors are environment-specific and MUST be
        # captured with `playwright codegen` against your account, then filled in:
        #
        #   page.get_by_text("Snap Quiz").click()
        #   page.set_input_files("input[type=file]", problems_pdf)
        #   for it in answer_map["items"]:
        #       ...click type tool, click location, set answer + points...
        #
        print("  [automate] scaffold ready; capture selectors with `playwright "
              "codegen` and fill the loop for your account.")
        browser.close()
    return {"status": "scaffold"}
