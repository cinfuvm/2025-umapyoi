// =========================
// classes/ui_menu.js
// =========================
function ScreenMenu(){ 
    this.idx=0; 
    this.opts=['Iniciar juego','Ver scores']; 
    
    this.scrollX = 0; 
    this.scrollSpeed = 2; 
    
    this.menuHorses = [ 
        new Caballo(0, 80,  W/2 - 40, 0), 
        new Caballo(1, 90,  W/2 - 10, 0),
        new Caballo(2, 100, W/2 + 20, 0),
        new Caballo(3, 110, W/2 + 50, 0) 
    ];
    
    playMus(MUS_MENU);
}

ScreenMenu.prototype.update=function(){

    updMouse();

    this.scrollX = (this.scrollX + this.scrollSpeed) % 240;
    for(var i=0; i<this.menuHorses.length; i++){ 
        var h = this.menuHorses[i]; 
        h.animTimer = this.scrollX; 
        h.pos = 1; 
    }

    var trigger = false;

    if(btnp(0)){ this.idx=(this.idx+1)%2; sfx(SND_NAV, -1, 4, -1, 8); }
    if(btnp(1)){ this.idx=(this.idx+1)%2; sfx(SND_NAV, -1, 4, -1, 8); }
    if(btnp(4) || btnp(6)) trigger = true;

    for(var i=0; i<2; i++){

        var yText = 70 + i*14; 

        if(hit(60, yText, 120, 10)){

            if(this.idx !== i){
                this.idx = i;
                sfx(SND_NAV, -1, 4, -1, 8);
            }

            if(M.lp){
                trigger = true;
            }
        }
    }

    if(trigger){
        sfx(SND_SEL, -1, 20, -1, 10);
        
        if(this.idx===0){ 
            model.bank = 1000; 
            pmem(0, 1000); 
            model.resetRaceOnly(); 
            scene = new ScreenBet(model); 
        }
        else if(this.idx===1){ 
            scores = new ScreenScores(); 
            scene = scores; 
        }
    }
};

ScreenMenu.prototype.draw=function(){ 
    cls(0); 
    map(0, 51, 30, 17, -this.scrollX, 0, -1); 
    map(0, 51, 30, 17, -this.scrollX + 240, 0, -1);
    
    for(var i=0; i<this.menuHorses.length; i++){ 
        this.menuHorses[i].draw(false, false); 
    }
    
    spr(144, 56, 25, 0, 1, 0, 0, 16, 3); // Titulo
    
    for(var i=0;i<2;i++){
        var y=70+i*14; 
        var c=(i===this.idx)?14:7; 
        var txt = (i===this.idx?'> ':' ')+this.opts[i];
        
        print(txt, 70-1, y, 0); 
        print(txt, 70+1, y, 0); 
        print(txt, 70, y-1, 0); 
        print(txt, 70, y+1, 0);
        
        print(txt, 70, y, c); 
    } 
    
    var yKeys = H-18;
    spr(KEY_Z, 81, yKeys, 0, 1, 0, 0, 2, 2);
    
    var selTxt = "Seleccionar";
    print(selTxt, 99-1, yKeys+5, 0); 
    print(selTxt, 99+1, yKeys+5, 0); 
    print(selTxt, 99, yKeys+4, 0); 
    print(selTxt, 99, yKeys+6, 0);
    print(selTxt, 99, yKeys+5, 6);
};