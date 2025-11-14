// =========================
// classes/mazo.js
// =========================
function Mazo(){ this.cartas=[]; for(var s=0;s<4;s++){ for(var r=1;r<=13;r++) this.cartas.push({s:s,r:r}); } this.barajar(); }
Mazo.prototype.barajar=function(){ for(var i=this.cartas.length-1;i>0;i--){ var j=(rnd()*(i+1))|0; var t=this.cartas[i]; this.cartas[i]=this.cartas[j]; this.cartas[j]=t; } };
Mazo.prototype.tomar=function(){ return this.cartas.pop(); };
Mazo.prototype.vacio=function(){ return this.cartas.length<=0; };