from math import gcd
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

OUT="Finding Slope ANSWER KEY.pdf"
RED=colors.HexColor("#C01515")
base=dict(fontName="Helvetica", fontSize=11, leading=14)
TITLE=ParagraphStyle("T",**{**base,"fontName":"Helvetica-Bold","fontSize":15,"leading":18,"alignment":TA_CENTER})
LBL =ParagraphStyle("L",**{**base,"fontName":"Helvetica-Bold","fontSize":11.5})
SEC =ParagraphStyle("SE",**{**base,"fontName":"Helvetica-Bold","fontSize":12,"leading":15})
SMALL=ParagraphStyle("SM",**{**base,"fontSize":9.5,"leading":12})
BODY=ParagraphStyle("B",**{**base,"fontSize":10.5,"leading":13})
MBIG=ParagraphStyle("MB",**{**base,"fontSize":13,"leading":16})
FRc =ParagraphStyle("FR",**{**base,"fontSize":11,"alignment":TA_CENTER,"leading":13})
FRred=ParagraphStyle("FRr",**{**base,"fontSize":10,"alignment":TA_CENTER,"leading":12,"textColor":RED,"fontName":"Helvetica-Bold"})
REDm=ParagraphStyle("RM",**{**base,"fontSize":12.5,"leading":15,"textColor":RED,"fontName":"Helvetica-Bold"})
NUM =ParagraphStyle("NU",**{**base,"fontName":"Helvetica-Bold","fontSize":10.5})

def formula():
    t=Table([[Paragraph("y<sub>2</sub> - y<sub>1</sub>",FRc)],[Paragraph("x<sub>2</sub> - x<sub>1</sub>",FRc)]],colWidths=[1.05*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),0.9,colors.black),('TOPPADDING',(0,0),(-1,-1),2),
                           ('BOTTOMPADDING',(0,0),(-1,-1),2),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def formula_block():
    t=Table([["", formula()]], colWidths=[0.4*inch,1.15*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),
                           ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return t

def sub(a,b): return f"{a} - ({b})" if b<0 else f"{a} - {b}"
def solve(p1,p2):
    (x1,y1),(x2,y2)=p1,p2
    rise=y2-y1; run=x2-x1
    numx=sub(y2,y1); denx=sub(x2,x1)
    if run==0: tail="undefined"; raw=f"{rise}/0"; simp="undefined"
    elif rise==0: tail="0"; raw=f"0/{run}"; simp="0"
    else:
        raw=f"{rise}/{run}"; g=gcd(abs(rise),abs(run)); r=rise//g; rn=run//g
        if rn<0: r,-rn
        if rn<0: r=-r; rn=-rn
        simp=f"{r}" if rn==1 else f"{r}/{rn}"
        tail=(raw if simp==raw else f"{raw} = {simp}")
    return numx,denx,tail

def ans_frac(numx,denx):
    t=Table([[Paragraph(numx,FRred)],[Paragraph(denx,FRred)]],colWidths=[1.25*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),0.9,RED),('TOPPADDING',(0,0),(-1,-1),1),
                           ('BOTTOMPADDING',(0,0),(-1,-1),1),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def ans_row(p1,p2):
    numx,denx,tail=solve(p1,p2)
    t=Table([[Paragraph("<i>m</i> =",REDm), ans_frac(numx,denx), Paragraph(f"= {tail}",REDm)]],
            colWidths=[0.42*inch,1.3*inch,1.3*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),
                           ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return t

def box(points_str,p1,p2,w,number=None):
    d = f"{number}.  Find the slope, simplify (reduce) if needed." if number else "Find the slope, simplify (reduce) if needed."
    inner=[Paragraph(d, SMALL), Spacer(1,9),
           Paragraph(f"Given the points {points_str}", BODY), Spacer(1,14),
           formula_block(), Spacer(1,16), ans_row(p1,p2)]
    t=Table([[inner]], colWidths=[w*inch])
    t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),1.0,colors.black),('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),
                           ('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),13)]))
    return t
def two_col(boxes, colw=3.65):
    rows=[]
    for i in range(0,len(boxes),2):
        pair=boxes[i:i+2]; rows.append(pair + ([""] if len(pair)<2 else []))
    t=Table(rows, colWidths=[colw*inch,colw*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),
                           ('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    return t

# ---- graph answers ----
def img(path,w):
    pw,ph=PILImage.open(path).size
    return Image(path,width=w*inch,height=w*ph/pw*inch)
gans={9:("2","3","2/3"),10:("-3","4","-3/4"),11:("2","4","1/2"),12:("6","4","3/2"),
      13:("0","4","0"),14:("-5","0","undefined")}
def grr(rise,run):
    t=Table([[Paragraph(rise,FRred)],[Paragraph(run,FRred)]],colWidths=[0.5*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),1,RED),('TOPPADDING',(0,0),(-1,-1),0),
                           ('BOTTOMPADDING',(0,0),(-1,-1),0),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def gprompt(n):
    rise,run,simp=gans[n]
    t=Table([[Paragraph("<i>m</i> =",REDm), grr(rise,run), Paragraph(f"= {simp}",REDm)]],
            colWidths=[0.42*inch,0.55*inch,1.4*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t
def gcell(n):
    return [Paragraph(f"{n}.  Find the slope of the line.",NUM), Spacer(1,2),
            img(f"fsk_{n}.png",2.1), Spacer(1,3), gprompt(n)]
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
story.append(Paragraph('Finding Slope — <font color="#C01515">ANSWER KEY</font>', TITLE))
story.append(Spacer(1,6))
story.append(Paragraph("Examples 1 - 4:", LBL))
story.append(Spacer(1,4))
ex=[box("(1, 1) and (5, 7)",(1,1),(5,7),3.55),
    box("(-4, -3) and (2, -6)",(-4,-3),(2,-6),3.55),
    box("(-4, 3) and (5, 3)",(-4,3),(5,3),3.55),
    box("(-2, -5) and (-2, 4)",(-2,-5),(-2,4),3.55)]
story.append(two_col(ex))
story.append(Spacer(1,6))
story.append(Paragraph("Find the slope from each pair of points. Simplify if needed.", SEC))
story.append(Spacer(1,5))
pairs=[("(1, 3) and (5, 11)",(1,3),(5,11)),("(-2, 1) and (3, -4)",(-2,1),(3,-4)),
       ("(0, -3) and (4, 3)",(0,-3),(4,3)),("(-4, 2) and (2, -1)",(-4,2),(2,-1)),
       ("(2, 5) and (7, 9)",(2,5),(7,9)),("(-3, -2) and (3, 2)",(-3,-2),(3,2)),
       ("(1, 4) and (6, 4)",(1,4),(6,4)),("(-2, 5) and (-2, -3)",(-2,5),(-2,-3))]
story.append(two_col([box(s,p1,p2,3.55,number=i+1) for i,(s,p1,p2) in enumerate(pairs)]))
story.append(PageBreak())
story.append(Paragraph("Find the slope of each line from the graph.", SEC))
story.append(Spacer(1,5))
story.append(gcols([9,10,11,12,13,14]))

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.5*inch,bottomMargin=0.4*inch,
                      leftMargin=0.55*inch,rightMargin=0.55*inch,title="Finding Slope ANSWER KEY")
doc.build(story)
print("saved",OUT)
