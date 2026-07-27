"""Resolve a launchable Chromium for Playwright across environments.

Handles the common case where a Chromium is preinstalled at a custom path
(PLAYWRIGHT_BROWSERS_PATH) whose build number differs from the pip package's
expectation, so a plain `chromium.launch()` fails.
"""
import glob
import os


def find_chromium_executable():
    # 1) explicit override
    exe = os.environ.get("PDF2PEAR_CHROME")
    if exe and os.path.exists(exe):
        return exe
    # 2) preinstalled full chromium under PLAYWRIGHT_BROWSERS_PATH
    root = os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
    for pat in (f"{root}/chromium-*/chrome-linux/chrome",
                f"{root}/chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
                f"{root}/chromium-*/chrome-win/chrome.exe"):
        hits = sorted(glob.glob(pat))
        if hits:
            return hits[-1]
    return None  # let Playwright use its own default / channel


def launch(pw, headless=False, user_data_dir=None):
    """Launch Chromium; use a persistent context if user_data_dir is given so a
    manual login survives between runs. Returns (context_or_browser, page)."""
    exe = find_chromium_executable()
    kwargs = {"headless": headless}
    if exe:
        kwargs["executable_path"] = exe
    if user_data_dir:
        ctx = pw.chromium.launch_persistent_context(user_data_dir, **kwargs)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        return ctx, page
    browser = pw.chromium.launch(**kwargs)
    page = browser.new_page()
    return browser, page
