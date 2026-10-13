import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Arc
import numpy as np

def ticks(ax,P,Q,n=1,size=0.22,gap=0.14):
    P=np.array(P,float);Q=np.array(Q,float)
    mid=(P+Q)/2; d=Q-P; L=np.linalg.norm(d); u=d/L; perp=np.array([-u[1],u[0]])
    for i in range(n):
        o=(i-(n-1)/2)*gap; c=mid+u*o
        a=c+perp*size/2; b=c-perp*size/2
        ax.plot([a[0],b[0]],[a[1],b[1]],color='k',lw=1.6)

def angle_mark(ax,V,A,B,r=0.5,hash=True):
    V=np.array(V,float);A=np.array(A,float);B=np.array(B,float)
    a1=np.degrees(np.arctan2(A[1]-V[1],A[0]-V[0]))
    a2=np.degrees(np.arctan2(B[1]-V[1],B[0]-V[0]))
    sweep=(a2-a1)%360
    if sweep>180: a1,a2=a2,a1; sweep=360-sweep
    ax.add_patch(Arc(V,2*r,2*r,angle=0,theta1=a1,theta2=a1+sweep,color='k',lw=1.5))
    if hash:
        mid=np.radians(a1+sweep/2); c=V+r*np.array([np.cos(mid),np.sin(mid)])
        t=np.array([-np.sin(mid),np.cos(mid)])
        ax.plot([c[0]-t[0]*0.1,c[0]+t[0]*0.1],[c[1]-t[1]*0.1,c[1]+t[1]*0.1],color='k',lw=1.5)

def seg(ax,P,Q,lw=2.0): ax.plot([P[0],Q[0]],[P[1],Q[1]],color='k',lw=lw)
def lbl(ax,P,txt,dx,dy,fs=15): ax.text(P[0]+dx,P[1]+dy,txt,fontsize=fs,style='italic',ha='center',va='center')

def finish(ax,fn,xlim,ylim):
    ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.set_aspect('equal'); ax.axis('off')
    plt.savefig(fn,bbox_inches='tight',pad_inches=0.08,dpi=200); plt.close()

# ---- P1 SSS: AB≅DC, AC≅DB, shared BC ; prove △ABC≅△DCB ----
fig,ax=plt.subplots(figsize=(3.1,2.4))
B=(0,0);C=(4,0);A=(1,2.2);D=(3,-2.2)
for P,Q in [(A,B),(A,C),(B,C),(D,C),(D,B)]: seg(ax,P,Q)
ticks(ax,A,B,1); ticks(ax,D,C,1)         # pair 1
ticks(ax,A,C,2); ticks(ax,D,B,2)         # pair 2
lbl(ax,A,'A',0,0.3); lbl(ax,B,'B',-0.3,-0.25); lbl(ax,C,'C',0.32,-0.1); lbl(ax,D,'D',0,-0.32)
finish(ax,'diag1.png',(-0.8,4.8),(-2.9,2.9))

# ---- P2 SSS midpoint: WX≅YX, Z midpoint WY ; prove △WXZ≅△YXZ ----
fig,ax=plt.subplots(figsize=(3.1,2.4))
W=(0,2);Y=(0,-2);Z=(0,0);X=(3.2,0)
for P,Q in [(W,X),(Y,X),(W,Y),(X,Z)]: seg(ax,P,Q)
ticks(ax,W,X,1); ticks(ax,Y,X,1)         # WX≅YX
ticks(ax,W,Z,2); ticks(ax,Y,Z,2)         # midpoint
ticks(ax,X,Z,3)                           # reflexive shared
lbl(ax,W,'W',-0.3,0.22); lbl(ax,Y,'Y',-0.3,-0.22); lbl(ax,Z,'Z',-0.33,0); lbl(ax,X,'X',0.32,0)
finish(ax,'diag2.png',(-0.9,3.9),(-2.7,2.7))

# ---- P3 SAS angle bisector: QP≅QR, QS bisects ∠PQR ; prove △PQS≅△RQS ----
fig,ax=plt.subplots(figsize=(3.1,2.4))
Q=(0,0);P=(3,2);R=(3,-2);S=(3.5,0)
for a,b in [(Q,P),(Q,R),(Q,S),(P,S),(R,S)]: seg(ax,a,b)
ticks(ax,Q,P,1); ticks(ax,Q,R,1)          # QP≅QR
angle_mark(ax,Q,P,S,r=0.6); angle_mark(ax,Q,R,S,r=0.6)
lbl(ax,P,'P',0.05,0.3); lbl(ax,R,'R',0.05,-0.3); lbl(ax,Q,'Q',-0.33,0); lbl(ax,S,'S',0.3,0.05)
finish(ax,'diag3.png',(-0.8,4.3),(-2.6,2.6))

# ---- P4 SAS vertical angles: JL & KM bisect each other at N ; prove △JNK≅△LNM ----
fig,ax=plt.subplots(figsize=(3.1,2.4))
N=(0,0);J=(-2,1.6);L=(2,-1.6);K=(-2,-1.2);M=(2,1.2)
for a,b in [(J,L),(K,M),(J,K),(L,M)]: seg(ax,a,b)
ticks(ax,N,J,2); ticks(ax,N,L,2)          # JN≅LN
ticks(ax,N,K,1); ticks(ax,N,M,1)          # KN≅MN
angle_mark(ax,N,J,K,r=0.5); angle_mark(ax,N,L,M,r=0.5)
lbl(ax,J,'J',-0.33,0.18); lbl(ax,K,'K',-0.33,-0.18); lbl(ax,L,'L',0.33,-0.18); lbl(ax,M,'M',0.33,0.18); lbl(ax,N,'N',0.0,0.3,fs=13)
finish(ax,'diag4.png',(-2.9,2.9),(-2.3,2.3))
print("diagrams done")
