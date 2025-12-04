// title: Horserace
// author: Fay
// desc: Tripl3 Crown
// script: js
// saveid: horserace
// input: gamepad, mouse

// =========================
// header.js
// =========================
var W=240, H=136;

var LAY={
    M: W/2, 
    trackX0:10, 
    trackX1:180,  
    yTop:22,
    yGap:22,
    
    lineCardsY:110, 
    
    drawCardX: 224, 
    drawCardY: 60,
    
    betSuitY:60, betSuitW:44, betSuitH:32,
    chipRowY:116, margin:8
};

var KEY_Z = 412;
var KEY_X = 444;
var KEY_A = 476;

var KEY_RIGHT = 382;
var KEY_DOWN  = 414;
var KEY_UP    = 446;
var KEY_LEFT  = 478;

var SPR_POOF = [264, 266, 268]; 
var SPR_STUN = [316, 364];      

var CHIP_SPRITES = {
    100:  [2, 98, 34, 66],
    500:  [4, 100, 36, 68],
    1000: [6, 102, 38, 70],
    5000: [8, 104, 40, 72]
};

var LINKS=10; var LINE_CARDS=8;
var CHIP_VALS=[100,500,1000,5000];

var SUIT_COL=[0,2,4,11]; 
var SUIT_LET=['S','H','D','C'];

var __seed=(time()|0)^0x9e3779b9; function _imul(a,b){return (a*b)|0;}
function rnd(){ __seed=(_imul(__seed,1664525)+1013904223)|0; return ((__seed>>>0)/4294967296);}
function rndi(n){return (rnd()*n)|0;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}

function ink(s){ return (s===0)?14:SUIT_COL[s]; }
function fmt(n){ return n.toString(); }

function pal(c0, c1){
    if(c0 === undefined && c1 === undefined){
        for(var i=0; i<16; i++){ poke4(0x3FF0 * 2 + i, i); }
    } else { poke4(0x3FF0 * 2 + c0, c1); }
}

var M={x:0,y:0,l:false,_pl:false,lp:false};
function updMouse(){ var a=mouse(); M.x=a[0]|0; M.y=a[1]|0; M.l=!!a[2]; M.lp=M.l&&!M._pl; M._pl=M.l; }
function hit(x,y,w,h){ return M.x>=x&&M.y>=y&&M.x<x+w&&M.y<y+h; }

function hs_load(){
    var arr=[]; var base=10;
    for(var i=0;i<5;i++){
        var b=base+i*4; var sc=pmem(b)|0; var c1=pmem(b+1)|0, c2=pmem(b+2)|0, c3=pmem(b+3)|0;
        if(sc>0){ arr.push({score:sc,name:String.fromCharCode(c1||45,c2||45,c3||45)}); }
    }
    arr.sort(function(a,b){return b.score-a.score;});
    while(arr.length<5) arr.push({score:0,name:"---"});
    return arr;
}
function hs_save(arr){
    var base=10; for(var i=0;i<5;i++){
        var e=arr[i]||{score:0,name:"---"}; var b=base+i*4;
        pmem(b, e.score|0);
        var c1=(e.name&&e.name.length>0)?e.name.charCodeAt(0):45;
        var c2=(e.name&&e.name.length>1)?e.name.charCodeAt(1):45;
        var c3=(e.name&&e.name.length>2)?e.name.charCodeAt(2):45;
        pmem(b+1,c1|0); pmem(b+2,c2|0); pmem(b+3,c3|0);
    }
}
function hs_qualify(score){ var arr=hs_load(); return (score>arr[4].score)?true:false; }
function hs_insert(score,name){ var arr=hs_load(); arr.push({score:score,name:name}); arr.sort(function(a,b){return b.score-a.score;}); arr=arr.slice(0,5); hs_save(arr); } 
// =========================
// classes/mazo.js
// =========================
function Mazo(){ this.cartas=[]; for(var s=0;s<4;s++){ for(var r=1;r<=13;r++) this.cartas.push({s:s,r:r}); } this.barajar(); }
Mazo.prototype.barajar=function(){ for(var i=this.cartas.length-1; i>0; i--){ var j=(rnd()*(i+1))|0; var t=this.cartas[i]; this.cartas[i]=this.cartas[j]; this.cartas[j]=t; } };
Mazo.prototype.tomar=function(){ return this.cartas.pop(); };
Mazo.prototype.vacio=function(){ return this.cartas.length<=0; };

 
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
// =========================
// classes/model.js
// =========================
function RaceModel(){
    this.startX=LAY.trackX0; this.finishX=LAY.trackX1; this.dx=((this.finishX-this.startX)/LINKS);
    this.ys=[LAY.yTop,LAY.yTop+LAY.yGap,LAY.yTop+LAY.yGap*2,LAY.yTop+LAY.yGap*3];
    this.caballos=[ 
        new Caballo(0,this.ys[0],this.startX,this.dx), 
        new Caballo(1,this.ys[1],this.startX,this.dx), 
        new Caballo(2,this.ys[2],this.startX,this.dx), 
        new Caballo(3,this.ys[3],this.startX,this.dx) 
    ];
    this.bank=pmem(0)|0; if(this.bank<=0) this.bank=1000; 
    this.bets=[0,0,0,0]; this.mults=[0,0,0,0];
    this.lineSuits=[null]; 
    this.lineRevealed=[false,false,false,false,false,false,false,false,false];
    this.deckRace=new Mazo(); this.deckLine=new Mazo(); 
    for(var l=1;l<=LINE_CARDS;l++){ 
        var c=this.deckLine.tomar(); 
        this.lineSuits[l]=c?c.s:rndi(4);
    }
    this.lastCard=null; this.flips=0; this.winner=-1;
}

