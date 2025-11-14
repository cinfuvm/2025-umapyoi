// =========================
// ui_finish.js — escena FINISH
// =========================
function ScreenFinish(m){ this.m=m; }
ScreenFinish.prototype.update=function(){ if(btnp(4)||btnp(6)){ this.m.resetRaceOnly(); scene=bet; } };
ScreenFinish.prototype.draw=function(){
  cls(0);
  rect(50,44,140,48,0);
  rectb(50,44,140,48,12);

  if(this.m.winner>=0){
    var t='GANADOR '+SUIT_LET[this.m.winner];
    print(t,84,52,SUIT_COL[this.m.winner]);
  }else{
    print('GAME OVER', 92, 52, 14);
  }

  var bankT='BANCO '+(this.m.bank|0)+'  BEST '+(pmem(1)|0);
  print(bankT,70,64,7);
  print('A/START: Nueva apuesta',70,76,6);
};



// =========================
// escenas y TIC
// =========================
var model=null, bet=null, race=null, finish=null, scene=null;
function init(){ model=new RaceModel(); bet=new ScreenBet(model); race=new ScreenRace(model); finish=new ScreenFinish(model); scene=bet; }
init();
function TIC(){ scene.update(); scene.draw(); }