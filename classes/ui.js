// =========================
// classes/ui.js
// =========================

// IDs CONFIGURADOS:
var CARD_IDS = [400, 403, 406, 409];
var ICON_IDS = [258, 256, 260, 262];
var LINE_IDS = [464, 467, 470, 473];

function UI(){ this.msgTimer=0; this.msg=""; }

UI.prototype.drawTrack=function(startX,finishX,ys){
    rectb(startX-8, ys[0]-14, (finishX-startX)+16, (ys[3]-ys[0])+28, 6);
    for(var i=0;i<ys.length;i++) line(startX-3,ys[i],finishX+3,ys[i],5);
};

UI.prototype.drawGrid=function(startX,finishX,dx,ys){
    for(var k=0;k<=LINKS;k++){
        var x=(startX+k*dx)|0; var col=(k===LINKS)?14:6;
        for(var yy=ys[0]-12; yy<=ys[3]+12; yy+=4) pix(x,yy,col);
    }
};

UI.prototype.drawLineCards=function(startX,dx,ys,lineRevealed,lineSuits){
    for(var l=1;l<=LINE_CARDS;l++){
        var x=(startX+l*dx)|0; var y=LAY.lineCardsY;
        
        rectb(x-7, y-10, 14, 20, 3);
        
        if(lineRevealed[l]){ 
            var s=lineSuits[l]; 
            spr(LINE_IDS[s], x-8, y-8, 0, 1, 0, 0, 2, 2);
        } else {
            rect(x-6, y-9, 12, 18, 1);
        }
    }
};

UI.prototype.hudTop=function(){
};

UI.prototype.hudFinish=function(winner,bank,best){
    rect(50,30,140,85,0); 
    rectb(50,30,140,85,12);
};

UI.prototype.drawLastCard=function(card){
    var cx=LAY.drawCardX, cy=LAY.drawCardY;
    
    rect(cx-9, cy-13, 18, 26, 0); 
    rectb(cx-9, cy-13, 18, 26, 6); 
    
    if(!card) return;
    
    spr(CARD_IDS[card.s], cx-8, cy-12, 0, 1, 0, 0, 2, 3);
};

UI.prototype.chipRow=function(activeChip){
    var cx=LAY.M; for(var i=0;i<CHIP_VALS.length;i++){ var v=CHIP_VALS[i]; var sel=(activeChip===v);
    rectb(cx,LAY.chipRowY-9,28,12, sel?14:6);
    print(v,cx+4,LAY.chipRowY-8, sel?14:7,false,1,true); cx+=32; }
    print("A: Empezar X: Devolver", 110,LAY.chipRowY-8,6,false,1,true);
};

UI.prototype.bankInfo=function(bank){ print("BANCO:"+fmt(bank), W-70, LAY.chipRowY-8,7,false,1,true); };

UI.prototype.betBadges=function(startX,ys,bets){
    for(var s=0;s<4;s++){
        var y=ys[s]; 
        spr(ICON_IDS[s], startX-12, y-4, 0, 1, 0, 0, 1, 1);
        var v=bets[s]||0; 
        if(v>0) print(v,startX-12,y+6,7,false,1,true);
    }
};

UI.prototype.multAtFinish=function(finishX,ys,mults,visible){
    if(!visible) return; for(var s=0;s<4;s++){ print('x'+mults[s], finishX+6, ys[s]-4, SUIT_COL[s], false,1,true); }
};

UI.prototype.mensaje=function(t){ this.msg=t; this.msgTimer=90; };

UI.prototype.drawMsg=function(){ if(this.msgTimer>0){ var w=print(this.msg,0,-6,0,true,1,true); rect((W-w)/2-4, H-16, w+8, 10, 0); print(this.msg,(W-w)/2, H-14, 12,false,1,true); this.msgTimer--; } };