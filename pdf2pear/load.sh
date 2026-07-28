#!/usr/bin/env bash
# Usage:  bash load.sh <name>   (names: one_step two_step multi_step both_sides algebraic_expressions)
set -e
name="${1:?pick one: one_step two_step multi_step both_sides algebraic_expressions}"
cd "$(dirname "$0")"
cp "worksheets/$name/Problems.pdf" input/Problems.pdf
cp "worksheets/$name/Answers.txt"  input/Answers.txt
source .venv/bin/activate 2>/dev/null || true
python run.py
echo
echo "Guide -> output/placement_guide.html   |   then:  python automate.py"
