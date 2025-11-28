// =========================
// classes/ui_finish.js
// =========================
function ScreenFinish(m){ this.m=m; }

ScreenFinish.prototype.update=function(){
    if(this.m.bank <= 0){
        if(btnp(4) || btnp(6)){
            this.m.bank = 1000;
            pmem(0, 1000);
            this.m.resetRaceOnly();
            scene = menu;
        }
    }
    else {
        if(btnp(4)){
            this.m.resetRaceOnly(); 
            scene=bet;              
        }


        if(btnp(6)){
            var finalScore = this.m.bank;
            if(hs_qualify(finalScore)){
                nameEntry = new ScreenName(finalScore);
                scene = nameEntry;
            } else {
                this.m.bank = 1000; 
                pmem(0, 1000);
                this.m.resetRaceOnly();
                scene = menu;
            }
        }
    }
};

ScreenFinish.prototype.draw=function(){ 
    cls(0); 
    
    var centerX = 120;

    rect(50, 20, 140, 96, 0); 
    rectb(50, 20, 140, 96, 12);
    
    var bankT='BANCO '+ (this.m.bank|0) +'  BEST '+(pmem(1)|0); 
    var w2=print(bankT,0,-6,0,true,1,true);
    print(bankT,(W-w2)/2, 26, 7, false, 1, true);
    
    if(this.m.winner>=0){ 
        
        var txt = "GANADOR";
        var wTxt = print(txt, 0, -10, 0); 
        print(txt, centerX - (wTxt/2), 38, 14);
        
        var iconId = ICON_IDS[this.m.winner];
        spr(iconId, centerX - 4, 48, 0, 1, 0, 0, 1, 1);
        var winnerHorse = this.m.caballos[this.m.winner];
        var oldX = winnerHorse.startX;
        var oldY = winnerHorse.laneY;
        
        winnerHorse.startX = centerX - (winnerHorse.pos * winnerHorse.dx);
        winnerHorse.laneY = 65;
        
        winnerHorse.draw(true, true); 
        
        winnerHorse.startX = oldX;
        winnerHorse.laneY = oldY;
        
    } else { 
        print('GAME OVER', 92, 50, 14); 
    } 
    
    if(this.m.bank <= 0){
        var txt1 = "¡BANCARROTA!";
        var w1 = print(txt1,0,-10,0);
        print(txt1, centerX - (w1/2), 80, 2);
        
        var txt2 = "START: Salir al Menú";
        var w2 = print(txt2,0,-10,0,false,1,true);
        print(txt2, centerX - (w2/2), 100, 6, false, 1, true);
    } else {
        var txtA = "A: Seguir Jugando";
        var wA = print(txtA,0,-10,0,false,1,true);
        print(txtA, centerX - (wA/2), 90, 6, false, 1, true);
        
        var txtS = "START: Retirarse";
        var wS = print(txtS,0,-10,0,false,1,true);
        print(txtS, centerX - (wS/2), 100, 13, false, 1, true);
    }
};