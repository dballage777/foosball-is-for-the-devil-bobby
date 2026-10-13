from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer
from PIL import Image as PILImage

OUT="Finding Slope From a Graph (6 problems).pdf"
base=dict(fontName="Helvetica", fontSize=11, leading=14)
TITLE=ParagraphStyle("T",**{**base,"fontName":"Helvetica-Bold","fontSize":14,"leading":17,"alignment":TA_CENTER})
SUB=ParagraphStyle("S",**{**base,"fontSize":10.5,"alignment":TA_CENTER})
NUM=ParagraphStyle("N",**{**base,"fontName":"Helvetica-Bold","fontSize":11})
FR=ParagraphStyle("F",**{**base,"fontSize":10,"alignment":TA_CENTER,"leading":12})
MST=ParagraphStyle("M",**{**base,"fontSize":12})

def img(path,w):
    pw,ph=PILImage.open(path).size
    return Image(path,width=w*inch,height=w*ph/pw*inch)

def frac():
    t=Table([[Paragraph("rise",FR)],[Paragraph("run",FR)]], colWidths=[0.5*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),1,colors.black),
                           ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
                           ('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t

def prompt():
    t=Table([[Paragraph("m =",MST), frac(), Paragraph("= ____________",MST)]],
            colWidths=[0.42*inch,0.55*inch,1.5*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

def cell(n):
    return [Paragraph(f"{n}.  Find the slope of the line.",NUM), Spacer(1,2),
            img(f"slope_{n}.png",2.25), Spacer(1,4), prompt()]

story=[]
story.append(Paragraph("Finding Slope From a Graph", TITLE))
story.append(Paragraph("Use the two points on each line to count the rise and the run.", SUB))
story.append(Spacer(1,10))
rows=[[cell(1),cell(2)],[cell(3),cell(4)],[cell(5),cell(6)]]
t=Table(rows, colWidths=[3.65*inch,3.65*inch])
t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'CENTER'),
                       ('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3),
                       ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
story.append(t)

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.5*inch,bottomMargin=0.4*inch,
                      leftMargin=0.6*inch,rightMargin=0.6*inch,title="Finding Slope From a Graph")
doc.build(story)
print("saved",OUT)
