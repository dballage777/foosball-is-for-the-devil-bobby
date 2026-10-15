from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

OUT="Linear Functions and Slope Assignment.pdf"
base=dict(fontName="Helvetica", fontSize=11, leading=14)
TITLE=ParagraphStyle("T",**{**base,"fontName":"Helvetica-Bold","fontSize":15,"leading":18,"alignment":TA_CENTER})
NAME=ParagraphStyle("N",**{**base,"fontSize":10.5})
SEC =ParagraphStyle("SE",**{**base,"fontName":"Helvetica-Bold","fontSize":12,"leading":15})
NUM =ParagraphStyle("NU",**{**base,"fontName":"Helvetica-Bold","fontSize":10.5})
BODY=ParagraphStyle("B",**{**base,"fontSize":10.5,"leading":13})
SMALL=ParagraphStyle("SM",**{**base,"fontSize":9.5,"leading":12})
MBIG=ParagraphStyle("MB",**{**base,"fontSize":13,"leading":16})
FRc =ParagraphStyle("FR",**{**base,"fontSize":11,"alignment":TA_CENTER,"leading":13})
FRr =ParagraphStyle("FRr",**{**base,"fontSize":10,"alignment":TA_CENTER,"leading":12})
CEN =ParagraphStyle("C",**{**base,"alignment":TA_CENTER})
HDR =ParagraphStyle("H",**{**base,"fontName":"Helvetica-Bold","alignment":TA_CENTER})
EQ  =ParagraphStyle("E",**{**base,"fontName":"Helvetica-Bold","fontSize":11})
MST =ParagraphStyle("M",**{**base,"fontSize":11})

def img(path,w):
    pw,ph=PILImage.open(path).size
    return Image(path,width=w*inch,height=w*ph/pw*inch)

def yn_explain():
    return [Paragraph("Linear function?&nbsp;&nbsp; <b>Yes</b>&nbsp;&nbsp;&nbsp;&nbsp; <b>No</b>", BODY),
            Spacer(1,4), Paragraph("Why? ______________________", SMALL)]

# ---- Part 1: graph linear? ----
def p1cell(n,imgf):
    return [Paragraph(f"{n}.  Is the graph a linear function?",NUM), Spacer(1,3),
            img(imgf,2.1), Spacer(1,5)]+yn_explain()

# ---- Part 2: table linear? ----
def data_table(xs,ys):
    data=[[Paragraph("<b>x</b>",HDR),Paragraph("<b>y</b>",HDR)]]
    for x,y in zip(xs,ys): data.append([Paragraph(str(x),CEN),Paragraph(str(y),CEN)])
    t=Table(data,colWidths=[0.5*inch,0.5*inch],rowHeights=[0.22*inch]+[0.26*inch]*len(xs))
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.7,colors.black),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1)]))
    return t
def p2cell(n,xs,ys):
    return [Paragraph(f"{n}.  Is the table a linear function?",NUM), Spacer(1,4),
            data_table(xs,ys), Spacer(1,6)]+yn_explain()

# ---- Part 3: graph by table ----
def xy_table():
    data=[[Paragraph("<u>X</u>",HDR),Paragraph("<u>Y</u>",HDR),Paragraph("<u>(x, y)</u>",HDR)]]
    for x in [-2,-1,0,1,2]: data.append([Paragraph(f"<b>{x}</b>",CEN),"",""])
    t=Table(data,colWidths=[0.32*inch,1.2*inch,0.66*inch],rowHeights=[0.2*inch]+[0.28*inch]*5)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.7,colors.black),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t
