const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, PageBreak, Header, Footer, PageNumber, HeightRule
} = require("docx");
const fs = require("fs");

// ---------- palette / fonts (same polished template as Lesson 1) ----------
const NAVY = "1F3864", ACCENT = "2E74B5", LIGHT = "DEEAF6", SOFT = "F2F6FB",
      GREEN = "375623", GRAY = "595959", WARN = "9C4221";
const BODY = "Arial", HEAD = "Arial";

// ---------- math-aware text: turns  x^2  into x + superscript 2 ----------
function mathRuns(text, o = {}) {
  const base = { font: o.font || BODY, size: o.size || 21, bold: o.bold || false,
                 italics: o.italics || false, color: o.color || "000000" };
  const parts = String(text).split(/\^(\d+)/);   // odd indices = exponent digits
  const runs = [];
  parts.forEach((seg, i) => {
    if (seg === "") return;
    if (i % 2 === 1) runs.push(new TextRun({ ...base, text: seg, superScript: true }));
    else runs.push(new TextRun({ ...base, text: seg }));
  });
  return runs.length ? runs : [new TextRun({ ...base, text: "" })];
}
const run = (text, o = {}) => new TextRun({ text, font: o.font || BODY, size: o.size || 22,
  bold: !!o.bold, italics: !!o.italics, color: o.color || "000000", ...o });

// ---------- structural helpers ----------
function sectionHeader(text) {
  return new Paragraph({ spacing: { before: 150, after: 50 }, keepNext: true, keepLines: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 3 } },
    children: [new TextRun({ text, font: HEAD, size: 25, bold: true, color: NAVY, allCaps: true })] });
}
function subHeader(text) {
  return new Paragraph({ spacing: { before: 90, after: 40 }, keepNext: true, keepLines: true,
    children: [new TextRun({ text, font: HEAD, size: 22, bold: true, color: ACCENT })] });
}
function body(children, o = {}) {
  return new Paragraph({ spacing: { after: o.after == null ? 50 : o.after, line: 240 },
    keepLines: true, keepNext: o.keepNext || false, alignment: o.align, children });
}
function bullet(children) {
  return new Paragraph({ numbering: { reference: "bl", level: 0 }, spacing: { after: 30, line: 240 },
    keepLines: true, children });
}
function ican(text) {
  return new Paragraph({ numbering: { reference: "ic", level: 0 }, spacing: { after: 30, line: 240 },
    keepLines: true, children: [new TextRun({ text: "I can " + text, font: BODY, size: 22 })] });
}
const P = (text, o = {}) => new Paragraph({ spacing: { after: o.after == null ? 30 : o.after },
  keepLines: true, alignment: o.align,
  children: [new TextRun({ text, font: BODY, size: o.size || 21, bold: o.bold, italics: o.italics, color: o.color || "000000" })] });

function cellPars(children, { w, fill, align } = {}) {
  return new TableCell({ width: { size: w, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: Array.isArray(children) ? children : [children] });
}
function headCell(text, w) {
  return cellPars(new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: BODY, size: 21, bold: true, color: NAVY })] }), { w, fill: LIGHT });
}
function tbl(colWidths, rows) {
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: colWidths, rows,
    borders: {
      top: b(), bottom: b(), left: b(), right: b(),
      insideHorizontal: b("D9D9D9"), insideVertical: b("D9D9D9") } });
}
function b(color = "BFBFBF", size = 4) { return { style: BorderStyle.SINGLE, size, color }; }
function blankP() { return new Paragraph({ spacing: { before: 0, after: 0, line: 240, lineRule: "exact" },
  children: [new TextRun({ text: "", font: BODY, size: 20 })] }); }

function callout(paragraphs, fill = SOFT, borderColor = ACCENT) {
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    borders: { top: b(borderColor, 8), bottom: b(borderColor, 8), left: b(borderColor, 18), right: b(borderColor, 8) },
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill },
      margins: { top: 110, bottom: 110, left: 150, right: 150 }, children: paragraphs })] })] });
}

