// =========================
// classes/caballo.js
// =========================

function Caballo(suit,laneY,startX,dx){ 
    this.suit=suit; 
    this.laneY=laneY; 
    this.startX=startX; 
    this.dx=dx; 
    this.pos=0; 

    this.animTimer = 0;
    this.danceTimer = 0;
    
    this.shakeT=0; 
    this.isStunned=false; 
    this.poofT=0;       
}

Caballo.prototype.reset=function(){ 
    this.pos=0; 
    this.shakeT=0; 
    this.animTimer=0;
    this.danceTimer=0;
    this.isStunned=false;
    this.poofT=0;
};

Caballo.prototype.x=function(){ 
    return (this.startX+this.pos*this.dx)|0; 
};

Caballo.prototype.draw=function(isWinner, hideIcon){ 
    var x=this.x(), y=this.laneY; 
    var spriteId = 304; 

    if(this.isStunned){
        this.animTimer++;
        var frame = (this.animTimer / 12 | 0) % 2;
        spriteId = SPR_STUN[frame];
    }

    else if(isWinner){
        this.danceTimer++;
        var frame = (this.danceTimer / 10 | 0) % 5;
        var danceFrames = [313, 352, 355, 358, 361];
        spriteId = danceFrames[frame];
    }
    else if(this.pos > 0 && this.pos < LINKS){
        this.animTimer++;
        var frame = (this.animTimer / 8 | 0) % 2;
        var runFrames = [307, 310];
        spriteId = runFrames[frame];
    } 

    var BODY_COLS = [13, 2, 4, 11]; 
    
    if(typeof pal === 'function') pal(12, BODY_COLS[this.suit]);

    spr(spriteId, x-8, y-8, 0, 1, 0, 0, 2, 2);
    
    if(typeof pal === 'function') pal(); 

    if(this.poofT > 0){
        var poofFrame = 2 - (this.poofT / 8 | 0);
        poofFrame = clamp(poofFrame, 0, 2);

        spr(SPR_POOF[poofFrame], x-8, y-8, 0, 1, 0, 0, 2, 2);
        
        this.poofT--;
    }
    
    if(!hideIcon){
        var ICON_IDS = [258, 256, 260, 262];
        if(typeof pal === 'function'){
            pal(14, BODY_COLS[this.suit]); 
            pal(15, BODY_COLS[this.suit]);
            pal(0, BODY_COLS[this.suit]);
            pal(2, BODY_COLS[this.suit]); 
        }
        spr(ICON_IDS[this.suit], x-4, y-14, 0, 1, 0, 0, 1, 1);
        if(typeof pal === 'function') pal();
    }
};