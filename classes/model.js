// =========================
// classes/model.js — estado del juego
// =========================
function RaceModel(){
this.startX=LAY.trackX0; this.finishX=LAY.trackX1; this.dx=((this.finishX-this.startX)/LINKS);
this.ys=[LAY.yTop,LAY.yTop+LAY.yGap,LAY.yTop+LAY.yGap*2,LAY.yTop+LAY.yGap*3];
this.caballos=[ new Caballo(0,this.ys[0],this.startX,this.dx), new Caballo(1,this.ys[1],this.startX,this.dx), new Caballo(2,this.ys[2],this.startX,this.dx), new Caballo(3,this.ys[3],this.startX,this.dx) ];
this.bank=pmem(0)|0; if(this.bank<=0) this.bank=1000; this.bets=[0,0,0,0]; this.mults=[0,0,0,0];
this.lineSuits=[null]; this.lineRevealed=[false,false,false,false,false,false,false,false,false];
this.deckRace=new Mazo(); this.deckLine=new Mazo(); for(var l=1;l<=LINE_CARDS;l++){ var c=this.deckLine.tomar(); this.lineSuits[l]=c?c.s:rndi(4);}
this.lastCard=null; this.flips=0; this.winner=-1;
}
RaceModel.prototype.resetRaceOnly=function(){ for(var i=0;i<4;i++) this.caballos[i].reset(); this.lineRevealed=[false,false,false,false,false,false,false,false,false]; this.deckRace=new Mazo(); this.deckLine=new Mazo(); for(var l=1;l<=LINE_CARDS;l++){ var c=this.deckLine.tomar(); this.lineSuits[l]=c?c.s:rndi(4);} this.lastCard=null; this.flips=0; this.winner=-1; this.mults=[0,0,0,0]; };
RaceModel.prototype.placeBet=function(suit,amount){ if(amount>0&&this.bank>=amount){ this.bets[suit]+=amount; this.bank-=amount; pmem(0,this.bank|0);} };
RaceModel.prototype.refundBets=function(){ var tot=0; for(var s=0;s<4;s++){ tot+=this.bets[s]; this.bets[s]=0; } this.bank+=tot; pmem(0,this.bank|0); };
RaceModel.prototype.startRace=function(){ for(var i=0;i<4;i++) this.mults[i]=2+rndi(4); };
RaceModel.prototype.stepFlip=function(){ if(this.deckRace.vacio()) return; var c=this.deckRace.tomar(); this.lastCard=c; this.flips++; var s=c.s; var h=this.caballos[s]; h.pos=clamp(h.pos+1,0,LINKS); for(var l=1;l<=LINE_CARDS;l++){ if(!this.lineRevealed[l]){ var all=true; for(var j=0;j<4;j++){ if(this.caballos[j].pos<l){ all=false; break; } } if(all){ this.lineRevealed[l]=true; var sb=this.lineSuits[l]; var hb=this.caballos[sb]; if(hb.pos>0){ hb.pos--; hb.shakeT=10; } break; } } } for(var k=0;k<4;k++){ if(this.caballos[k].pos>=LINKS){ this.winner=k; return; } } };
RaceModel.prototype.finishRace=function(){ var win=this.winner; var payout=(this.bets[win]||0)*(this.mults[win]||0); if(payout>0) this.bank+=payout; this.bets=[0,0,0,0]; var best=pmem(1)|0; if(this.bank>best) pmem(1,this.bank|0); pmem(0,this.bank|0); };
RaceModel.prototype.betsTotal=function(){
  var t=0; for(var i=0;i<4;i++) t+=this.bets[i];
  return t;
};
RaceModel.prototype.commitBest=function(){
  var best=pmem(1)|0;
  if(this.bank>best) pmem(1,this.bank|0);
  pmem(0,this.bank|0);
};