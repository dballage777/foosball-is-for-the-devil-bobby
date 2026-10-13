from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

OUT="Graphing Linear Functions - Table and Graph ANSWER KEY (14 problems).pdf"

base=dict(fontName="Helvetica", fontSize=10, leading=12)
TITLE=ParagraphStyle("T", **{**base,"fontName":"Helvetica-Bold","fontSize":14,"leading":16,"alignment":TA_CENTER})
SUB=ParagraphStyle("S", **{**base,"fontSize":9.5,"leading":12,"alignment":TA_CENTER})
EQ=ParagraphStyle("E", **{**base,"fontName":"Helvetica-Bold","fontSize":11,"leading":13})
CEN=ParagraphStyle("C", **{**base,"alignment":TA_CENTER})
HDR=ParagraphStyle("H", **{**base,"fontName":"Helvetica-Bold","alignment":TA_CENTER})
REDC=ParagraphStyle("R", **{**base,"alignment":TA_CENTER,"fontName":"Helvetica-Bold","textColor":colors.HexColor("#D00000")})

eqs=["y = -x + 1","y = x + 2","y = 2x - 1","y = -x - 2","y = x - 3","y = -2x + 2","y = x + 1",
     "y = -x + 3","y = 2x + 1","y = -2x - 1","y = x - 1","y = -x + 2","y = 2x","y = -2x - 2"]
mb=[(-1,1),(1,2),(2,-1),(-1,-2),(1,-3),(-2,2),(1,1),
    (-1,3),(2,1),(-2,-1),(1,-1),(-1,2),(2,0),(-2,-2)]
xs=[-2,-1,0,1,2]

def grid_img(path,w_in):
    pw,ph=PILImage.open(path).size
    return Image(path, width=w_in*inch, height=w_in*ph/pw*inch)

def xy_table(m,b):
    data=[[Paragraph("<u>X</u>",HDR),Paragraph("<u>Y</u>",HDR),Paragraph("<u>(x, y)</u>",HDR)]]
    for x in xs:
        y=m*x+b
        data.append([Paragraph(f"<b>{x}</b>",CEN), Paragraph(str(y),REDC), Paragraph(f"({x}, {y})",REDC)])
    t=Table(data, colWidths=[0.32*inch,1.25*inch,0.68*inch], rowHeights=[0.2*inch]+[0.3*inch]*5)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.7,colors.black),
                           ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

def cell(i):
    m,b=mb[i]
    inner=Table([[xy_table(m,b), grid_img(f"keygrid_{i+1}.png",1.45)]], colWidths=[2.25*inch,1.45*inch])
    inner.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                               ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
                               ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return [Paragraph(f"{i+1})&nbsp;&nbsp; {eqs[i]}", EQ), Spacer(1,3), inner]

def grid_of(idxs):
    rows=[]
    for r in range(0,len(idxs),2):
        pair=idxs[r:r+2]
        rows.append([cell(pair[0])]+([cell(pair[1])] if len(pair)>1 else [""]))
    t=Table(rows, colWidths=[3.75*inch,3.75*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),10),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

story=[]
story.append(Paragraph("Graphing Linear Functions — Make a Table & Graph", TITLE))
story.append(Paragraph('<font color="#D00000"><b>ANSWER KEY</b></font> — completed tables and graphs shown in red', SUB))
story.append(Spacer(1,8))
story.append(grid_of(list(range(0,8))))
story.append(PageBreak())
story.append(grid_of(list(range(8,14))))

doc=SimpleDocTemplate(OUT, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.45*inch,
                      leftMargin=0.5*inch, rightMargin=0.5*inch, title="Graphing Linear Functions ANSWER KEY")
doc.build(story)
print("saved", OUT)