RaceModel.prototype.resetRaceOnly=function(){ 
    for(var i=0;i<4;i++) this.caballos[i].reset(); 
    this.lineRevealed=[false,false,false,false,false,false,false,false,false]; 
    this.deckRace=new Mazo(); this.deckLine=new Mazo(); 
    for(var l=1;l<=LINE_CARDS;l++){ 
        var c=this.deckLine.tomar(); 
        this.lineSuits[l]=c?c.s:rndi(4);
    } 
    this.lastCard=null; this.flips=0; this.winner=-1; this.mults=[0,0,0,0]; 
};

RaceModel.prototype.betsTotal=function(){ var t=0; for(var i=0;i<4;i++) t+=this.bets[i]; return t; };
RaceModel.prototype.commitBest=function(){ var best=pmem(1)|0; if(this.bank>best) pmem(1,this.bank|0); pmem(0,this.bank|0); };
RaceModel.prototype.placeBet=function(suit,amount){ if(amount>0&&this.bank>=amount){ this.bets[suit]+=amount; this.bank-=amount; pmem(0,this.bank|0);} };
RaceModel.prototype.refundBets=function(){ var tot=0; for(var s=0;s<4;s++){ tot+=this.bets[s]; this.bets[s]=0; } this.bank+=tot; pmem(0,this.bank|0); };
RaceModel.prototype.startRace=function(){ for(var i=0;i<4;i++) this.mults[i]=2+rndi(4); };

RaceModel.prototype.stepFlip=function(){ 
    if(this.deckRace.vacio()) return; 
    
    var c=this.deckRace.tomar(); 
    this.lastCard=c; 
    this.flips++; 
    
    var s=c.s; 
    var h=this.caballos[s]; 
    
    h.isStunned = false; 
    
    h.pos=clamp(h.pos+1,0,LINKS); 
    
    for(var l=1;l<=LINE_CARDS;l++){ 
        if(!this.lineRevealed[l]){ 
            var all=true; 
            for(var j=0;j<4;j++){ 
                if(this.caballos[j].pos < l){ 
                    all=false; 
                    break; 
                } 
            } 
            
            if(all){ 
                this.lineRevealed[l]=true; 
                
                var sb=this.lineSuits[l]; 
                var hb=this.caballos[sb]; 
                
                if(hb.pos > 0){ 
                    hb.pos--; 

                    hb.isStunned = true; 
                    hb.poofT = 24;
                } 
                break; 
            } 
        } 
    } 
    
    for(var k=0;k<4;k++){ 
        if(this.caballos[k].pos>=LINKS){ 
            this.winner=k; 
            return; 
        } 
    } 
};

