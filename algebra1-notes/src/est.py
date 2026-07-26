import docx, glob, os, math, sys
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
OUT='/home/user/foosball-is-for-the-devil-bobby/algebra1-notes/'
FULLW=12240-2*1008; USABLE=15840-2*1008-560
def cpl(w): return max(8,int((w-220)/112))
def para_h(p,w):
    t=p.text
    if not t.strip(): return 240      # exact blank line
    return max(1,math.ceil(len(t)/cpl(w)))*250+65
def table_h(tb):
    grid=[int(g.get(qn('w:w'))) for g in tb._tbl.iter(qn('w:gridCol'))]; tot=0
    for row in tb.rows:
        h=0
        for ci,cell in enumerate(row.cells):
            w=grid[ci] if ci<len(grid) else 3000
            h=max(h,sum(para_h(p,w) for p in cell.paragraphs)+160)
        tot+=h
    return tot
for f in sorted(glob.glob(OUT+'Algebra1_Unit1_Lesson[2-6]*.docx')):
    d=docx.Document(f); pages=[0.0]
    for ch in d.element.body.iterchildren():
        if ch.tag==qn('w:p'):
            if any(br.get(qn('w:type'))=='page' for br in ch.iter(qn('w:br'))): pages.append(0.0); continue
            pages[-1]+=para_h(Paragraph(ch,d),FULLW)
        elif ch.tag==qn('w:tbl'): pages[-1]+=table_h(Table(ch,d))
    print(os.path.basename(f)[:36].ljust(38),
          ' '.join('p%d=%d(%d%%)'%(i+1,int(h),h/USABLE*100) for i,h in enumerate(pages)),
          '| OVER:',[i+1 for i,h in enumerate(pages) if h>USABLE] or '-')
