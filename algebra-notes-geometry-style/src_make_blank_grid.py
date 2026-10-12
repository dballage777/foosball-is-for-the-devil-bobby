import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

GB="#9DB8D6"
fig,ax=plt.subplots(figsize=(2.4,2.4),dpi=220)
for i in range(-6,7):
    ax.plot([i,i],[-6,6],color=GB,lw=0.6,zorder=1)
    ax.plot([-6,6],[i,i],color=GB,lw=0.6,zorder=1)
ax.annotate("",xy=(6.8,0),xytext=(-6.8,0),arrowprops=dict(arrowstyle="-|>",color="black",lw=1.3),zorder=3)
ax.annotate("",xy=(0,6.8),xytext=(0,-6.8),arrowprops=dict(arrowstyle="-|>",color="black",lw=1.3),zorder=3)
for i in range(-6,7):
    if i!=0:
        ax.text(i,-0.3,str(i),ha="center",va="top",fontsize=5,color="#333")
        ax.text(-0.22,i,str(i),ha="right",va="center",fontsize=5,color="#333")
ax.text(6.9,-0.55,"x",fontsize=7,style="italic")
ax.text(-0.7,6.85,"y",fontsize=7,style="italic")
ax.set_xlim(-7.3,7.3); ax.set_ylim(-7.3,7.3)
ax.set_aspect("equal"); ax.axis("off")
plt.savefig("blankgrid.png",bbox_inches="tight",pad_inches=0.03)
print("grid saved")
