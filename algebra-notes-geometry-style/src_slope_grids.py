import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
GRID="#BDBDBD"; LINE="#0E1C6B"; DOT="#C01515"
probs=[
 ('lin',(2/3,1),[(-3,-1),(0,1)]),    # 1  2/3   non-reducible
 ('lin',(-3/4,0.5),[(-2,2),(2,-1)]), # 2  -3/4  non-reducible
 ('lin',(0.5,0),[(-2,-1),(2,1)]),    # 3  2/4 -> 1/2 reducible
 ('lin',(2,0),[(-1,-2),(1,2)]),      # 4  4/2 -> 2  whole
 ('lin',(3/5,1),[(-5,-2),(0,1)]),    # 5  3/5   non-reducible
 ('lin',(-2/3,1),[(0,1),(3,-1)]),    # 6  -2/3  non-reducible
 ('lin',(-2,1),[(-1,3),(2,-3)]),     # 7  -6/3 -> -2 whole
 ('lin',(1.5,0),[(-2,-3),(2,3)]),    # 8  6/4 -> 3/2 reducible
 ('vert',-2,[(-2,3),(-2,-2)]),       # 9  vertical  undefined
 ('horz',2,[(-3,2),(1,2)]),          # 10 horizontal slope 0
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
        ax.plot(X[k],Y[k],color=LINE,lw=2.6,zorder=4)
    elif typ=='vert':
        ax.plot([par,par],[-5,5],color=LINE,lw=2.6,zorder=4)
    elif typ=='horz':
        ax.plot([-5,5],[par,par],color=LINE,lw=2.6,zorder=4)
    for (px,py) in pts:
        ax.scatter([px],[py],color=DOT,s=42,zorder=5,edgecolors="white",linewidths=0.8)
    ax.set_xlim(-6.2,6.2); ax.set_ylim(-6.2,6.2); ax.set_aspect("equal"); ax.axis("off")
    plt.savefig(f"slope_{idx}.png",bbox_inches="tight",pad_inches=0.03); plt.close()
print("10 slope grids done")
