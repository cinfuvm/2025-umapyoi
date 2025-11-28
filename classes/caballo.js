// =========================
// classes/caballo.js
// =========================

function Caballo(suit,laneY,startX,dx){ 
    this.suit=suit; 
    this.laneY=laneY; 
    this.startX=startX; 
    this.dx=dx; 
    this.pos=0; 
    this.shakeT=0; 
    this.animTimer = 0;
    this.danceTimer = 0;
}

Caballo.prototype.reset=function(){ 
    this.pos=0; 
    this.shakeT=0; 
    this.animTimer=0;
    this.danceTimer=0;
};

Caballo.prototype.x=function(){ 
    return (this.startX+this.pos*this.dx)|0; 
};

Caballo.prototype.draw=function(isWinner, hideIcon){ 
    var x=this.x(), y=this.laneY; 
    var spriteId = 304; 
    
    if(isWinner){
        this.danceTimer++;
        var frame = (this.danceTimer / 10 | 0) % 5;
        var danceFrames = [313, 352, 355, 358, 361];
        spriteId = danceFrames[frame];
    }
    else if(this.shakeT > 0 || (this.pos > 0 && this.pos < LINKS)){
        this.animTimer++;
        var frame = (this.animTimer / 8 | 0) % 2;
        var runFrames = [307, 310];
        spriteId = runFrames[frame];
    } 
    
    spr(spriteId, x-8, y-8, 0, 1, 0, 0, 2, 2);
    
    if(!hideIcon){
        var ICON_IDS = [258, 256, 260, 262];
        spr(ICON_IDS[this.suit], x-4, y-14, 0, 1, 0, 0, 1, 1);
    }
    
    if(this.shakeT>0){ this.shakeT--; } 
};