RaceModel.prototype.finishRace=function(){ 
    var win=this.winner; 
    var payout=(this.bets[win]||0)*(this.mults[win]||0); 
    if(payout>0) this.bank+=payout; 
    this.bets=[0,0,0,0]; 
    this.commitBest(); 
}; 
// =========================
// classes/ui.js
// =========================

var CARD_IDS = [400, 403, 406, 409]; 
var ICON_IDS = [258, 256, 260, 262]; 
var LINE_IDS = [464, 467, 470, 473]; 

var TEAM_COLS = [13, 2, 4, 11];

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
            
            if(typeof pal === 'function'){
                pal(14, TEAM_COLS[s]);
                pal(15, TEAM_COLS[s]);
                pal(0, TEAM_COLS[s]);
                pal(2, TEAM_COLS[s]);
            }
            
            spr(LINE_IDS[s], x-8, y-8, 0, 1, 0, 0, 2, 2);
            
            if(typeof pal === 'function') pal();
            
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
    
    var bankT='BANCO '+bank+' BEST '+best; 
    var w2=print(bankT,0,-6,0,true,1,true);
    print(bankT,(W-w2)/2,80,7,false,1,true);
    
    print('A: Continuar', 60, 92, 6);
    print('START: Menú', 130, 92, 13);
};

UI.prototype.drawLastCard=function(card){
    var cx=LAY.drawCardX, cy=LAY.drawCardY;
    
    rect(cx-9, cy-13, 18, 26, 0); 
    rectb(cx-9, cy-13, 18, 26, 6); 
    
    if(!card) return;
    
    if(typeof pal === 'function'){
        pal(14, TEAM_COLS[card.s]); 
        pal(15, TEAM_COLS[card.s]);
        pal(0, TEAM_COLS[card.s]);
        pal(2, TEAM_COLS[card.s]); 
    }
    
    spr(CARD_IDS[card.s], cx-8, cy-12, 0, 1, 0, 0, 2, 3);
    
    if(typeof pal === 'function') pal();
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
        
        if(typeof pal === 'function'){
            pal(14, TEAM_COLS[s]); 
            pal(15, TEAM_COLS[s]);
            pal(0, TEAM_COLS[s]);
            pal(2, TEAM_COLS[s]); 
        }
        
        spr(ICON_IDS[s], startX-12, y-4, 0, 1, 0, 0, 1, 1);
        
        if(typeof pal === 'function') pal();
        
        var v=bets[s]||0; 
        if(v>0) print(v,startX-12,y+6,7,false,1,true);
    }
};

UI.prototype.multAtFinish=function(finishX,ys,mults,visible){
    if(!visible) return; for(var s=0;s<4;s++){ print('x'+mults[s], finishX+6, ys[s]-4, SUIT_COL[s], false,1,true); }
};

UI.prototype.mensaje=function(t){ this.msg=t; this.msgTimer=90; };

UI.prototype.drawMsg=function(){ if(this.msgTimer>0){ var w=print(this.msg,0,-6,0,true,1,true); rect((W-w)/2-4, H-16, w+8, 10, 0); print(this.msg,(W-w)/2, H-14, 12,false,1,true); this.msgTimer--; } }; 
// =========================
// classes/ui_bet.js
// =========================
function ScreenBet(m){ 
    this.m=m; 
    this.active=100; 
    this.clickCD=0; 
    
    this.row = 1; 
    this.col = 0; 
    this.animT = 0;
    this.exitPrompt = false;
}

