import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
GRID="#C9C9C9"; LINE="#5B6BD6"; DOT="#1F9BC2"
# (m, b, two lattice points)
probs=[(-3,1,[(-1,4),(1,-2)]), (0.5,1,[(-4,-1),(2,2)])]
for idx,(m,b,pts) in enumerate(probs,start=1):
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
    X=np.linspace(-5,5,400); Y=m*X+b; k=np.abs(Y)<=5.05
    ax.plot(X[k],Y[k],color=LINE,lw=1.7,zorder=4)
    for (px,py) in pts:
        ax.scatter([px],[py],color=DOT,s=34,zorder=5,edgecolors="none")
    ax.set_xlim(-6.2,6.2); ax.set_ylim(-6.2,6.2); ax.set_aspect("equal"); ax.axis("off")
    plt.savefig(f"slope_{idx}.png",bbox_inches="tight",pad_inches=0.03); plt.close()
print("done")
