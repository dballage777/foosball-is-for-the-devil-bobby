import os, matplotlib
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

TTF=os.path.join(matplotlib.get_data_path(),'fonts','ttf')
pdfmetrics.registerFont(TTFont('DJ', os.path.join(TTF,'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DJB', os.path.join(TTF,'DejaVuSans-Bold.ttf')))

OUT="Geometry_Triangle_Congruence_Proofs_Notes.pdf"
cong="≅"; tri="△"; ang="∠"

TITLE=ParagraphStyle("T",fontName='DJB',fontSize=15,leading=18,alignment=TA_CENTER)
NAME =ParagraphStyle("N",fontName='DJ',fontSize=10.5,leading=14)
GP   =ParagraphStyle("GP",fontName='DJ',fontSize=11.5,leading=20)
HDR  =ParagraphStyle("H",fontName='DJB',fontSize=11,leading=13,alignment=TA_CENTER)
NUM  =ParagraphStyle("NU",fontName='DJ',fontSize=11,leading=13)

def diag(path,h_in):
    pw,ph=PILImage.open(path).size
    return Image(path,width=h_in*pw/ph*inch,height=h_in*inch)

ROWH=0.42*inch; NROWS=6

def problem(diagfile, given_prove, diag_h=1.5):
    top=Table([[Paragraph(given_prove,GP), diag(diagfile,diag_h)]],
              colWidths=[3.95*inch,3.45*inch])
    top.setStyle(TableStyle([('BOX',(0,0),(-1,-1),1.1,colors.black),
                             ('LINEAFTER',(0,0),(0,0),1.1,colors.black),
                             ('VALIGN',(0,0),(0,0),'TOP'),('VALIGN',(1,0),(1,0),'MIDDLE'),
                             ('ALIGN',(1,0),(1,0),'CENTER'),
                             ('LEFTPADDING',(0,0),(0,0),7),('TOPPADDING',(0,0),(0,0),7),
                             ('TOPPADDING',(1,0),(1,0),3),('BOTTOMPADDING',(1,0),(1,0),3)]))
    data=[[Paragraph("Statement",HDR),Paragraph("Reason",HDR)]]
    for i in range(NROWS): data.append([Paragraph(f"{i+1}.",NUM),""])
    proof=Table(data, colWidths=[4.55*inch,2.85*inch],
                rowHeights=[0.3*inch]+[ROWH]*NROWS)
    proof.setStyle(TableStyle([('GRID',(0,0),(-1,-1),1.1,colors.black),
                               ('VALIGN',(0,0),(-1,-1),'TOP'),
                               ('LEFTPADDING',(0,1),(0,-1),6),('TOPPADDING',(0,1),(-1,-1),3),
                               ('VALIGN',(0,0),(-1,0),'MIDDLE')]))
    return KeepTogether([top,proof])

P1=f"<b>Given:</b>  AB {cong} DC,   AC {cong} DB<br/><br/><b>Prove:</b>  {tri}ABC {cong} {tri}DCB"
P2=f"<b>Given:</b>  WX {cong} YX,   Z is the midpoint of WY<br/><br/><b>Prove:</b>  {tri}WXZ {cong} {tri}YXZ"
P3=f"<b>Given:</b>  QP {cong} QR,   QS bisects {ang}PQR<br/><br/><b>Prove:</b>  {tri}PQS {cong} {tri}RQS"
P4=f"<b>Given:</b>  JL bisects KM,   KM bisects JL<br/><br/><b>Prove:</b>  {tri}JNK {cong} {tri}LNM"

story=[]
story.append(Paragraph("Triangle Congruence Proofs — SSS &amp; SAS", TITLE))
story.append(Spacer(1,3))
story.append(Paragraph("Name: ________________________________     Date: ______________     Period: ______", NAME))
story.append(Spacer(1,8))
story.append(problem("diag1.png",P1)); story.append(Spacer(1,12))
story.append(problem("diag2.png",P2))
story.append(PageBreak())
story.append(problem("diag3.png",P3)); story.append(Spacer(1,12))
story.append(problem("diag4.png",P4))

doc=SimpleDocTemplate(OUT,pagesize=letter,topMargin=0.55*inch,bottomMargin=0.5*inch,
                      leftMargin=0.55*inch,rightMargin=0.55*inch,title="Triangle Congruence Proofs")
doc.build(story)
print("saved",OUT)