def p3cell(n,eq):
    inner=Table([[xy_table(), img("blankgrid.png",1.5)]],colWidths=[2.2*inch,1.55*inch])
    inner.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),
                               ('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return [Paragraph(f"{n})&nbsp;&nbsp; {eq}",EQ), Spacer(1,3), inner]

# ---- Part 4: slope from graph ----
def frac_rr():
    t=Table([[Paragraph("rise",FRr)],[Paragraph("run",FRr)]],colWidths=[0.5*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),1,colors.black),('TOPPADDING',(0,0),(-1,-1),0),
                           ('BOTTOMPADDING',(0,0),(-1,-1),0),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def gprompt():
    t=Table([[Paragraph("m =",MST), frac_rr(), Paragraph("= __________",MST)]],colWidths=[0.42*inch,0.55*inch,1.3*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t
def p4cell(n):
    return [Paragraph(f"{n}.  Find the slope of the line.",NUM), Spacer(1,2),
            img(f"sl_{n}.png",2.1), Spacer(1,3), gprompt()]

# ---- Part 5: slope from points (boxed) ----
def formula():
    t=Table([[Paragraph("y<sub>2</sub> - y<sub>1</sub>",FRc)],[Paragraph("x<sub>2</sub> - x<sub>1</sub>",FRc)]],colWidths=[1.05*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),0.9,colors.black),('TOPPADDING',(0,0),(-1,-1),2),
                           ('BOTTOMPADDING',(0,0),(-1,-1),2),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def formula_block():
    t=Table([["", formula()]],colWidths=[0.4*inch,1.15*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),
                           ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return t
def p5box(n,points,w=3.55):
    inner=[Paragraph(f"{n}.  Find the slope, simplify (reduce) if needed.",SMALL), Spacer(1,11),
           Paragraph(f"Given the points {points}",BODY), Spacer(1,20),
           formula_block(), Spacer(1,26), Paragraph("<i>m</i> = ______________",MBIG)]
    t=Table([[inner]],colWidths=[w*inch])
    t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),1.0,colors.black),('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),
                           ('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),13)]))
    return t

def row2(cells, colw=3.65, botpad=8):
    rows=[]
    for i in range(0,len(cells),2):
        pair=cells[i:i+2]; rows.append(pair+([""] if len(pair)<2 else []))
    t=Table(rows,colWidths=[colw*inch,colw*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'LEFT'),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),6),
                           ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),botpad)]))
    return t

story=[]
story.append(Paragraph("Linear Functions &amp; Slope", TITLE))
story.append(Spacer(1,3))
story.append(Paragraph("Name: ______________________________     Date: ______________     Period: ______",NAME))
story.append(Spacer(1,8))
# Part 1
story.append(Paragraph("Part 1 — Is each graph a linear function? Explain why or why not.",SEC)); story.append(Spacer(1,4))
story.append(row2([p1cell(1,"lf_lin.png"), p1cell(2,"lf_non.png")]))
story.append(Spacer(1,4))
# Part 2
story.append(Paragraph("Part 2 — Is each table a linear function? Explain why or why not.",SEC)); story.append(Spacer(1,4))
story.append(row2([p2cell(3,[0,1,2,3,4],[1,4,7,10,13]), p2cell(4,[0,1,2,3,4],[0,1,4,9,16])]))
story.append(Spacer(1,4))
# Part 3
story.append(Paragraph("Part 3 — Complete each table, then plot the points and draw the line.",SEC)); story.append(Spacer(1,4))
story.append(row2([p3cell(5,"y = 2x - 1"), p3cell(6,"y = -x + 2")], colw=3.75))
story.append(PageBreak())
# Part 4
story.append(Paragraph("Part 4 — Find the slope of each line from the graph.",SEC)); story.append(Spacer(1,4))
story.append(row2([p4cell(n) for n in [7,8,9,10,11,12]], botpad=6))
story.append(PageBreak())
# Part 5
story.append(Paragraph("Part 5 — Find the slope between the two points. Simplify if needed.",SEC)); story.append(Spacer(1,5))
story.append(row2([p5box(13,"(1, 3) and (5, 11)"), p5box(14,"(-2, 1) and (3, -4)"),
                   p5box(15,"(0, -3) and (4, 3)"), p5box(16,"(-4, 2) and (2, -1)")]))

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.5*inch,bottomMargin=0.4*inch,
                      leftMargin=0.55*inch,rightMargin=0.55*inch,title="Linear Functions and Slope")
doc.build(story)
print("saved",OUT)
