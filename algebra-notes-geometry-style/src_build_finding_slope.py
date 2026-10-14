from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

OUT="Finding Slope.pdf"
base=dict(fontName="Helvetica", fontSize=11, leading=14)
TITLE=ParagraphStyle("T",**{**base,"fontName":"Helvetica-Bold","fontSize":15,"leading":18,"alignment":TA_CENTER})
LBL =ParagraphStyle("L",**{**base,"fontName":"Helvetica-Bold","fontSize":11.5})
SEC =ParagraphStyle("SE",**{**base,"fontName":"Helvetica-Bold","fontSize":12,"leading":15})
NAME=ParagraphStyle("N",**{**base,"fontSize":10.5})
SMALL=ParagraphStyle("SM",**{**base,"fontSize":9.5,"leading":12})
BODY=ParagraphStyle("B",**{**base,"fontSize":10.5,"leading":13})
MST =ParagraphStyle("M",**{**base,"fontSize":11})
MBIG=ParagraphStyle("MB",**{**base,"fontSize":13,"leading":16})
FRc =ParagraphStyle("FR",**{**base,"fontSize":11,"alignment":TA_CENTER,"leading":13})
NUM =ParagraphStyle("NU",**{**base,"fontName":"Helvetica-Bold","fontSize":10.5})
FRr =ParagraphStyle("FRr",**{**base,"fontSize":10,"alignment":TA_CENTER,"leading":12})

def formula():  # m = (y2 - y1) / (x2 - x1) stacked
    t=Table([[Paragraph("y<sub>2</sub> - y<sub>1</sub>",FRc)],[Paragraph("x<sub>2</sub> - x<sub>1</sub>",FRc)]],
            colWidths=[1.05*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),0.9,colors.black),
                           ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2),
                           ('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t

def mrow_formula():
    mrow=Table([[Paragraph("<i>m</i> =",MBIG), formula()]], colWidths=[0.5*inch,1.15*inch])
    mrow.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),
                              ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return mrow

def box(points, w):
    inner=[Paragraph("Find the slope, simplify (reduce) if needed.", SMALL), Spacer(1,11),
           Paragraph(f"Given the points {points}", BODY), Spacer(1,18),
           mrow_formula(), Spacer(1,24),
           Paragraph("<i>m</i> = ______________", MBIG)]
    t=Table([[inner]], colWidths=[w*inch])
    t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),1.0,colors.black),('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),
                           ('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),13)]))
    return t

def two_col(boxes, colw=3.65):
    rows=[]
    for i in range(0,len(boxes),2):
        pair=boxes[i:i+2]
        rows.append(pair + ([""] if len(pair)<2 else []))
    t=Table(rows, colWidths=[colw*inch,colw*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),8),
                           ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    return t

def num_box(n, points, w):
    inner=[Paragraph(f"{n}.  Find the slope, simplify (reduce) if needed.", SMALL), Spacer(1,11),
           Paragraph(f"Given the points {points}", BODY), Spacer(1,18),
           mrow_formula(), Spacer(1,24),
           Paragraph("<i>m</i> = ______________", MBIG)]
    t=Table([[inner]], colWidths=[w*inch])
    t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),1.0,colors.black),('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),
                           ('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),13)]))
    return t

# ---- graph problems ----
def img(path,w):
    pw,ph=PILImage.open(path).size
    return Image(path,width=w*inch,height=w*ph/pw*inch)
def frac_rr():
    t=Table([[Paragraph("rise",FRr)],[Paragraph("run",FRr)]], colWidths=[0.5*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),1,colors.black),('TOPPADDING',(0,0),(-1,-1),0),
                           ('BOTTOMPADDING',(0,0),(-1,-1),0),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def gprompt():
    t=Table([[Paragraph("m =",MST), frac_rr(), Paragraph("= __________",MST)]],
            colWidths=[0.42*inch,0.55*inch,1.3*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t
def gcell(n):
    return [Paragraph(f"{n}.  Find the slope of the line.",NUM), Spacer(1,2),
            img(f"fs_{n}.png",2.1), Spacer(1,3), gprompt()]
def gcols(nums):
    rows=[]
    for i in range(0,len(nums),2):
        pair=nums[i:i+2]; rows.append([gcell(pair[0])]+([gcell(pair[1])] if len(pair)>1 else [""]))
    t=Table(rows, colWidths=[3.65*inch,3.65*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'CENTER'),
                           ('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3),
                           ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    return t

story=[]
story.append(Paragraph("Finding Slope", TITLE))
story.append(Spacer(1,3))
story.append(Paragraph("Name: ______________________________     Date: ______________     Period: ______", NAME))
story.append(Spacer(1,8))
story.append(Paragraph("Examples 1 - 4:", LBL))
story.append(Spacer(1,4))
ex=[box("(1, 1) and (5, 7)",3.55),         # 1 positive reducible   6/4 = 3/2
    box("(-4, -3) and (2, -6)",3.55),      # 2 negative reducible, subtracting negatives  -3/6 = -1/2
    box("(-4, 3) and (5, 3)",3.55),        # 3 zero   0/9 = 0
    box("(-2, -5) and (-2, 4)",3.55)]      # 4 undefined  9/0
story.append(two_col(ex))
story.append(Spacer(1,6))
story.append(Paragraph("Find the slope from each pair of points. Simplify if needed.", SEC))
story.append(Spacer(1,5))
pairs=[(1,"(1, 3) and (5, 11)"),(2,"(-2, 1) and (3, -4)"),(3,"(0, -3) and (4, 3)"),
       (4,"(-4, 2) and (2, -1)"),(5,"(2, 5) and (7, 9)"),(6,"(-3, -2) and (3, 2)"),
       (7,"(1, 4) and (6, 4)"),(8,"(-2, 5) and (-2, -3)")]
story.append(two_col([num_box(n,p,3.55) for n,p in pairs]))
story.append(PageBreak())
story.append(Paragraph("Find the slope of each line from the graph.", SEC))
story.append(Spacer(1,5))
story.append(gcols([9,10,11,12,13,14]))

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.5*inch,bottomMargin=0.4*inch,
                      leftMargin=0.55*inch,rightMargin=0.55*inch,title="Finding Slope")
doc.build(story)
print("saved",OUT)
