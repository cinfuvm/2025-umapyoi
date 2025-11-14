// =========================
// classes/carrera.js
// =========================
function Carrera(){
this.state='BET';
this.startX=LAY.trackX0; this.finishX=LAY.trackX1;
this.dx=((this.finishX-this.startX)/LINKS);
this.ys=[LAY.yTop, LAY.yTop+LAY.yGap, LAY.yTop+LAY.yGap*2, LAY.yTop+LAY.yGap*3];


this.ui=new UI();


// Caballos
this.caballos=[
new Caballo(0,this.ys[0],this.startX,this.dx),
new Caballo(1,this.ys[1],this.startX,this.dx),
new Caballo(2,this.ys[2],this.startX,this.dx),
new Caballo(3,this.ys[3],this.startX,this.dx)
];


// Apuestas
this.bank = pmem(0)|0; if(this.bank<=0) this.bank=1000;
this.bets=[0,0,0,0]; this.activeChip=100; this.mults=[0,0,0,0];


// Línea de retrocesos
this.lineSuits=[null];
this.lineRevealed=[false,false,false,false,false,false,false,false,false];


// Mazos
this.deck
=new Mazo(); this.deckLine=new Mazo();
for(var l=1;l<=LINE_CARDS;l++){ var c=this.deckLine.tomar(); this.lineSuits[l]=c?c.s:rndi(4); }


this.flips=0; this.auto=false; this.autoTimer=0; this.winner=-1; this.lastCard=null;
}


Carrera.prototype.resetToBet=function(){
for(var i=0;i<this.caballos.length;i++) this.caballos[i].reset();
this.lineRevealed=[false,false,false,false,false,false,false,false,false];
this.deckRace=new Mazo(); this.deckLine=new Mazo();
for(var l=1;l<=LINE_CARDS;l++){ var c=this.deckLine.tomar(); this.lineSuits[l]=c?c.s:rndi(4); }
this.flips=0; this.auto=false; this.autoTimer=0; this.winner=-1; this.lastCard=null; this.state='BET'; this.mults=[0,0,0,0];
};


Carrera.prototype.startRace=function(){
var total=0; for(var s=0;s<4;s++) total+=this.bets[s]; if(total>0){ this.bank-=total; }
for(var s2=0;s2<4;s2++) this.mults[s2]=2 + rndi(4);
pmem(0,this.bank|0); this.state='RACE';
};

Carrera.prototype.toggleAuto=function(){ this.auto=!this.auto; this.ui.mensaje(this.auto?'Auto ON':'Auto OFF'); };
Carrera.prototype.tryPlaceBet=function(suit){ var v=this.activeChip|0; if(v>0 && this.bank>=v){ this.bets[suit]+=v; this.bank-=v; pmem(0,this.bank|0);} };
Carrera.prototype.refundBets=function(){ var total=0; for(var s=0;s<4;s++){ total+=this.bets[s]; this.bets[s]=0; } this.bank+=total; pmem(0,this.bank|0); };


Carrera.prototype.stepFlip=function(){
if(this.state!=='RACE' || this.deckRace.vacio()) return;
var c=this.deckRace.tomar(); this.lastCard=c; this.flips++;
var s=c.s; var h=this.caballos[s]; h.pos=clamp(h.pos+1,0,LINKS);
for(var l=1;l<=LINE_CARDS;l++){
if(!this.lineRevealed[l]){ var all=true; for(var i=0;i<4;i++){ if(this.caballos[i].pos<l){ all=false; break; } }
if(all){ this.lineRevealed[l]=true; var sb=this.lineSuits[l]; var hb=this.caballos[sb]; if(hb.pos>0){ hb.pos--; hb.shakeT=10; this.ui.mensaje('Linea '+l+': '+SUIT_LET[sb]+' -1'); } break; }
}
}
for(var j=0;j<4;j++){ if(this.caballos[j].pos>=LINKS){ this.winner=j; this.finishRace(); break; } }
};


Carrera.prototype.finishRace=function(){
this.state='FINISH'; var win=this.winner; var payout=(this.bets[win]||0) * (this.mults[win]||0); if(payout>0){ this.bank+=payout; }
this.bets=[0,0,0,0]; var best=pmem(1)|0; if(this.bank>best){ pmem(1,this.bank|0); }
};


Carrera.prototype.update=function(){
updMouse();
if(this.state==='BET'){
var cx=LAY.M; for(var i=0;i<CHIP_VALS.length;i++){ var v=CHIP_VALS[i]; if(hit(cx,LAY.chipRowY-9,28,12) && M.lp) this.activeChip=v; cx+=32; }
for(var s=0;s<4;s++){ var y=this.ys[s]; if(hit(this.startX-14,y-7,18,12) && M.lp) this.tryPlaceBet(s); }
if(btnp(4)) this.startRace();
if(btnp(5)) this.refundBets();
}else if(this.state==='RACE'){
if(btnp(4)) this.stepFlip();
if(btnp(5)) this.toggleAuto();
if(btnp(6)) { this.refundBets(); this.resetToBet(); }
if(this.auto){ this.autoTimer++; if(this.autoTimer>18){ this.stepFlip(); this.autoTimer=0; } }
}else if(this.state==='FINISH'){
if(btnp(6) || btnp(4)) this.resetToBet();
}
};

Carrera.prototype.draw=function(){
cls(0);
this.ui.hudTop(this.flips,this.auto);
this.ui.drawTrack(this.startX,this.finishX,this.ys);
this.ui.drawGrid(this.startX,this.finishX,this.dx,this.ys);
this.ui.drawLineCards(this.startX,this.dx,this.ys,this.lineRevealed,this.lineSuits);
for(var i=0;i<this.caballos.length;i++) this.caballos[i].draw();


if(this.state==='BET'){
this.ui.betBadges(this.startX,this.ys,this.bets);
this.ui.chipRow(this.activeChip);
this.ui.bankInfo(this.bank);
} else if(this.state==='RACE'){
this.ui.multAtFinish(this.finishX,this.ys,this.mults,true);
this.ui.drawLastCard(this.lastCard);
} else if(this.state==='FINISH'){
this.ui.multAtFinish(this.finishX,this.ys,this.mults,true);
this.ui.drawLastCard(this.lastCard);
this.ui.hudFinish(this.winner,this.bank|0, pmem(1)|0);
}


this.ui.drawMsg();
};