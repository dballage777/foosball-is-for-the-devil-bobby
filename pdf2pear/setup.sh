#!/usr/bin/env bash
# One-shot installer for pdf2pear on Debian/Crostini (ChromeOS Linux) or any Linux.
# Run from inside the pdf2pear folder:   bash setup.sh
set -e

echo "== pdf2pear setup =="
cd "$(dirname "$0")"

echo "[1/4] system packages (needs your password for sudo)…"
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv git unzip

echo "[2/4] python virtual environment…"
python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip

echo "[3/4] python libraries…"
pip install -r requirements.txt

echo "[4/4] Playwright browser (Chromium) + its system deps…"
python -m playwright install --with-deps chromium

echo
echo "Done. Next:"
echo "  source .venv/bin/activate"
echo "  # put your files in input/ :  input/Problems.pdf  and  input/Answers.pdf (or Answers.txt)"
echo "  python run.py            # builds output/placement_guide.html + answer_map.json"
echo "  python automate.py       # opens a browser to auto-type answers as you place boxes"