ScreenBet.prototype.update=function(){
    updMouse(); 
    if(this.clickCD>0) this.clickCD--; 
    this.animT++;

    if(this.exitPrompt){
        if(btnp(4) || btnp(6)){
            this.m.refundBets(); 
            this.m.resetRaceOnly(); 
            this.exitPrompt = false; 
            scene=menu;
        }
        if(btnp(5)){ this.exitPrompt = false; }
        return; 
    }

    if(btnp(2)) this.col = (this.col + 3) % 4; 
    if(btnp(3)) this.col = (this.col + 1) % 4; 
    if(btnp(0) || btnp(1)) this.row = (this.row + 1) % 2;
    
    if(btnp(4)){ 
        if(this.row === 1){
            this.active = CHIP_VALS[this.col];
        } else {
            this.m.placeBet(this.col, this.active);
        }
    }
    
    if(btnp(5)){
        if(this.m.betsTotal() > 0){
            this.m.startRace(); 
            scene=race;
        }
    }

    if(btnp(6)){
        if(this.m.betsTotal() > 0){
            this.m.refundBets();
        } else {
            this.exitPrompt = true;
        }
    }

    var chipStartX = 35; 
    var chipGap = 45;
    
    for(var i=0;i<CHIP_VALS.length;i++){ 
        var cx = chipStartX + (i * chipGap);
        var cy = LAY.chipRowY - 22; 
        
        if(hit(cx, cy, 20, 20) && M.l){ 
            this.active = CHIP_VALS[i];
            this.row = 1; this.col = i; 
        }
    }

    var startX = 20; 
    var gapX = 52;
    
    for(var s=0;s<4;s++){
        var sx = startX + (s * gapX);
        var sy = LAY.betSuitY - 10; 
        var boxW = 20; var boxH = 28;
        
        var bx = sx + (LAY.betSuitW - boxW)/2;
        var by = sy + (LAY.betSuitH - boxH)/2;
        
        if(hit(bx, by, boxW, boxH)){
            if(M.x!=0) { this.row = 0; this.col = s; }
            if((M.lp || (M.l && this.clickCD===0))){
                this.m.placeBet(s, this.active); 
                this.clickCD=6;
            }
        }
    }
    
    if(this.m.bank<=0 && this.m.betsTotal()===0){ this.m.winner=-1; this.m.commitBest(); scene=finish; }
};

ScreenBet.prototype.draw=function(){ 
    cls(0); 

    map(30, 0, 30, 17, 0, 0, -1);

    print("APUESTAS", 11, 12, 7); 
    var bankText = "BANCO: " + (this.m.bank|0);
    var wBank = print(bankText, 0, -10, 0);
    print(bankText, W - wBank - 11, 12, 7); 
    
    var CARD_IDS = [400, 403, 406, 409]; 
    var TEAM_COLS = [13, 2, 4, 11];

    var startX = 20; 
    var gapX = 52; 

    for(var s=0;s<4;s++){ 
        var sx = startX + (s * gapX);
        var sy = LAY.betSuitY - 10; 
        
        var boxW = 20; var boxH = 28; 
        var bx = sx + (LAY.betSuitW - boxW)/2;
        var by = sy + (LAY.betSuitH - boxH)/2;

        if(!this.exitPrompt && this.row === 0 && this.col === s){
            rectb(bx-2, by-2, boxW+4, boxH+4, 12);
        }

        rect(bx, by, boxW, boxH, 1); 
        rectb(bx, by, boxW, boxH, ink(s)); 
        
        if(typeof pal === 'function'){
            pal(14, TEAM_COLS[s]); pal(15, TEAM_COLS[s]); pal(0, TEAM_COLS[s]); pal(2, TEAM_COLS[s]); 
        }
        spr(CARD_IDS[s], bx+2, by+2, 0, 1, 0, 0, 2, 3);
        if(typeof pal === 'function') pal();
        
        var v = this.m.bets[s]||0; 
        if(v > 0) {
            var wV = print(v, 0, -10, 0);
            print(v, sx + (boxW-wV)/2 + 12 + 1, sy + boxH + 5, 0); 
            print(v, sx + (boxW-wV)/2 + 12, sy + boxH + 4, 4);    
        }
    } 
    
    var chipStartX = 35;
    var chipGap = 45;
    
    for(var i=0;i<CHIP_VALS.length;i++){ 
        var val = CHIP_VALS[i];
        var sprites = CHIP_SPRITES[val]; 
        var sprId = sprites[0]; 
        
        if(this.active === val){
            var frame = (this.animT / 10 | 0) % 2; 
            sprId = sprites[2 + frame]; 
        } else if(!this.exitPrompt && this.row === 1 && this.col === i){
            sprId = sprites[1];
        }
        
        var cx = chipStartX + (i * chipGap);
        var cy = LAY.chipRowY - 22; 

        spr(sprId, cx, cy, 0, 1, 0, 0, 2, 2);
        
        var wTxt = print(val, 0, -10, 0, false, 1, true); 
        print(val, cx + 8 - (wTxt/2) + 1, cy + 19, 0, false, 1, true); 
        print(val, cx + 8 - (wTxt/2), cy + 18, 6, false, 1, true);
    } 

    var yK = H-12;
    
    rect(0, yK-2, W, 14, 0);

    spr(KEY_Z, 4, yK-2, 0, 1, 0, 0, 2, 2);
    print("Apostar", 22, yK+4, 6, false, 1, true);
    
    if(this.m.betsTotal() > 0){
        spr(KEY_X, 85, yK-2, 0, 1, 0, 0, 2, 2);
        print("Correr!", 103, yK+4, 11, false, 1, true);
    } else {
        print("Elije ficha...", 90, yK+4, 13, false, 1, true);
    }

    var labelStart = (this.m.betsTotal() > 0) ? "Limpiar" : "Salir";
    spr(KEY_A, 170, yK-2, 0, 1, 0, 0, 2, 2);
    print(labelStart, 188, yK+4, 6, false, 1, true);

    if(this.exitPrompt){
        rect(60, 40, 120, 50, 0);
        rectb(60, 40, 120, 50, 12);
        print("¿SALIR AL MENU?", 75, 50, 14);
        spr(KEY_Z, 70, 70, 0, 1, 0, 0, 2, 2);
        print("SI", 90, 75, 6);
        spr(KEY_X, 110, 70, 0, 1, 0, 0, 2, 2);
        print("NO", 130, 75, 6);
    }
}; 
// =========================
// classes/ui_race.js
// =========================
function ScreenRace(m){ this.m=m; this.auto=false; this.t=0; }

