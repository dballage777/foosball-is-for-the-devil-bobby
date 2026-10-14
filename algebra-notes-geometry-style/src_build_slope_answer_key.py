from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

OUT="Slope and Graphing Assignment ANSWER KEY.pdf"
RED=colors.HexColor("#C01515")
base=dict(fontName="Helvetica", fontSize=11, leading=14)
TITLE=ParagraphStyle("T",**{**base,"fontName":"Helvetica-Bold","fontSize":14,"leading":17,"alignment":TA_CENTER})
SUB=ParagraphStyle("S",**{**base,"fontSize":10.5,"alignment":TA_CENTER})
SEC=ParagraphStyle("SE",**{**base,"fontName":"Helvetica-Bold","fontSize":12,"leading":15})
NUM=ParagraphStyle("NU",**{**base,"fontName":"Helvetica-Bold","fontSize":11})
FRr=ParagraphStyle("Fr",**{**base,"fontSize":10,"alignment":TA_CENTER,"leading":12,"textColor":RED,"fontName":"Helvetica-Bold"})
MST=ParagraphStyle("M",**{**base,"fontSize":12})
ANS=ParagraphStyle("A",**{**base,"fontSize":12,"textColor":RED,"fontName":"Helvetica-Bold"})
CEN=ParagraphStyle("C",**{**base,"alignment":TA_CENTER})
HDR=ParagraphStyle("H",**{**base,"fontName":"Helvetica-Bold","alignment":TA_CENTER})
REDC=ParagraphStyle("R",**{**base,"alignment":TA_CENTER,"fontName":"Helvetica-Bold","textColor":RED})
EQ=ParagraphStyle("E",**{**base,"fontName":"Helvetica-Bold","fontSize":11})

def img(path,w):
    pw,ph=PILImage.open(path).size
    return Image(path,width=w*inch,height=w*ph/pw*inch)

# answers: (rise, run, simplified)
ans={1:(2,3,"2/3"),2:(-3,4,"-3/4"),3:(2,4,"1/2"),4:(4,2,"2"),5:(3,5,"3/5"),
     6:(-2,3,"-2/3"),7:(-6,3,"-2"),8:(6,4,"3/2"),9:(-5,0,"undefined"),10:(0,4,"0")}

def frac_num(rise,run):
    t=Table([[Paragraph(str(rise),FRr)],[Paragraph(str(run),FRr)]], colWidths=[0.5*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),1,RED),('TOPPADDING',(0,0),(-1,-1),0),
                           ('BOTTOMPADDING',(0,0),(-1,-1),0),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t
def prompt(n):
    rise,run,simp=ans[n]
    t=Table([[Paragraph("m =",MST), frac_num(rise,run), Paragraph(f"=  {simp}",ANS)]],
            colWidths=[0.42*inch,0.55*inch,1.35*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t
def slope_cell(n):
    return [Paragraph(f"{n}.  Find the slope of the line.",NUM), Spacer(1,2),
            img(f"akey_{n}.png",2.15), Spacer(1,3), prompt(n)]
def slope_grid(nums):
    rows=[]
    for r in range(0,len(nums),2):
        pair=nums[r:r+2]
        rows.append([slope_cell(pair[0])]+([slope_cell(pair[1])] if len(pair)>1 else [""]))
    t=Table(rows, colWidths=[3.65*inch,3.65*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'CENTER'),
                           ('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3),
                           ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    return t

def xy_table(m,b):
    data=[[Paragraph("<u>X</u>",HDR),Paragraph("<u>Y</u>",HDR),Paragraph("<u>(x, y)</u>",HDR)]]
    for x in [-2,-1,0,1,2]:
        y=m*x+b
        data.append([Paragraph(f"<b>{x}</b>",CEN),Paragraph(str(y),REDC),Paragraph(f"({x}, {y})",REDC)])
    t=Table(data, colWidths=[0.32*inch,1.2*inch,0.66*inch], rowHeights=[0.2*inch]+[0.28*inch]*5)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.7,colors.black),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t
def table_cell(n,eq,gridfile,m,b):
    inner=Table([[xy_table(m,b), img(gridfile,1.5)]], colWidths=[2.2*inch,1.55*inch])
    inner.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0),
                               ('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return [Paragraph(f"{n})&nbsp;&nbsp; {eq}", EQ), Spacer(1,3), inner]
def table_row():
    cells=[table_cell(11,"y = 2x - 1","keyB_1.png",2,-1), table_cell(12,"y = -x + 3","keyB_2.png",-1,3)]
    t=Table([cells], colWidths=[3.75*inch,3.75*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),
                           ('BOTTOMPADDING',(0,0),(-1,-1),6),('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

story=[]
story.append(Paragraph('Slope &amp; Graphing Linear Functions — <font color="#C01515">ANSWER KEY</font>', TITLE))
story.append(Spacer(1,5))
story.append(Paragraph("Part A — Find the slope of each line (rise/run counted in red, then simplified).", SEC))
story.append(Spacer(1,4))
story.append(slope_grid([1,2,3,4,5,6]))
story.append(PageBreak())
story.append(slope_grid([7,8,9,10]))
story.append(Spacer(1,8))
story.append(Paragraph("Part B — Completed tables and graphs (shown in red).", SEC))
story.append(Spacer(1,4))
story.append(table_row())

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.5*inch,bottomMargin=0.4*inch,
                      leftMargin=0.55*inch,rightMargin=0.55*inch,title="Slope and Graphing ANSWER KEY")
doc.build(story)
print("saved",OUT)
