// =========================
// ui_bet.js
// =========================
function ScreenBet(m){ this.m=m; this.active=100; this.clickCD=0; }

ScreenBet.prototype.update=function(){
    updMouse(); if(this.clickCD>0) this.clickCD--; 
    
    var cx=LAY.margin; 
    for(var i=0;i<CHIP_VALS.length;i++){ 
        var v=CHIP_VALS[i]; 
        if(hit(cx,LAY.chipRowY-10,36,14)&&M.lp) this.active=v; 
        cx+=40; 
    }

    for(var s=0;s<4;s++){
        var sx=LAY.margin+s*(LAY.betSuitW+8), sy=LAY.betSuitY;
        var hx=sx-3, hy=sy-3, hw=LAY.betSuitW+6, hh=LAY.betSuitH+6; 
        if((M.lp || (M.l && this.clickCD===0)) && hit(hx,hy,hw,hh)){
            this.m.placeBet(s,this.active); this.clickCD=6;
        }
    }
    if(btnp(4)) { this.m.startRace(); scene=race; }
    if(btnp(5)) { this.m.refundBets(); }
    if(btnp(6)) { this.m.refundBets(); this.m.resetRaceOnly(); scene=menu; }
    
    if(this.m.bank<=0 && this.m.betsTotal()===0){ this.m.winner=-1; this.m.commitBest(); scene=finish; }
};

ScreenBet.prototype.draw=function(){ 
    cls(0); 
    print("APUESTAS",8,8,7); 
    print("Banco:"+(this.m.bank|0), W-80,8,7); 
    
    var CARD_IDS = [400, 403, 406, 409]; 

    for(var s=0;s<4;s++){ 
        var sx=LAY.margin+s*(LAY.betSuitW+8), sy=LAY.betSuitY; 
        
        var boxW = 18; var boxH = 26;
        var bx = sx + (LAY.betSuitW - boxW)/2;
        var by = sy + (LAY.betSuitH - boxH)/2;

        rect(bx, by, boxW, boxH, 1); 
        rectb(bx, by, boxW, boxH, ink(s)); 
        
        spr(CARD_IDS[s], bx+1, by+1, 0, 1, 0, 0, 2, 3);
        
        var v=this.m.bets[s]||0; 
        if(v>0) print(v, sx+4, sy+LAY.betSuitH-2, 7); 
    } 
    
    var cx=LAY.margin; 
    for(var i=0;i<CHIP_VALS.length;i++){ 
        var v=CHIP_VALS[i]; 
        var sel=(this.active===v); 
        rectb(cx,LAY.chipRowY-10,36,14, sel?14:6); 
        print(v,cx+6,LAY.chipRowY-8, sel?14:7); 
        cx+=40; 
    } 
    print("A Empezar  START Salir",8,H-10,6); 
};