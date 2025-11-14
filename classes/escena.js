// =========================
// classes/escena.js (ES5)
// =========================
function Escena(){ this.game=new Carrera(); }
Escena.prototype.update=function(){ this.game.update(); };
Escena.prototype.draw=function(){ this.game.draw(); };