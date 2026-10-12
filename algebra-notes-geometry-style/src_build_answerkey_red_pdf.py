from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

RED=colors.HexColor("#D00000")
OUT="Obj 4-1 Identifying Linear Functions - ANSWER KEY (red).pdf"

def img(path, w_in):
    pw,ph=PILImage.open(path).size
    return Image(path, width=w_in*inch, height=w_in*ph/pw*inch)

base=dict(fontName="Helvetica", fontSize=11, leading=13)
H1=ParagraphStyle("H1", **{**base,"fontName":"Helvetica-Bold","fontSize":14,"leading":16})
H2=ParagraphStyle("H2", **{**base,"fontName":"Helvetica-Bold","fontSize":12,"leading":14})
HD=ParagraphStyle("HD", **{**base,"fontName":"Helvetica-Bold","fontSize":11,"leading":14,"spaceBefore":4,"spaceAfter":3})
NUM=ParagraphStyle("NUM", **{**base,"fontName":"Helvetica-Bold"})
BODY=ParagraphStyle("BODY", **base)
CEN=ParagraphStyle("CEN", **{**base,"alignment":TA_CENTER})

def choice_para(correct):  # 'L' or 'N'
    L='<font color="#D00000"><b>Linear</b></font>' if correct=='L' else 'Linear'
    N='<font color="#D00000"><b>Not Linear</b></font>' if correct=='N' else 'Not Linear'
    return Paragraph(f'{L} &nbsp;&nbsp;/&nbsp;&nbsp; {N}', ParagraphStyle("c",**{**base,"alignment":TA_CENTER}))

def reason_para(txt):
    return Paragraph(f'How do you know? &nbsp;<font color="#D00000"><b>{txt}</b></font>',
                     ParagraphStyle("r",**{**base,"fontSize":10,"leading":12}))

def xy_table(rows, red_y=False, colw=0.42):
    data=[]
    for ri,(x,y) in enumerate(rows):
        if ri==0:
            data.append([Paragraph(f'<b>{x}</b>',CEN), Paragraph(f'<b>{y}</b>',CEN)])
        else:
            yc=f'<font color="#D00000"><b>{y}</b></font>' if red_y else f'{y}'
            data.append([Paragraph(str(x),CEN), Paragraph(yc,CEN)])
    t=Table(data, colWidths=[colw*inch]*2)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.6,colors.black),
                           ('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1)]))
    return t

story=[]
story.append(Paragraph("Algebra — Objective 4-1", H1))
story.append(Paragraph("Identifying Linear Functions", H2))
story.append(Paragraph('<font color="#D00000"><b>TEACHER ANSWER KEY — answers in red</b></font>', HD))

# ---- Part 1 ----
story.append(Paragraph("Part 1 — Identify from a Graph", HD))
p1=[("p1_1.png","L","straight line"),("p1_2.png","N","curve (parabola)"),
    ("p1_3.png","L","straight line"),("p1_4.png","N","curve (parabola)")]
cells=[]
for i,(im,cor,why) in enumerate(p1):
    cells.append([Paragraph(f"{i+1}.",NUM), img(im,1.9), choice_para(cor), reason_para(why)])
rows=[[cells[0],cells[1]],[cells[2],cells[3]]]
t=Table(rows, colWidths=[3.6*inch,3.6*inch])
t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'CENTER'),
                       ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
story.append(t)

# ---- Part 2 ----
story.append(Paragraph("Part 2 — Identify from an X-Y Table", HD))
p2=[([("x","y"),(-2,-5),(-1,-2),(0,1),(1,4)],"L","y goes up +3 each step (constant rate)"),
    ([("x","y"),(-2,4),(-1,1),(0,0),(1,1)],"N","y-change not constant (-3, -1, +1)"),
    ([("x","y"),(0,7),(1,5),(2,3),(3,1)],"L","y goes down -2 each step (constant rate)"),
    ([("x","y"),(1,1),(2,4),(3,9),(4,16)],"N","y-change not constant (+3, +5, +7)")]
cells=[]
for i,(rws,cor,why) in enumerate(p2):
    cells.append([Paragraph(f"{i+5}.",NUM), xy_table(rws,colw=0.45), Spacer(1,2), choice_para(cor), reason_para(why)])
rows=[[cells[0],cells[1]],[cells[2],cells[3]]]
t=Table(rows, colWidths=[3.6*inch,3.6*inch])
t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
story.append(t)

story.append(PageBreak())

# ---- Part 3 ----
story.append(Paragraph("Part 3 — Find Y and Graph", HD))
xs=[-2,-1,0,1,2]
p3=[("y = 2x + 1","ansR_1.png",[-3,-1,1,3,5],"L"),
    ("y = x²","ansR_2.png",[4,1,0,1,4],"N"),
    ("y = -x + 2","ansR_3.png",[4,3,2,1,0],"L"),
    ("y = x² - 3","ansR_4.png",[1,-2,-3,-2,1],"N")]
cells=[]
for i,(eqn,grid,ys,cor) in enumerate(p3):
    xyt=xy_table([("x","y")]+list(zip(xs,ys)), red_y=True, colw=0.42)
    inner=Table([[xyt, img(grid,2.0)]], colWidths=[1.0*inch,2.25*inch])
    inner.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    cells.append([Paragraph(f"{i+9}.&nbsp;&nbsp; {eqn}",NUM), inner, Spacer(1,3), choice_para(cor)])
rows=[[cells[0],cells[1]],[cells[2],cells[3]]]
t=Table(rows, colWidths=[3.6*inch,3.6*inch])
t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),14)]))
story.append(t)

doc=SimpleDocTemplate(OUT, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch,
                      leftMargin=0.6*inch, rightMargin=0.6*inch, title="Obj 4-1 Answer Key (red)")
doc.build(story)
print("saved", OUT)
