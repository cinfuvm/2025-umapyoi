// =========================
// classes/caballo.js
// =========================
function Caballo(suit,laneY,startX,dx){ this.suit=suit; this.laneY=laneY; this.startX=startX; this.dx=dx; this.pos=0; this.shakeT=0; }
Caballo.prototype.reset=function(){ this.pos=0; this.shakeT=0; };
Caballo.prototype.x=function(){ return (this.startX+this.pos*this.dx)|0; };
Caballo.prototype.draw=function(){ var x=this.x(), y=this.laneY, c=SUIT_COL[this.suit]; circ(x,y,5,c); print(SUIT_LET[this.suit],x-2,y-4,7); if(this.shakeT>0){ line(x-6,y+6,x+6,y+6,13); this.shakeT--; } };