import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
GRID="#BDBDBD"; LINE="#0E1C6B"; DOT="#C01515"

def base_ax():
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
    return fig,ax
def finish(ax,fn):
    ax.set_xlim(-6.2,6.2); ax.set_ylim(-6.2,6.2); ax.set_aspect("equal"); ax.axis("off")
    plt.savefig(fn,bbox_inches="tight",pad_inches=0.03); plt.close()

# Part 1: linear line (yes) and parabola (no)
fig,ax=base_ax()
X=np.linspace(-5,5,400); Y=0.5*X+1; k=np.abs(Y)<=5.05
ax.plot(X[k],Y[k],color=LINE,lw=2.6,zorder=4)
finish(ax,"lf_lin.png")

fig,ax=base_ax()
X=np.linspace(-5,5,400); Y=0.3*X**2-3; k=np.abs(Y)<=5.05
ax.plot(X[k],Y[k],color=LINE,lw=2.6,zorder=4)
finish(ax,"lf_non.png")

# Part 4: slope graphs 7-12
probs={
 7:('lin',(2/3,1),[(-3,-1),(0,1)]),
 8:('lin',(-3/4,0.5),[(-2,2),(2,-1)]),
 9:('lin',(0.5,0),[(-2,-1),(2,1)]),
 10:('lin',(1.5,0),[(-2,-3),(2,3)]),
 11:('horz',2,[(-3,2),(1,2)]),
 12:('vert',-2,[(-2,3),(-2,-2)]),
}
for idx,(typ,par,pts) in probs.items():
    fig,ax=base_ax()
    if typ=='lin':
        m,b=par; X=np.linspace(-5,5,400); Y=m*X+b; k=np.abs(Y)<=5.05
        ax.plot(X[k],Y[k],color=LINE,lw=2.6,zorder=4)
    elif typ=='vert': ax.plot([par,par],[-5,5],color=LINE,lw=2.6,zorder=4)
    elif typ=='horz': ax.plot([-5,5],[par,par],color=LINE,lw=2.6,zorder=4)
    for (px,py) in pts: ax.scatter([px],[py],color=DOT,s=42,zorder=5,edgecolors="white",linewidths=0.8)
    finish(ax,f"sl_{idx}.png")
print("graphics done")