ScreenRace.prototype.update=function(){ 
    if(btnp(4)) this.m.stepFlip(); 
    if(btnp(5)) this.auto=!this.auto; 
    if(btnp(6)) { this.m.refundBets(); scene=bet; } 
    if(this.auto){ 
        this.t++; 
        if(this.t>18){ this.m.stepFlip(); this.t=0; } 
    } 
    if(this.m.winner>=0){ 
        this.m.finishRace(); 
        scene=finish; 
    } 
};

ScreenRace.prototype.draw=function(){ 
    cls(0); 
    
    var ui = new UI();
    
    var x0=this.m.startX,x1=this.m.finishX,dx=this.m.dx,ys=this.m.ys; 

    map(60, 0, 30, 17, 0, 0, -1);

    ui.drawLineCards(x0, dx, ys, this.m.lineRevealed, this.m.lineSuits);

    for(var j=0;j<4;j++){ 
        var isWinner = (this.m.winner === j);
        this.m.caballos[j].draw(isWinner); 
    }

    for(var s=0;s<4;s++){
        var multX = x1 + 2; 
        var multY = ys[s] - 4;
        if(typeof pal === 'function'){
            pal(14, TEAM_COLS[s]); pal(15, TEAM_COLS[s]); pal(0, TEAM_COLS[s]); pal(2, TEAM_COLS[s]); 
        }
        spr(ICON_IDS[s], multX, multY, 0, 1, 0, 0, 1, 1);
        if(typeof pal === 'function') pal();
        print('x'+this.m.mults[s], multX + 8, multY, ink(s));
    }

    if(this.m.lastCard){ 
        ui.drawLastCard(this.m.lastCard);
    } 
    
    ui.hudTop();

    var yK = 120; 
    var yText = yK + 5;

    spr(KEY_Z, 4, yK, 0, 1, 0, 0, 2, 2);
    print("Flip", 22, yText, 6);
    
    var autoText = this.auto ? "ON" : "OFF";
    var autoCol = this.auto ? 11 : 6;
    spr(KEY_X, 60, yK, 0, 1, 0, 0, 2, 2);
    print("Flip Auto: " + autoText, 78, yText, autoCol);

    spr(KEY_A, 180, yK, 0, 1, 0, 0, 2, 2);
    print("Volver", 198, yText, 6);
}; 
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

    rect(45, 20, 150, 96, 0); 
    rectb(45, 20, 150, 96, 12);
    
    var bankT='BANCO '+ (this.m.bank|0) +'  BEST '+(pmem(1)|0); 
    var w2=print(bankT,0,-6,0,true,1,true);
    print(bankT,(W-w2)/2, 26, 7, false, 1, true);
    
    if(this.m.winner>=0){ 
        var txt = "GANADOR";
        var wTxt = print(txt, 0, -10, 0); 
        print(txt, centerX - (wTxt/2), 38, 14); 
        
        var iconId = ICON_IDS[this.m.winner];
        
        if(typeof pal === 'function'){
            pal(14, TEAM_COLS[this.m.winner]); 
            pal(15, TEAM_COLS[this.m.winner]); 
            pal(0, TEAM_COLS[this.m.winner]); 
            pal(2, TEAM_COLS[this.m.winner]); 
        }
        spr(iconId, centerX - 4, 48, 0, 1, 0, 0, 1, 1);
        if(typeof pal === 'function') pal();
        
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
    
    var yBtn = 90;
    
    if(this.m.bank <= 0){
        var txt1 = "¡BANCARROTA!";
        var w1 = print(txt1,0,-10,0);
        print(txt1, centerX - (w1/2), 85, 2);
        
        spr(KEY_A, centerX - 40, yBtn+5, 0, 1, 0, 0, 2, 2);
        print("Salir al Menú", centerX - 20, yBtn+10, 6);
    } else {
        spr(KEY_Z, 55, yBtn-5, 0, 1, 0, 0, 2, 2);
        print("Seguir", 75, yBtn, 6);

        spr(KEY_A, 115, yBtn-5, 0, 1, 0, 0, 2, 2);
        print("Retirarse", 133, yBtn, 13);
    }
}; 
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
}

