# Formatting conventions for these Algebra 1 notes

Standing rules to apply to every lesson / packet in this folder.

## Math typesetting

1. **Division symbol → stacked fraction.**
   Any `÷` (and any "a / b" that is genuinely a quotient) must be rendered as a
   **stacked fraction** (native equation), never left inline.
   - `3xy ÷ r + 8`  →  a fraction with numerator `3xy`, denominator `r`, then `+ 8`.
   - `n / 4 = 15`   →  fraction `n` over `4`, `= 15`.
   - Do **not** convert non-fraction slashes that are labels/abbreviations, e.g.
     `M/D`, `A/S`, `Addition/Subtraction`, `Multiply / Divide`, `Add / Subtract`.

2. **Exponents → superscript / native equation.**
   `x^2`, `(m + n)^3`, `(3d)^2 - f^2`, etc. become real superscripts (native
   equations when producing a Google-Docs-bound `.docx`).

3. **Never delete or alter a math expression** unless it has been successfully
   replaced by an equivalent equation. If an equation can't be built accurately,
   leave the original exactly as-is. The finished document must never contain
   fewer expressions than the original.

## Verification (since headless rendering is unavailable in this environment)

For any in-place edit of an existing `.docx`, always confirm:
- the archive's file set is identical to the original,
- `word/document.xml` is well-formed,
- reading-order **alphanumeric** text is byte-for-byte identical before/after
  (only structural characters like `^`, `÷`, and spaces around `/` may drop).

`src/convert_math.py` is the reference implementation of the ÷/fraction and
exponent conversions and includes these checks.
