// =========================
// ui_bet.js — escena BET (pantalla dedicada)
// =========================
var CHIP_VALS=[100,500,1000,5000];
function ScreenBet(m){ this.m=m; this.active=100; }
ScreenBet.prototype.update=function(){
  updMouse();
  var cx=LAY.margin;
  for(var i=0;i<CHIP_VALS.length;i++){
    var v=CHIP_VALS[i];
    if(hit(cx,LAY.chipRowY-10,36,14)&&M.lp) this.active=v;
    cx+=40;
  }
  for(var s=0;s<4;s++){
    var sx=LAY.margin+s*(LAY.betSuitW+8), sy=LAY.betSuitY;
    if(hit(sx-2,sy,LAY.betSuitW+4,LAY.betSuitH) && M.lp) this.m.placeBet(s,this.active);
  }

  if(this.m.bank<=0 && this.m.betsTotal()===0){
    this.m.winner=-1;
    this.m.commitBest();
    scene=finish;
  }

  if(btnp(4)) {
    this.m.startRace();
    scene=race;
  }
  if(btnp(5)) this.m.refundBets();
  if(btnp(6)) {
    this.m.refundBets();
    this.m.resetRaceOnly();
  }
};
ScreenBet.prototype.draw=function(){ cls(0); print("HORSE RACE — Apuestas",8,8,7); print("Banco:"+(this.m.bank|0), W-80,8,7); for(var s=0;s<4;s++){ var sx=LAY.margin+s*(LAY.betSuitW+8), sy=LAY.betSuitY; rectb(sx,sy,LAY.betSuitW,LAY.betSuitH,SUIT_COL[s]); print(SUIT_LET[s], sx+LAY.betSuitW/2-3, sy+6, SUIT_COL[s]); var v=this.m.bets[s]||0; if(v>0) print(v, sx+6, sy+LAY.betSuitH-10, 7); } var cx=LAY.margin; for(var i=0;i<CHIP_VALS.length;i++){ var v=CHIP_VALS[i]; var sel=(this.active===v); rectb(cx,LAY.chipRowY-10,36,14, sel?14:6); print(v,cx+6,LAY.chipRowY-8, sel?14:7); cx+=40; } print("A Empezar B Devolver START Reset",8,H-10,6); print("Multiplicadores ocultos (2..5)",8,20,6); };