ScreenMenu.prototype.update=function(){
    this.scrollX = (this.scrollX + this.scrollSpeed) % 240;

    for(var i=0; i<this.menuHorses.length; i++){
        var h = this.menuHorses[i];
        h.animTimer = this.scrollX;
        h.pos = 1; 
    }

    if(btnp(0)) this.idx=(this.idx+1)%2;
    if(btnp(1)) this.idx=(this.idx+1)%2;
    
    if(btnp(4) || btnp(6)){
        if(this.idx===0){ 
            model.bank = 1000; pmem(0, 1000); model.resetRaceOnly(); scene=bet; 
        }
        else if(this.idx===1){ scores=new ScreenScores(); scene=scores; }
    }
};

ScreenMenu.prototype.draw=function(){ 
    cls(0); 

    map(0, 51, 30, 17, -this.scrollX, 0, -1);
    map(0, 51, 30, 17, -this.scrollX + 240, 0, -1);

    for(var i=0; i<this.menuHorses.length; i++){
        this.menuHorses[i].draw(false, false);
    }

    spr(144, 56, 25, 0, 1, 0, 0, 16, 3);

    for(var i=0;i<2;i++){
        var y=70+i*14;
        var c=(i===this.idx)?14:7; 
        var txt = (i===this.idx?'> ':' ')+this.opts[i];
        
        print(txt, 70-1, y, 0); print(txt, 70+1, y, 0);
        print(txt, 70, y-1, 0); print(txt, 70, y+1, 0);
        
        print(txt, 70, y, c); 
    } 
    
    var yKeys = H-18;
    spr(KEY_Z, 81, yKeys, 0, 1, 0, 0, 2, 2);
    
    var selTxt = "Seleccionar";
    print(selTxt, 99-1, yKeys+5, 0); print(selTxt, 99+1, yKeys+5, 0);
    print(selTxt, 99, yKeys+4, 0); print(selTxt, 99, yKeys+6, 0);
    
    print(selTxt, 99, yKeys+5, 6);
}; 
// =========================
// classes/ui_scores.js
// =========================
function ScreenScores(){ this.list=hs_load(); }

