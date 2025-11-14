// =========================
// main.js
// =========================
function init(){
model=new RaceModel();
bet=new ScreenBet(model);
race=new ScreenRace(model);
finish=new ScreenFinish(model);
scene=bet;
}
init();
function TIC(){ scene.update(); scene.draw(); }