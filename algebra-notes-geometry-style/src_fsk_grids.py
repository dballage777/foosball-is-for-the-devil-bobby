import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
GRID="#BDBDBD"; LINE="#0E1C6B"; DOT="#C01515"; RED="#C01515"
# (type, param, points, staircase?)
probs={
 9:('lin',(2/3,1),[(-3,-1),(0,1)],True),
 10:('lin',(-3/4,0.5),[(-2,2),(2,-1)],True),
 11:('lin',(0.5,0),[(-2,-1),(2,1)],True),
 12:('lin',(1.5,0),[(-2,-3),(2,3)],True),
 13:('horz',2,[(-3,2),(1,2)],False),
 14:('vert',-2,[(-2,3),(-2,-2)],False),
}
for idx,(typ,par,pts,stair) in probs.items():
    fig,ax=plt.subplots(figsize=(2.7,2.7),dpi=220)
    for i in range(-5,6):
        ax.plot([i,i],[-5,5],color=GRID,lw=0.7,zorder=1); ax.plot([-5,5],[i,i],color=GRID,lw=0.7,zorder=1)
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
        if stair:
            (x1,y1),(x2,y2)=pts
            ax.plot([x1,x1],[y1,y2],color=RED,lw=1.8,ls=(0,(4,2)),zorder=6)
            ax.plot([x1,x2],[y2,y2],color=RED,lw=1.8,ls=(0,(4,2)),zorder=6)
            ax.text(x1-0.45,(y1+y2)/2,f"{y2-y1:+d}",color=RED,fontsize=8,fontweight='bold',ha='right',va='center')
            ax.text((x1+x2)/2,y2+(0.5 if y2<y1 else -0.55),f"+{x2-x1}",color=RED,fontsize=8,fontweight='bold',ha='center',va='center')
    elif typ=='vert':
        ax.plot([par,par],[-5,5],color=LINE,lw=2.4,zorder=4)
    elif typ=='horz':
        ax.plot([-5,5],[par,par],color=LINE,lw=2.4,zorder=4)
    for (px,py) in pts:
        ax.scatter([px],[py],color=DOT,s=40,zorder=7,edgecolors="white",linewidths=0.8)
    ax.set_xlim(-6.2,6.2); ax.set_ylim(-6.2,6.2); ax.set_aspect("equal"); ax.axis("off")
    plt.savefig(f"fsk_{idx}.png",bbox_inches="tight",pad_inches=0.03); plt.close()
print("key graphs 9-14 done")