// ---------- render one lesson ----------
function renderLesson(L) {
  const c = [];
  // TITLE
  c.push(new Paragraph({ spacing: { after: 20 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ALGEBRA 1", font: HEAD, size: 24, bold: true, color: ACCENT, allCaps: true, characterSpacing: 30 })] }));
  c.push(new Paragraph({ spacing: { after: 30 }, alignment: AlignmentType.CENTER, keepNext: true,
    children: [new TextRun({ text: L.titleLine, font: HEAD, size: 30, bold: true, color: NAVY })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 90 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: ACCENT, space: 4 } },
    children: [new TextRun({ text: L.subtitle, font: BODY, size: 20, italics: true, color: GRAY })] }));

  // 1. LEARNING OBJECTIVES
  c.push(sectionHeader("1.  Learning Objectives"));
  c.push(body([run("Learning targets — by the end of this lesson:", { italics: true, color: GRAY })], { after: 40 }));
  L.objectives.forEach((t) => c.push(ican(t)));

  // 2. REAL-WORLD APPLICATIONS
  c.push(sectionHeader("2.  Real-World Applications"));
  L.applications.forEach((a) => c.push(bullet([run(a.label + ": ", { bold: true, color: NAVY }), ...mathRuns(a.text, { size: 22 })])));

  // 3. VOCABULARY (fill-in-the-blank, 3 columns)
  c.push(sectionHeader("3.  Vocabulary"));
  c.push(body([run("Directions: ", { bold: true, color: NAVY }),
    run("Use each definition and the first-letter hints to fill in the vocabulary word. Examples are provided.", { italics: true, color: GRAY })], { after: 60, keepNext: true }));
  const vh = new TableRow({ tableHeader: true, cantSplit: true, children: [
    headCell("Vocabulary Word  (fill in the blank)", 3000), headCell("Definition", 4000), headCell("Example", 2360) ] });
  const vrows = L.vocab.map(([term, def, ex]) => new TableRow({ cantSplit: true,
    height: { value: 520, rule: HeightRule.ATLEAST }, children: [
    cellPars(new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: term, font: BODY, size: 21, bold: true })] }), { w: 3000 }),
    cellPars(new Paragraph({ spacing: { before: 30, after: 30 }, children: mathRuns(def) }), { w: 4000 }),
    cellPars(new Paragraph({ spacing: { before: 30, after: 30 }, alignment: AlignmentType.CENTER, children: mathRuns(ex, { italics: true, color: GRAY, size: 20 }) }), { w: 2360 }),
  ] }));
  c.push(tbl([3000, 4000, 2360], [vh, ...vrows]));

  // ===== PAGE 2 : EXAMPLE SETS + COMMON MISTAKES =====
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(sectionHeader("4.  Example Sets"));
  L.exampleSets.forEach((set) => {
    c.push(subHeader(set.title));
    // build 2-column grid of problems, each cell: problem + workspace + Answer line
    const probCells = set.problems.map((p) => {
      const kids = [ new Paragraph({ spacing: { after: 20 }, keepLines: true, children: mathRuns(p, { size: 21 }) }) ];
      const wl = set.work == null ? 2 : set.work;
      for (let i = 0; i < wl; i++) kids.push(blankP());
      kids.push(new Paragraph({ spacing: { before: 20, after: 20 }, children: [
        new TextRun({ text: "Answer: ", font: BODY, size: 20, bold: true, color: GREEN }),
        new TextRun({ text: "_".repeat(22), font: BODY, size: 20, color: "808080" }) ] }));
      return kids;
    });
    const rows = [];
    for (let i = 0; i < probCells.length; i += 2) {
      const left = cellPars(probCells[i], { w: 4680 });
      const right = probCells[i + 1] ? cellPars(probCells[i + 1], { w: 4680 })
        : cellPars(new Paragraph({ children: [new TextRun({ text: "", font: BODY, size: 20 })] }), { w: 4680 });
      rows.push(new TableRow({ cantSplit: true, children: [left, right] }));
    }
    c.push(tbl([4680, 4680], rows));
    c.push(new Paragraph({ spacing: { after: 40 } }));
  });

  // 5. COMMON MISTAKES
  c.push(sectionHeader("5.  Common Mistakes"));
  L.commonMistakes.forEach((t) => c.push(bullet(mathRuns(t, { size: 22 }))));

  // ===== PAGE 3 : RULES & REFERENCE + SUMMARY + KEY TAKEAWAYS (study guide) =====
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(sectionHeader("6.  Rules & Reference"));
  const rh = new TableRow({ tableHeader: true, cantSplit: true,
    children: [headCell(L.rules.headers[0], 3200), headCell(L.rules.headers[1], 6160)] });
  const rrows = L.rules.rows.map(([a, d]) => new TableRow({ cantSplit: true, children: [
    cellPars(new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: a, font: BODY, size: 21, bold: true, color: NAVY })] }), { w: 3200, fill: SOFT }),
    cellPars(new Paragraph({ spacing: { before: 30, after: 30 }, children: mathRuns(d) }), { w: 6160 }),
  ] }));
  c.push(tbl([3200, 6160], [rh, ...rrows]));

  c.push(sectionHeader("7.  Lesson Summary"));
  c.push(body(mathRuns(L.summary, { size: 22 })));

  c.push(sectionHeader("8.  Key Takeaways"));
  L.keyTakeaways.forEach((t) => c.push(bullet(mathRuns(t, { size: 22 }))));

  return c;
}

// ---------- document wrapper ----------
function makeDoc(L) {
  return new Document({
    creator: "Algebra 1 Curriculum", title: L.titleLine,
    numbering: { config: [
      { reference: "bl", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { run: { color: ACCENT }, paragraph: { indent: { left: 420, hanging: 240 } } } }] },
      { reference: "ic", levels: [{ level: 0, format: LevelFormat.BULLET, text: "✓", alignment: AlignmentType.LEFT,
        style: { run: { color: GREEN, bold: true }, paragraph: { indent: { left: 420, hanging: 240 } } } }] },
    ] },
    styles: { default: { document: { run: { font: BODY, size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1008, bottom: 1008, left: 1008, right: 1008 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: L.running, font: BODY, size: 16, color: GRAY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: L.foot + "   |   Page ", font: BODY, size: 16, color: GRAY }),
          new TextRun({ children: [PageNumber.CURRENT], font: BODY, size: 16, color: GRAY })] })] }) },
      children: renderLesson(L),
    }],
  });
}

const specs = require("./specs.js");
(async () => {
  for (const L of specs) {
    const buf = await Packer.toBuffer(makeDoc(L));
    fs.writeFileSync(L.out, buf);
    console.log("wrote", L.out, buf.length);
  }
})();