ScreenScores.prototype.update=function(){ 

    if(btnp(6) || btnp(4) || btnp(5)) scene=menu; 
};

ScreenScores.prototype.draw=function(){ 
    cls(0); 
    
    print('HIGH SCORES', 80, 18, 7); 
    
    for(var i=0;i<5;i++){ 
        var e=this.list[i]; 
        var y=40+i*16; 
        var nm=e.name||'---'; 
        var sc=e.score|0; 
        
        print((i+1)+'. '+nm, 70, y, 12); 
        print(sc.toString(), 170, y, 7); 
    } 

    var yK = H-12;
    var centerX = W/2;
    
    
    spr(KEY_A, 96, yK-5, 0, 1, 0, 0, 2, 2);
    print('Volver', 114, yK, 6); 
}; 
// =========================
// classes/ui_name.js
// =========================
function ScreenName(score){ this.score=score|0; this.letters=[65,65,65]; this.pos=0; }

ScreenName.prototype.update=function(){

    if(btnp(2)) this.pos = (this.pos + 2) % 3;
    if(btnp(3)) this.pos = (this.pos + 1) % 3;

    if(btnp(0)) this.letters[this.pos] = (this.letters[this.pos] >= 90) ? 65 : this.letters[this.pos] + 1; 
    if(btnp(1)) this.letters[this.pos] = (this.letters[this.pos] <= 65) ? 90 : this.letters[this.pos] - 1; 
    
    if(btnp(4)) { 
        var name=String.fromCharCode(this.letters[0],this.letters[1],this.letters[2]); 
        hs_insert(this.score,name); 
        
        model.bank = 1000;
        pmem(0, 1000);
        model.resetRaceOnly();
        
        scores=new ScreenScores(); 
        scene=scores; 
    }
};

ScreenName.prototype.draw=function(){ 
    cls(0); 
    print('NEW HIGH SCORE!', 70, 28, 14); 
    print('SCORE: '+this.score, 84, 40, 7); 
    
    var x=84, y=68; 
    for(var i=0;i<3;i++){ 
        var c=(i===this.pos)?14:7; 
        rectb(x-4+i*24,y-8,18,18,c); 
        print(String.fromCharCode(this.letters[i]), x+i*24, y, c); 
    } 

    var yInst = 95;

    spr(KEY_UP, 50, yInst, 0, 1, 0, 0, 2, 2); 
    spr(KEY_DOWN, 62, yInst, 0, 1, 0, 0, 2, 2); 
    print('Letra', 80, yInst+5, 6); 

    spr(KEY_LEFT, 50, yInst+14, 0, 1, 0, 0, 2, 2); 
    spr(KEY_RIGHT, 62, yInst+14, 0, 1, 0, 0, 2, 2); 
    print('Mover', 80, yInst+19, 6);

    var yK = 122;
    spr(KEY_Z, 70, yK, 0, 1, 0, 0, 2, 2);
    print('Confirmar', 88, yK+5, 14); 
}; 
// =========================
// ui_quit.js
// =========================
function ScreenQuit(){}
ScreenQuit.prototype.update=function(){ if(btnp(6) || btnp(4)) scene=menu; };
ScreenQuit.prototype.draw=function(){ cls(0); rect(40,44,160,48,0); rectb(40,44,160,48,12); print('SALIR DEL JUEGO', 72, 50, 14); print('Presiona ESC para salir de TIC-80', 50, 64, 7); print('START/A: Volver al menú', 80, 76, 6); };
 
// =========================
// escenas y TIC
// =========================
var model=null, bet=null, race=null, finish=null, menu=null, quit=null, scene=null, scores=null, nameEntry=null;

function init(){
    model = new RaceModel();
    bet = new ScreenBet(model);
    race = new ScreenRace(model);
    finish = new ScreenFinish(model);
    menu = new ScreenMenu();
    quit = new ScreenQuit();
    
    scene = menu;
}

init(); 

function TIC(){
    if(!scene) { init(); return; }

    scene.update();
    scene.draw();
} 


// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
// </PALETTE>

