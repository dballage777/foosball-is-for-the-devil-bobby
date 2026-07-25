const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, PageBreak, Header, Footer, PageNumber, convertInchesToTwip, HeightRule
} = require("docx");
const fs = require("fs");

// ---------- Palette (echoes the Geometry packet's clean, bold-header look) ----------
const NAVY = "1F3864";      // section headers
const ACCENT = "2E74B5";    // sub-accents / title rule
const LIGHT = "DEEAF6";     // header-row shading
const SOFT = "F2F6FB";      // callout shading
const GREEN = "375623";     // "you try / solution" tone
const GRAY = "595959";

const BODY_FONT = "Arial";      // Arimo (Geometry) is the metric twin of Arial
const HEAD_FONT = "Arial";

// ---------- helpers ----------
const run = (text, o = {}) => new TextRun({ text, font: o.font || BODY_FONT, size: o.size || 22, bold: o.bold || false, italics: o.italics || false, color: o.color || "000000", ...o });

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 160, after: 50 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 3 } },
    children: [new TextRun({ text, font: HEAD_FONT, size: 26, bold: true, color: NAVY, allCaps: true })],
  });
}

function subHeader(text) {
  return new Paragraph({
    spacing: { before: 100, after: 40 },
    keepNext: true,
    children: [new TextRun({ text, font: HEAD_FONT, size: 23, bold: true, color: ACCENT })],
  });
}

function body(children, o = {}) {
  return new Paragraph({ spacing: { after: o.after == null ? 60 : o.after, line: 240 }, alignment: o.align, children });
}

function bullet(children, level = 0) {
  return new Paragraph({ numbering: { reference: "bullets", level }, spacing: { after: 30, line: 240 }, children });
}

function ican(text) {
  return new Paragraph({ numbering: { reference: "ican", level: 0 }, spacing: { after: 30, line: 240 },
    children: [new TextRun({ text: "I can " + text, font: BODY_FONT, size: 22 })] });
}

// shaded callout box (single-cell table)
function callout(paragraphs, fill = SOFT, borderColor = ACCENT) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
      left: { style: BorderStyle.SINGLE, size: 18, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
    },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      children: paragraphs,
    })] })],
  });
}

function cell(children, { w, fill, bold, header, align } = {}) {
  const kids = Array.isArray(children) ? children : [new Paragraph({ alignment: align,
    children: [new TextRun({ text: String(children), font: BODY_FONT, size: 21, bold: !!(bold || header), color: header ? NAVY : "000000" })] })];
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: kids,
  });
}

const P = (text, o = {}) => new Paragraph({ spacing: { after: o.after == null ? 40 : o.after }, alignment: o.align,
  children: [new TextRun({ text, font: BODY_FONT, size: o.size || 21, bold: o.bold, italics: o.italics, color: o.color || "000000" })] });

// a light underline "write here" line for fill-in-the-blank cells
function blankLine(width = 34) {
  return new Paragraph({ spacing: { before: 60, after: 20 }, children: [
    new TextRun({ text: "_".repeat(width), font: BODY_FONT, size: 20, color: "808080" }) ] });
}
// empty answer cell with writing room (one or more blank lines)
function answerCell(w, lines = 1) {
  const kids = [];
  for (let i = 0; i < lines; i++) kids.push(blankLine());
  return cell(kids, { w });
}

// worked example block
function example(num, prompt, solutionLines) {
  const kids = [
    new Paragraph({ spacing: { after: 40 }, children: [
      new TextRun({ text: num + "  ", font: BODY_FONT, size: 22, bold: true, color: NAVY }),
      new TextRun({ text: prompt, font: BODY_FONT, size: 22 }),
    ] }),
  ];
  solutionLines.forEach((ln) => {
    kids.push(new Paragraph({ spacing: { after: 30 }, indent: { left: 300 }, children: [
      new TextRun({ text: ln.label ? ln.label + " " : "", font: BODY_FONT, size: 21, bold: true, color: GREEN }),
      new TextRun({ text: ln.text, font: BODY_FONT, size: 21, color: ln.muted ? GRAY : "000000", italics: !!ln.muted }),
    ] }));
  });
  return kids;
}

