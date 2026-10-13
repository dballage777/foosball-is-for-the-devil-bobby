from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer
from PIL import Image as PILImage

OUT="Finding Slope From a Graph (2 problems).pdf"
base=dict(fontName="Helvetica", fontSize=12, leading=15)
TITLE=ParagraphStyle("T",**{**base,"fontName":"Helvetica-Bold","fontSize":14,"leading":17,"alignment":TA_CENTER})
SUB=ParagraphStyle("S",**{**base,"fontSize":11,"alignment":TA_CENTER})
NUM=ParagraphStyle("N",**{**base,"fontName":"Helvetica-Bold","fontSize":12})
FR=ParagraphStyle("F",**{**base,"fontSize":11,"alignment":TA_CENTER,"leading":13})
MST=ParagraphStyle("M",**{**base,"fontSize":13})

def img(path,w):
    pw,ph=PILImage.open(path).size
    return Image(path,width=w*inch,height=w*ph/pw*inch)

def frac():
    t=Table([[Paragraph("rise",FR)],[Paragraph("run",FR)]], colWidths=[0.55*inch])
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(0,0),1,colors.black),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1),
                           ('ALIGN',(0,0),(-1,-1),'CENTER')]))
    return t

def prompt():
    t=Table([[Paragraph("m =",MST), frac(), Paragraph("= ______________",MST)]],
            colWidths=[0.45*inch,0.6*inch,1.7*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

def cell(n,imgfile):
    return [Paragraph(f"{n}.  Find the slope of the line.",NUM), Spacer(1,4),
            img(imgfile,3.0), Spacer(1,8), prompt()]

story=[]
story.append(Paragraph("Finding Slope From a Graph", TITLE))
story.append(Paragraph("Use the two points on each line to count the rise and the run.", SUB))
story.append(Spacer(1,16))
row=Table([[cell(1,"slope_1.png"), cell(2,"slope_2.png")]], colWidths=[3.6*inch,3.6*inch])
row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'CENTER'),
                         ('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4)]))
story.append(row)

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.7*inch,bottomMargin=0.6*inch,
                      leftMargin=0.6*inch,rightMargin=0.6*inch,title="Finding Slope From a Graph")
doc.build(story)
print("saved",OUT)
