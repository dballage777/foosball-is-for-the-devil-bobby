from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak
from PIL import Image as PILImage

OUT="Graphing Linear Functions - Table and Graph (14 problems).pdf"
GRID="blankgrid.png"
pw,ph=PILImage.open(GRID).size
def grid_img(w_in): return Image(GRID, width=w_in*inch, height=w_in*ph/pw*inch)

base=dict(fontName="Helvetica", fontSize=10, leading=12)
TITLE=ParagraphStyle("T", **{**base,"fontName":"Helvetica-Bold","fontSize":14,"leading":16,"alignment":TA_CENTER})
SUB=ParagraphStyle("S", **{**base,"fontSize":9.5,"leading":12,"alignment":TA_CENTER})
NAME=ParagraphStyle("N", **{**base,"fontSize":10,"leading":14})
EQ=ParagraphStyle("E", **{**base,"fontName":"Helvetica-Bold","fontSize":11,"leading":13})
CEN=ParagraphStyle("C", **{**base,"alignment":TA_CENTER})
HDR=ParagraphStyle("H", **{**base,"fontName":"Helvetica-Bold","alignment":TA_CENTER})

eqs=["y = -x + 1","y = x + 2","y = 2x - 1","y = -x - 2","y = x - 3","y = -2x + 2","y = x + 1",
     "y = -x + 3","y = 2x + 1","y = -2x - 1","y = x - 1","y = -x + 2","y = 2x","y = -2x - 2"]

def xy_table():
    data=[[Paragraph("<u>X</u>",HDR),Paragraph("<u>Y</u>",HDR),Paragraph("<u>(x, y)</u>",HDR)]]
    for x in [-2,-1,0,1,2]:
        data.append([Paragraph(f"<b>{x}</b>",CEN),"",""])
    t=Table(data, colWidths=[0.3*inch,0.95*inch,0.62*inch], rowHeights=[0.2*inch]+[0.26*inch]*5)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.7,colors.black),
                           ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),1),('BOTTOMPADDING',(0,0),(-1,-1),1),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

def cell(i):
    inner=Table([[xy_table(), grid_img(1.6)]], colWidths=[1.95*inch,1.7*inch])
    inner.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                               ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
                               ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return [Paragraph(f"{i+1})&nbsp;&nbsp; {eqs[i]}", EQ), Spacer(1,3), inner]

def grid_of(idxs):
    rows=[]
    for r in range(0,len(idxs),2):
        pair=idxs[r:r+2]
        row=[cell(pair[0])]+([cell(pair[1])] if len(pair)>1 else [""])
        rows.append(row)
    t=Table(rows, colWidths=[3.75*inch,3.75*inch])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),
                           ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),10),
                           ('LEFTPADDING',(0,0),(-1,-1),2),('RIGHTPADDING',(0,0),(-1,-1),2)]))
    return t

story=[]
story.append(Paragraph("Graphing Linear Functions — Make a Table & Graph", TITLE))
story.append(Paragraph("For each equation, find <b>y</b> for every <b>x</b>, write the ordered pair <b>(x, y)</b>, then plot the points and draw the line.", SUB))
story.append(Spacer(1,4))
story.append(Paragraph("Name: ______________________________&nbsp;&nbsp;&nbsp;&nbsp;Date: __________________&nbsp;&nbsp;&nbsp;&nbsp;Period: ______", NAME))
story.append(Spacer(1,6))
story.append(grid_of(list(range(0,8))))      # problems 1-8
story.append(PageBreak())
story.append(grid_of(list(range(8,14))))     # problems 9-14

doc=SimpleDocTemplate(OUT, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.45*inch,
                      leftMargin=0.5*inch, rightMargin=0.5*inch, title="Graphing Linear Functions - 14 problems")
doc.build(story)
print("saved", OUT)
from pypdf import PdfReader
print("pages:", len(PdfReader(OUT).pages))