// ===================================================================
const doc = new Document({
  creator: "Algebra 1 Curriculum",
  title: "Algebra 1 – Unit 1, Lesson 1: Variables and Expressions",
  description: "Standardized Algebra 1 lesson notes formatted to match the Geometry template.",
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { run: { color: ACCENT }, paragraph: { indent: { left: 460, hanging: 260 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 900, hanging: 260 } } } },
      ] },
      { reference: "ican", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "✓", alignment: AlignmentType.LEFT, style: { run: { color: GREEN, bold: true }, paragraph: { indent: { left: 460, hanging: 260 } } } },
      ] },
    ],
  },
  styles: {
    default: { document: { run: { font: BODY_FONT, size: 22 } } },
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "Algebra 1  •  Unit 1  •  Lesson 1", font: BODY_FONT, size: 16, color: GRAY })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Variables and Expressions   |   Page ", font: BODY_FONT, size: 16, color: GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], font: BODY_FONT, size: 16, color: GRAY })] })] }) },
    children: buildBody(),
  }],
});

function buildBody() {
  const c = [];

  // ---------- TITLE BLOCK ----------
  c.push(new Paragraph({ spacing: { after: 20 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ALGEBRA 1", font: HEAD_FONT, size: 24, bold: true, color: ACCENT, allCaps: true, characterSpacing: 30 })] }));
  c.push(new Paragraph({ spacing: { after: 40 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Unit 1 – Lesson 1 (Objective 1-1): Variables and Expressions", font: HEAD_FONT, size: 34, bold: true, color: NAVY })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 5 } },
    children: [new TextRun({ text: "Introduction to Algebra  •  Translating Between Words and Symbols", font: BODY_FONT, size: 20, italics: true, color: GRAY })] }));

  // ---------- OBJECTIVES ----------
  c.push(sectionHeader("Objectives"));
  c.push(body([run("Learning targets — by the end of this lesson:", { italics: true, color: GRAY })], { after: 60 }));
  [
    "define and identify a variable and a constant.",
    "tell the difference between a numerical expression and an algebraic expression.",
    "translate a verbal (word) phrase into an algebraic expression.",
    "translate an algebraic expression into a word phrase (in more than one way).",
    "write an algebraic expression to model a real-world situation.",
    "evaluate an expression by substituting a value in for the variable.",
  ].forEach((t) => c.push(ican(t)));

  // ---------- REAL LIFE USE ----------
  c.push(sectionHeader("Real Life Use"));
  c.push(body([run("Expressions with variables let us describe a rule once and reuse it for any value. You see them everywhere:", {})]));
  [
    [ "Business & Finance: ", "total cost = price × quantity, or a monthly budget written as a formula so it updates when a number changes." ],
    [ "Sports Analytics: ", "points per game, batting averages, or shooting percentages are all expressions built from variables." ],
    [ "Medicine: ", "a safe dose is often figured as milligrams per kilogram of body weight — an expression in the patient’s weight." ],
    [ "Computer Science & Technology: ", "every line of code that stores a value uses a variable exactly the way algebra does." ],
    [ "Construction & Engineering: ", "estimating materials, cost, or load from measurements that change job to job." ],
    [ "Everyday Decisions: ", "a phone plan, a rideshare fare, a tip, or hourly pay are all “flat amount + rate × amount used.”" ],
  ].forEach(([b, t]) => c.push(bullet([run(b, { bold: true, color: NAVY }), run(t, {})])));

  // ---------- VOCABULARY (fill-in-the-blank, Geometry-style table) ----------
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(sectionHeader("Vocabulary"));
  c.push(body([run("Directions: ", { bold: true, color: NAVY }),
    run("Fill in each blank with the correct vocabulary word. Use the Word Bank below if you need help; the examples are provided.", { italics: true, color: GRAY })], { after: 80 }));

  const vHead = new TableRow({ tableHeader: true, children: [
    cell("Vocabulary & Definition  (fill in the blank)", { w: 6860, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Example", { w: 2500, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
  ] });
  // Column 1: definition sentence with the vocabulary word left BLANK.
  // Column 2: example is filled in.
  const BL = "________________";
  const vRows = [
    ["A " + BL + " is a letter or a symbol used to represent a value that can change.", "x,  m,  g,  h"],
    ["A " + BL + " is a value that does not change.", "12,  7.9,  100"],
    ["A " + BL + " contains only constants and operations.", "6 + 4 × 2"],
    ["An " + BL + " may contain variables, constants, and operations.", "3x + 5"],
    ["A " + BL + " is a single number, a variable, or the product/quotient of numbers and variables, separated by + or – signs.", "In 4x + 9, the terms are 4x and 9"],
    ["A " + BL + " is the number that is multiplied by a variable in a term.", "In 5y, the coefficient is 5"],
    ["An " + BL + " is a mathematical action such as addition, subtraction, multiplication, or division.", "+   –   ×   ÷"],
    ["To " + BL + " an expression means to find its value by substituting a number in for each variable.", "If n = 4, then 3n = 12"],
  ].map(([def, ex]) => new TableRow({
    height: { value: 560, rule: HeightRule.ATLEAST },
    children: [
      cell([new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: def, font: BODY_FONT, size: 21 })] })], { w: 6860 }),
      cell([new Paragraph({ spacing: { before: 30, after: 30 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: ex, font: BODY_FONT, size: 20, italics: true, color: GRAY })] })], { w: 2500 }),
    ] }));
  c.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [6860, 2500],
    borders: allBorders(), rows: [vHead, ...vRows] }));

  c.push(new Paragraph({ spacing: { before: 80 }, children: [
    run("Word Bank:  ", { bold: true, color: NAVY }),
    run("variable   •   constant   •   numerical expression   •   algebraic expression   •   term   •   coefficient   •   operation   •   evaluate", { italics: true, color: GRAY }),
  ] }));

  c.push(new Paragraph({ spacing: { before: 60 }, children: [
    run("Note:  ", { bold: true, color: NAVY }),
    run("Because a numerical expression has no variables, it always simplifies to a single number. An algebraic expression will keep at least one variable until you know its value.", { italics: true, color: GRAY }),
  ] }));

  // ---------- MAIN LESSON NOTES ----------
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(sectionHeader("Main Lesson Notes"));

  c.push(subHeader("1.  What an Expression Is"));
  c.push(body([run("An "), run("expression", { bold: true }), run(" is a mathematical phrase — numbers and/or variables joined by operations. Unlike an equation, an expression has "), run("no equals sign", { bold: true }), run(" and is not “solved.” We "), run("simplify", { bold: true }), run(" or "), run("evaluate", { bold: true }), run(" it instead.")]));

  c.push(subHeader("2.  Operation Key Words"));
  c.push(body([run("The hardest part of algebra at first is turning English into symbols. Watch for these signal words for each operation.", {})], { after: 80 }));

  const opHead = new TableRow({ tableHeader: true, children: [
    cell("Addition ( + )", { w: 2340, fill: LIGHT, header: true }),
    cell("Subtraction ( – )", { w: 2340, fill: LIGHT, header: true }),
    cell("Multiplication ( × )", { w: 2340, fill: LIGHT, header: true }),
    cell("Division ( ÷ )", { w: 2340, fill: LIGHT, header: true }),
  ] });
  const opWords = [
    ["plus", "minus", "times", "divided by"],
    ["sum", "difference", "product", "quotient"],
    ["more than", "less than", "multiplied by", "per"],
    ["increased by", "decreased by", "twice / double / triple", "split equally"],
    ["added to", "fewer than", "of", "ratio of"],
    ["total / combined", "subtracted from", "each / per", "out of"],
  ];
  const opRows = opWords.map((r) => new TableRow({ children: r.map((w) =>
    cell([new Paragraph({ children: [new TextRun({ text: w, font: BODY_FONT, size: 21 })] })], { w: 2340 })) }));
  c.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2340, 2340, 2340, 2340], borders: allBorders(), rows: [opHead, ...opRows] }));

  c.push(new Paragraph({ spacing: { before: 80, after: 40 } }));
  c.push(callout([
    P("⚠  Order matters for subtraction and division!", { bold: true, color: "9C4221" }),
    P("“8 less than n”  means  n – 8   (NOT 8 – n).", { }),
    P("“b subtracted from a”  means  a – b.", { }),
    P("“the quotient of a and b”  means  a ÷ b   (the first number named goes first).", { after: 0 }),
  ], "FEF3E7", "DD9B4B"));

  c.push(subHeader("3.  Ways to Show Multiplication"));
  c.push(body([run("To avoid confusing the times sign × with the variable x, algebra usually shows multiplication another way:")], { after: 60 }));
  [
    [ "Coefficient next to a variable: ", "4b  means  4 × b" ],
    [ "A dot: ", "4 · b" ],
    [ "Parentheses: ", "4(b)  or  (4)(b)" ],
  ].forEach(([b, t]) => c.push(bullet([run(b, { bold: true, color: NAVY }), run(t, {})])));
  c.push(body([run("The number in front of a variable is the "), run("coefficient", { bold: true }), run(". In "), run("5y", { bold: true }), run(", the 5 is the coefficient and means “5 times y.”")]));

  c.push(subHeader("4.  Evaluating an Expression"));
  c.push(body([run("To "), run("evaluate", { bold: true }), run(", replace each variable with its given value and do the arithmetic (follow the order of operations). Example: evaluate "), run("3n", { bold: true }), run(" when "), run("n = 4", { bold: true }), run("  →  3(4) = 12.")]));

  // ---------- COMMON MISTAKES ----------
  c.push(sectionHeader("Common Mistakes"));
  [
    "Reversing subtraction: writing 8 – n for “8 less than n” (it should be n – 8).",
    "Reversing division / quotient order (“the quotient of a and b” is a ÷ b, not b ÷ a).",
    "Using × for multiply, which looks like the variable x — use a coefficient, a dot, or parentheses.",
    "Forgetting that “twice / double” means × 2 (so “twice a number n” is 2n).",
    "Trying to “solve” or find a single number for an expression that still contains a variable.",
    "Dropping the constant in a “flat fee + rate” situation (e.g., writing only the rate term and forgetting the starting amount).",
  ].forEach((t) => c.push(bullet([run(t, {})])));

  // ---------- EXAMPLES ----------
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(sectionHeader("Examples"));

  // helper: a numbered "prompt" cell
  const numCell = (n, text, w) => cell([new Paragraph({ children: [
    new TextRun({ text: n + "  ", font: BODY_FONT, size: 21, bold: true, color: NAVY }),
    new TextRun({ text, font: BODY_FONT, size: 21 }) ] })], { w });

  // ----- SET A: word phrase -> expression (answer column blank) -----
  c.push(subHeader("Set A — Write an algebraic expression for each word phrase."));
  const aHead = new TableRow({ tableHeader: true, children: [
    cell("#", { w: 640, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Word Phrase", { w: 5360, fill: LIGHT, header: true }),
    cell("Algebraic Expression", { w: 3360, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
  ] });
  const aRows = [
    ["1.", "12 more than x"],
    ["2.", "The quotient of m and 18"],
    ["3.", "7.9 more than the product of 6 and h"],
    ["4.", "25 more than twice a number, g"],
  ].map(([n, p]) => new TableRow({ height: { value: 560, rule: HeightRule.ATLEAST }, children: [
    cell(n.replace(".", ""), { w: 640, align: AlignmentType.CENTER, bold: true }),
    numCell("", p, 5360),
    answerCell(3360),
  ] }));
  c.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [640, 5360, 3360], borders: allBorders(), rows: [aHead, ...aRows] }));

  // ----- SET B: expression -> two ways in words (blank) -----
  c.push(new Paragraph({ spacing: { before: 60 } }));
  c.push(subHeader("Set B — Give two ways to write each algebraic expression in words."));
  const bHead = new TableRow({ tableHeader: true, children: [
    cell("#", { w: 640, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Expression", { w: 1900, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Two Ways to Write It in Words", { w: 6820, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
  ] });
  const bRows = [
    ["5.", "9 + r"],
    ["6.", "q – r"],
    ["7.", "7m + 5"],
    ["8.", "2j ÷ 6"],
  ].map(([n, ex]) => new TableRow({ height: { value: 760, rule: HeightRule.ATLEAST }, children: [
    cell(n.replace(".", ""), { w: 640, align: AlignmentType.CENTER, bold: true }),
    cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: ex, font: BODY_FONT, size: 22, bold: true })] })], { w: 1900 }),
    cell([
      new Paragraph({ spacing: { before: 80, after: 30 }, children: [
        new TextRun({ text: "1)  ", font: BODY_FONT, size: 21, bold: true, color: ACCENT }),
        new TextRun({ text: "_".repeat(56), font: BODY_FONT, size: 20, color: "808080" }) ] }),
      new Paragraph({ spacing: { after: 40 }, children: [
        new TextRun({ text: "2)  ", font: BODY_FONT, size: 21, bold: true, color: ACCENT }),
        new TextRun({ text: "_".repeat(56), font: BODY_FONT, size: 20, color: "808080" }) ] }),
    ], { w: 6820 }),
  ] }));
  c.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [640, 1900, 6820], borders: allBorders(), rows: [bHead, ...bRows] }));

  // ----- SET C: real-world -> expression + evaluate (blank) -----
  c.push(new Paragraph({ spacing: { before: 60 } }));
  c.push(subHeader("Set C — Write an expression, then evaluate it (real-world)."));
  const cHead = new TableRow({ tableHeader: true, children: [
    cell("#", { w: 640, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Real-World Situation", { w: 5360, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Expression", { w: 1760, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
    cell("Evaluate", { w: 1600, fill: LIGHT, header: true, align: AlignmentType.CENTER }),
  ] });
  const cData = [
    ["9.", "John types 62 words per minute. Write an expression for the number of words he types in m minutes.", "If John typed 25 minutes, how many words would that be?"],
    ["10.", "Joey earns $5 for each car he washes. Write an expression for the number of cars Joey must wash to earn d dollars.", "If Joey washed 12 cars, how much did he make?"],
    ["11.", "Roberto goes to a pizza place. A pizza costs $12 plus $2 per topping. Write an expression to describe the cost.", "If Roberto ordered 4 toppings, how much would the pizza cost?"],
  ];
  const cRows = cData.map(([n, stem, follow]) => new TableRow({ height: { value: 1000, rule: HeightRule.ATLEAST }, children: [
    cell(n.replace(".", ""), { w: 640, align: AlignmentType.CENTER, bold: true }),
    cell([
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: stem, font: BODY_FONT, size: 21 })] }),
      new Paragraph({ children: [new TextRun({ text: follow, font: BODY_FONT, size: 20, italics: true, color: GRAY })] }),
    ], { w: 5360 }),
    answerCell(1760, 2),
    answerCell(1600, 2),
  ] }));
  c.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [640, 5360, 1760, 1600], borders: allBorders(), rows: [cHead, ...cRows] }));

  // ---------- RULES / PROPERTIES ----------
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(sectionHeader("Rules, Properties & Reference"));
  c.push(callout([
    P("Key translation rules", { bold: true, color: NAVY }),
    P("•  Addition and multiplication can be written in either order:  a + b = b + a,  and  a · b = b · a  (same value).", {}),
    P("•  Subtraction and division are NOT reversible — keep the stated order.", {}),
    P("•  “less than” and “subtracted from” flip the order:  “8 less than n” → n – 8.", {}),
    P("•  A number written directly in front of a variable means multiply (it is the coefficient):  5y = 5 × y.", {}),
    P("•  Use  4b,  4·b,  or  4(b)  for multiplication — avoid × so it isn’t mistaken for the variable x.", {}),
    P("•  To evaluate: substitute the value, then follow the order of operations (PEMDAS).", { after: 0 }),
  ], SOFT, ACCENT));

  // ---------- LESSON SUMMARY ----------
  c.push(sectionHeader("Lesson Summary"));
  c.push(body([run("In this lesson we learned the language of algebra. A "), run("variable", { bold: true }),
    run(" is a letter or symbol that stands for a value that can change, while a "), run("constant", { bold: true }),
    run(" stays the same. A "), run("numerical expression", { bold: true }), run(" is built only from constants and operations, and an "),
    run("algebraic expression", { bold: true }), run(" also includes at least one variable. We practiced translating between words and symbols in both directions — turning a phrase such as “three more than twice a number” into "),
    run("2n + 3", { bold: true }), run(", and reading expressions back into words. We paid special attention to the fact that "),
    run("subtraction and division depend on order", { bold: true }), run(", and we used real situations — typing speed, earnings, and pizza cost — to write expressions and then "),
    run("evaluate", { bold: true }), run(" them by substituting a value for the variable.")]));

  // ---------- KEY TAKEAWAYS ----------
  c.push(sectionHeader("Key Takeaways"));
  [
    "A variable can change; a constant cannot.",
    "Numerical expression = constants + operations. Algebraic expression = variables + constants + operations.",
    "Learn the operation key words — they are the bridge between English and algebra.",
    "Order matters for subtraction and division; watch “less than” and “subtracted from.”",
    "Show multiplication with a coefficient, a dot, or parentheses — not ×.",
    "Evaluate by substituting the value for the variable, then follow the order of operations.",
  ].forEach((t) => c.push(bullet([run(t, {})])));

  return c;
}

function allBorders() {
  const b = (color = "BFBFBF", size = 4) => ({ style: BorderStyle.SINGLE, size, color });
  return { top: b(), bottom: b(), left: b(), right: b(), insideHorizontal: b("D9D9D9"), insideVertical: b("D9D9D9") };
}

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2], buf);
  console.log("wrote", process.argv[2], buf.length, "bytes");
});
