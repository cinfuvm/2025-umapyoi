// =========================
// classes/ui.js
// =========================
function UI(){ this.msgTimer=0; this.msg=""; }
UI.prototype.drawTrack=function(startX,finishX,ys){
rectb(startX-8, ys[0]-14, (finishX-startX)+16, (ys[3]-ys[0])+28, 6);
for(var i=0;i<ys.length;i++) line(startX-3,ys[i],finishX+3,ys[i],5);
};
UI.prototype.drawGrid=function(startX,finishX,dx,ys){
for(var k=0;k<=LINKS;k++){
var x=(startX+k*dx)|0; var col=(k===LINKS)?14:6;
for(var yy=ys[0]-12; yy<=ys[3]+12; yy+=4) pix(x,yy,col);
}
};
UI.prototype.drawLineCards=function(startX,dx,ys,lineRevealed,lineSuits){
for(var l=1;l<=LINE_CARDS;l++){
var x=(startX+l*dx)|0; var y=LAY.lineCardsY;
rectb(x-7,y-7,14,10,3);
if(lineRevealed[l]){ var s=lineSuits[l]; print(SUIT_LET[s],x-3,y-6,SUIT_COL[s],false,1,true); }
else rect(x-6,y-6,12,8,1);
}
};
UI.prototype.hudTop=function(flips,auto){
print("HORSE RACE",LAY.M,4,7,false,1,true);
var t1="FLIPS:"+flips; var t2=auto?"AUTO ON":"AUTO OFF";
print(t1, 100,4,7,false,1,true);
print(t2, 180,4, auto?11:13,false,1,true);
};
UI.prototype.hudFinish=function(winner,bank,best){
rect(70,44,100,40,0); rectb(70,44,100,40,12);
var t='GANADOR '+SUIT_LET[winner]; var w1=print(t,0,-6,0,true,1,true);
print(t,(W-w1)/2,52,SUIT_COL[winner]);
var bankT='BANCO '+bank+' BEST '+best; var w2=print(bankT,0,-6,0,true,1,true);
print(bankT,(W-w2)/2,64,7,false,1,true);
print('START/A: Nueva apuesta',(W-120)/2,76,6,false,1,true);
};
UI.prototype.drawLastCard=function(card){
if(!card) return;
var cx=120, cy=LAY.drawCardY; rectb(cx-11,cy-8,22,14,12);
print(SUIT_LET[card.s],cx-3,cy-6,SUIT_COL[card.s],false,1,true);
};
var CHIP_VALS=[100,500,1000,5000];
function fmt(n){ return n.toString(); }
UI.prototype.chipRow=function(activeChip){
var cx=LAY.M; for(var i=0;i<CHIP_VALS.length;i++){ var v=CHIP_VALS[i]; var sel=(activeChip===v);
rectb(cx,LAY.chipRowY-9,28,12, sel?14:6);
print(v,cx+4,LAY.chipRowY-8, sel?14:7,false,1,true); cx+=32; }
print("A: Empezar X: Devolver START: Reset", 110,LAY.chipRowY-8,6,false,1,true);
};
UI.prototype.bankInfo=function(bank){ print("BANCO:"+fmt(bank), W-70, LAY.chipRowY-8,7,false,1,true); };
UI.prototype.betBadges=function(startX,ys,bets){
for(var s=0;s<4;s++){
var y=ys[s]; rectb(startX-14,y-7,18,12,SUIT_COL[s]);
var v=bets[s]||0; print(SUIT_LET[s],startX-12,y-9,SUIT_COL[s],false,1,true);
if(v>0) print(v,startX-12,y-1,7,false,1,true);
}
};
UI.prototype.multAtFinish=function(finishX,ys,mults,visible){
if(!visible) return; for(var s=0;s<4;s++){ print('x'+mults[s], finishX+6, ys[s]-4, SUIT_COL[s], false,1,true); }
};
UI.prototype.mensaje=function(t){ this.msg=t; this.msgTimer=90; };
UI.prototype.drawMsg=function(){ if(this.msgTimer>0){ var w=print(this.msg,0,-6,0,true,1,true); rect((W-w)/2-4, H-16, w+8, 10, 0); print(this.msg,(W-w)/2, H-14, 12,false,1,true); this.msgTimer--; } };
