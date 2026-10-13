import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def seg(ax,P,Q,lw=2.0): ax.plot([P[0],Q[0]],[P[1],Q[1]],color='k',lw=lw)
def lbl(ax,P,txt,dx,dy,fs=15): ax.text(P[0]+dx,P[1]+dy,txt,fontsize=fs,style='italic',ha='center',va='center')
def finish(ax,fn,xlim,ylim):
    ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.set_aspect('equal'); ax.axis('off')
    plt.savefig(fn,bbox_inches='tight',pad_inches=0.08,dpi=200); plt.close()

# P1 SSS: shared side BD (reflexive) + midpoint D of AC ; given AB≅CB ; prove △ABD≅△CBD
fig,ax=plt.subplots(figsize=(3.1,2.4))
A=(0,2);C=(0,-2);D=(0,0);B=(3,0)
for p,q in [(A,C),(A,B),(C,B),(D,B)]: seg(ax,p,q)
lbl(ax,A,'A',-0.3,0.2); lbl(ax,C,'C',-0.3,-0.2); lbl(ax,D,'D',-0.33,0.05); lbl(ax,B,'B',0.33,0)
finish(ax,'diag1.png',(-0.9,3.9),(-2.6,2.6))

# P2 SSS: shared side QS (reflexive) + bisector QS of PR ; given QP≅QR ; prove △QPS≅△QRS  (apex down)
fig,ax=plt.subplots(figsize=(3.1,2.4))
P=(-2,0);R=(2,0);Q=(0,-2.5);S=(0,0)
for a,b in [(P,R),(P,Q),(R,Q),(Q,S)]: seg(ax,a,b)
lbl(ax,P,'P',-0.32,0.18); lbl(ax,R,'R',0.32,0.18); lbl(ax,Q,'Q',0,-0.33); lbl(ax,S,'S',0.33,0.22)
finish(ax,'diag2.png',(-2.7,2.7),(-3.0,0.9))

# P3 SAS: bowtie, vertical angles + midpoint K of EG and FH ; prove △EKF≅△GKH
fig,ax=plt.subplots(figsize=(3.1,2.4))
E=(-2,1.5);F=(-2,-1.5);G=(2,-1.5);H=(2,1.5);K=(0,0)
for a,b in [(E,G),(F,H),(E,F),(G,H)]: seg(ax,a,b)
lbl(ax,E,'E',-0.33,0.18); lbl(ax,F,'F',-0.33,-0.18); lbl(ax,G,'G',0.33,-0.18); lbl(ax,H,'H',0.33,0.18); lbl(ax,K,'K',0.3,0.3,fs=13)
finish(ax,'diag3.png',(-2.9,2.9),(-2.3,2.3))

# P4 SAS: bowtie, vertical angles + bisector (WY & XZ bisect each other at P) ; prove △WPX≅△YPZ  (flatter)
fig,ax=plt.subplots(figsize=(3.1,2.4))
W=(-2.3,1.1);X=(-2.3,-1.1);Y=(2.3,-1.1);Z=(2.3,1.1);Pp=(0,0)
for a,b in [(W,Y),(X,Z),(W,X),(Y,Z)]: seg(ax,a,b)
lbl(ax,W,'W',-0.36,0.18); lbl(ax,X,'X',-0.36,-0.18); lbl(ax,Y,'Y',0.36,-0.18); lbl(ax,Z,'Z',0.36,0.18); lbl(ax,Pp,'P',0.3,0.3,fs=13)
finish(ax,'diag4.png',(-3.1,3.1),(-1.9,1.9))
print("diagrams2 done")
