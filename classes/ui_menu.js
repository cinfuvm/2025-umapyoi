// =========================
// classes/ui_menu.js
// =========================
function ScreenMenu(){ 
    this.idx=0; 
    this.opts=['Iniciar juego','Ver scores']; 
}

ScreenMenu.prototype.update=function(){
    if(btnp(0)) this.idx=(this.idx+1)%2;
    if(btnp(1)) this.idx=(this.idx+1)%2;
    
    if(btnp(4) || btnp(6)){
        if(this.idx===0){ 
            model.bank = 1000;
            pmem(0, 1000);
            model.resetRaceOnly(); 
            scene=bet; 
        }
        else if(this.idx===1){ 
            scores=new ScreenScores(); 
            scene=scores; 
        }
    }
};

ScreenMenu.prototype.draw=function(){ 
    cls(0); 

    print('HORSERACE', 85, 31, 0);
    print('HORSERACE', 84, 30, 7); 

    for(var i=0;i<2;i++){
        var y=65+i*14; 
        var c=(i===this.idx)?14:7; 
        print((i===this.idx?'> ':' ')+this.opts[i], 70, y, c); 
    } 
    
    print('A/START: Seleccionar', 24, H-12, 6); 
};