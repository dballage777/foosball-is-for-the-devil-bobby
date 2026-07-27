# Running pdf2pear on a Chromebook

The automation (`automate.py`) needs a real Linux desktop with Chromium. On a
Chromebook that means turning on the built-in **Linux (Crostini)** container.
(`run.py`, which builds the placement guide, also runs here.)

---

## 0. Can your Chromebook even do this? — check first
Open **Settings → About ChromeOS → Developers**. Look for **“Linux development
environment.”**
- If you can turn it on → continue.
- If it’s **missing or greyed out**, your school admin (nafcs.org) has blocked it.
  You then can’t run the automation on this device — use a **Windows, Mac, or
  Linux computer** instead (same steps 2–5, skip step 1). *This is common on
  managed school devices, so don’t be surprised.*

If Linux is blocked and you don’t have another computer, the **placement guides
I already generated are your best option** — they remove the solving/lookup; you
just click and type in Pear.

---

## 1. Turn on Linux
**Settings → Advanced → Developers → Linux development environment → Turn on.**
Accept the defaults (it downloads a few GB). When it finishes, a **Terminal** app
appears in your launcher.

## 2. Get the project onto the Chromebook
1. Download **`pdf2pear.zip`** (I’m sending it to you).
2. Open the ChromeOS **Files** app → find the zip in **Downloads** → **drag it
   into “Linux files”** (left sidebar). That moves it where Linux can see it.
3. In **Terminal**:
   ```bash
   cd ~
   unzip pdf2pear.zip
   cd pdf2pear
   ```

## 3. Install everything (one command)
```bash
bash setup.sh
```
It installs Python, the libraries, and Playwright’s Chromium (a few hundred MB —
be on Wi‑Fi). Enter your Linux password if asked.

## 4. Build the guide + answer map for a worksheet
```bash
source .venv/bin/activate
# copy your files in (drag them into “Linux files” first, then):
cp ~/Problems.pdf input/Problems.pdf
cp ~/Answers.pdf  input/Answers.pdf        # OR create input/Answers.txt (one per line: 1. B)
python run.py
```
Open `output/placement_guide.html` and `output/validation_report.html` in Chrome
(they’re in **Files → Linux files → pdf2pear → output**).

## 5. Auto-type into Snap Quiz (assist mode)
```bash
python automate.py            # add --points to also type point values
```
A Chromium window opens:
1. Sign in to Pear Assess.
2. **Create → Snap Quiz**, upload your `Problems.pdf`, get it on screen.
3. Back in Terminal, press **Enter**. Now for each item: place the answer box,
   **click into its field**, and press **Enter** — the script types the answer.
   (`p` = also type points, `s` = skip, `q` = quit.) A screenshot of each item is
   saved to `output/screenshots/`.

Your login is remembered between runs (saved in `.pear_profile`).

---

## Reality check
- This drives Pear’s real interface on your login — **keep it supervised**, don’t
  run it fast or unattended (it’s within a gray area of most platforms’ terms).
- You still place each box by hand; assist mode only removes the typing/lookup.
- **Full auto** (no clicks at all) additionally needs you to capture Pear’s
  buttons once with `playwright codegen` into `src/selectors.py` — see the main
  `README.md`. It’s fragile; assist mode is the reliable choice.
