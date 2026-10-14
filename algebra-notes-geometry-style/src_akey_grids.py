import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
GRID="#BDBDBD"; LINE="#0E1C6B"; DOT="#C01515"; RED="#C01515"
probs=[
 ('lin',(2/3,1),[(-3,-1),(0,1)]),
 ('lin',(-3/4,0.5),[(-2,2),(2,-1)]),
 ('lin',(0.5,0),[(-2,-1),(2,1)]),
 ('lin',(2,0),[(-1,-2),(1,2)]),
 ('lin',(3/5,1),[(-5,-2),(0,1)]),
 ('lin',(-2/3,1),[(0,1),(3,-1)]),
 ('lin',(-2,1),[(-1,3),(2,-3)]),
 ('lin',(1.5,0),[(-2,-3),(2,3)]),
 ('vert',-2,[(-2,3),(-2,-2)]),
 ('horz',2,[(-3,2),(1,2)]),
]
for idx,(typ,par,pts) in enumerate(probs,start=1):
    fig,ax=plt.subplots(figsize=(2.7,2.7),dpi=220)
    for i in range(-5,6):
        ax.plot([i,i],[-5,5],color=GRID,lw=0.7,zorder=1)
        ax.plot([-5,5],[i,i],color=GRID,lw=0.7,zorder=1)
    ax.annotate("",xy=(5.7,0),xytext=(-5.7,0),arrowprops=dict(arrowstyle="-|>",color="black",lw=1.2),zorder=3)
    ax.annotate("",xy=(0,5.7),xytext=(0,-5.7),arrowprops=dict(arrowstyle="-|>",color="black",lw=1.2),zorder=3)
    for i in range(-5,6):
        if i!=0:
            ax.text(i,-0.28,str(i),ha="center",va="top",fontsize=5,color="#555")
            ax.text(-0.2,i,str(i),ha="right",va="center",fontsize=5,color="#555")
    ax.text(5.8,-0.5,"x",fontsize=7,style="italic"); ax.text(-0.55,5.8,"y",fontsize=7,style="italic")
    if typ=='lin':
        m,b=par; X=np.linspace(-5,5,400); Y=m*X+b; k=np.abs(Y)<=5.05
        ax.plot(X[k],Y[k],color=LINE,lw=2.4,zorder=4)
        (x1,y1),(x2,y2)=pts
        # red staircase: rise (vertical) then run (horizontal)
        ax.plot([x1,x1],[y1,y2],color=RED,lw=1.8,ls=(0,(4,2)),zorder=6)
        ax.plot([x1,x2],[y2,y2],color=RED,lw=1.8,ls=(0,(4,2)),zorder=6)
        rise=y2-y1; run=x2-x1
        ax.text(x1-0.45,(y1+y2)/2,f"{rise:+d}".replace("+","+"),color=RED,fontsize=8,fontweight='bold',ha='right',va='center')
        ax.text((x1+x2)/2,y2+(0.5 if y2<y1 else -0.55),f"+{run}",color=RED,fontsize=8,fontweight='bold',ha='center',va='center')
    elif typ=='vert':
        ax.plot([par,par],[-5,5],color=LINE,lw=2.4,zorder=4)
    elif typ=='horz':
        ax.plot([-5,5],[par,par],color=LINE,lw=2.4,zorder=4)
    for (px,py) in pts:
        ax.scatter([px],[py],color=DOT,s=40,zorder=7,edgecolors="white",linewidths=0.8)
    ax.set_xlim(-6.2,6.2); ax.set_ylim(-6.2,6.2); ax.set_aspect("equal"); ax.axis("off")
    plt.savefig(f"akey_{idx}.png",bbox_inches="tight",pad_inches=0.03); plt.close()

# Part B key grids (-6..6) with red line+points
GB="#9DB8D6"
def bgrid(ax):
    for i in range(-6,7):
        ax.plot([i,i],[-6,6],color=GB,lw=0.6,zorder=1); ax.plot([-6,6],[i,i],color=GB,lw=0.6,zorder=1)
    ax.annotate("",xy=(6.8,0),xytext=(-6.8,0),arrowprops=dict(arrowstyle="-|>",color="black",lw=1.3),zorder=3)
    ax.annotate("",xy=(0,6.8),xytext=(0,-6.8),arrowprops=dict(arrowstyle="-|>",color="black",lw=1.3),zorder=3)
    for i in range(-6,7):
        if i!=0:
            ax.text(i,-0.3,str(i),ha="center",va="top",fontsize=5,color="#333")
            ax.text(-0.22,i,str(i),ha="right",va="center",fontsize=5,color="#333")
    ax.text(6.9,-0.55,"x",fontsize=7,style="italic"); ax.text(-0.7,6.85,"y",fontsize=7,style="italic")
xs=[-2,-1,0,1,2]
for name,(m,b) in [("keyB_1",(2,-1)),("keyB_2",(-1,3))]:
    fig,ax=plt.subplots(figsize=(2.4,2.4),dpi=220); bgrid(ax)
    X=np.linspace(-6,6,400); Y=m*X+b; k=np.abs(Y)<=6.05
    ax.plot(X[k],Y[k],color=RED,lw=1.8,zorder=4)
    ax.scatter(xs,[m*x+b for x in xs],color=RED,s=22,zorder=5)
    ax.set_xlim(-7.3,7.3); ax.set_ylim(-7.3,7.3); ax.set_aspect("equal"); ax.axis("off")
    plt.savefig(f"{name}.png",bbox_inches="tight",pad_inches=0.03); plt.close()
print("answer-key graphs done")
