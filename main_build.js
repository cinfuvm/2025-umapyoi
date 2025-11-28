// title: Horserace
// author: Fay
// desc: Tripl3 Crown
// script: js
// saveid: horserace
// input: gamepad, mouse

//// =========================
// header.js
// =========================
var W=240, H=136;

var LAY={
    M: W/2, 
    trackX0:10, 
    trackX1:190,  
    yTop:20,
    yGap:25,
    
    lineCardsY:114, 
    
    drawCardX: 224, 
    drawCardY: 60,
    
    betSuitY:60, betSuitW:44, betSuitH:32,
    chipRowY:116, margin:8
};

var __seed=(time()|0)^0x9e3779b9; function _imul(a,b){return (a*b)|0;}
function rnd(){ __seed=(_imul(__seed,1664525)+1013904223)|0; return ((__seed>>>0)/4294967296);}
function rndi(n){return (rnd()*n)|0;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}

var SUIT_COL=[0,2,2,11]; var SUIT_LET=['S','H','D','C'];
function ink(s){ return (s===0)?14:SUIT_COL[s]; }

var LINKS=10; var LINE_CARDS=8;

var M={x:0,y:0,l:false,_pl:false,lp:false};
function updMouse(){ var a=mouse(); M.x=a[0]|0; M.y=a[1]|0; M.l=!!a[2]; M.lp=M.l&&!M._pl; M._pl=M.l; }
function hit(x,y,w,h){ return M.x>=x&&M.y>=y&&M.x<x+w&&M.y<y+h; }

var CHIP_VALS=[100,500,1000,5000];
function fmt(n){ return n.toString(); }

// =========================
// High Scores
// =========================
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
// =========================
// classes/model.js — estado del juego
// =========================
function RaceModel(){
this.startX=LAY.trackX0; this.finishX=LAY.trackX1; this.dx=((this.finishX-this.startX)/LINKS);
this.ys=[LAY.yTop,LAY.yTop+LAY.yGap,LAY.yTop+LAY.yGap*2,LAY.yTop+LAY.yGap*3];
this.caballos=[ new Caballo(0,this.ys[0],this.startX,this.dx), new Caballo(1,this.ys[1],this.startX,this.dx), new Caballo(2,this.ys[2],this.startX,this.dx), new Caballo(3,this.ys[3],this.startX,this.dx) ];
this.bank=pmem(0)|0; if(this.bank<=0) this.bank=1000; this.bets=[0,0,0,0]; this.mults=[0,0,0,0];
this.lineSuits=[null]; this.lineRevealed=[false,false,false,false,false,false,false,false,false];
this.deckRace=new Mazo(); this.deckLine=new Mazo(); for(var l=1;l<=LINE_CARDS;l++){ var c=this.deckLine.tomar(); this.lineSuits[l]=c?c.s:rndi(4);}
this.lastCard=null; this.flips=0; this.winner=-1;
}
RaceModel.prototype.resetRaceOnly=function(){ for(var i=0;i<4;i++) this.caballos[i].reset(); this.lineRevealed=[false,false,false,false,false,false,false,false,false]; this.deckRace=new Mazo(); this.deckLine=new Mazo(); for(var l=1;l<=LINE_CARDS;l++){ var c=this.deckLine.tomar(); this.lineSuits[l]=c?c.s:rndi(4);} this.lastCard=null; this.flips=0; this.winner=-1; this.mults=[0,0,0,0]; };
RaceModel.prototype.betsTotal=function(){ var t=0; for(var i=0;i<4;i++) t+=this.bets[i]; return t; };
RaceModel.prototype.commitBest=function(){ var best=pmem(1)|0; if(this.bank>best) pmem(1,this.bank|0); pmem(0,this.bank|0); };
RaceModel.prototype.placeBet=function(suit,amount){ if(amount>0&&this.bank>=amount){ this.bets[suit]+=amount; this.bank-=amount; pmem(0,this.bank|0);} };
RaceModel.prototype.refundBets=function(){ var tot=0; for(var s=0;s<4;s++){ tot+=this.bets[s]; this.bets[s]=0; } this.bank+=tot; pmem(0,this.bank|0); };
RaceModel.prototype.startRace=function(){ for(var i=0;i<4;i++) this.mults[i]=2+rndi(4); };
RaceModel.prototype.stepFlip=function(){ if(this.deckRace.vacio()) return; var c=this.deckRace.tomar(); this.lastCard=c; this.flips++; var s=c.s; var h=this.caballos[s]; h.pos=clamp(h.pos+1,0,LINKS); for(var l=1;l<=LINE_CARDS;l++){ if(!this.lineRevealed[l]){ var all=true; for(var j=0;j<4;j++){ if(this.caballos[j].pos<l){ all=false; break; } } if(all){ this.lineRevealed[l]=true; var sb=this.lineSuits[l]; var hb=this.caballos[sb]; if(hb.pos>0){ hb.pos--; hb.shakeT=10; } break; } } } for(var k=0;k<4;k++){ if(this.caballos[k].pos>=LINKS){ this.winner=k; return; } } };
RaceModel.prototype.finishRace=function(){ var win=this.winner; var payout=(this.bets[win]||0)*(this.mults[win]||0); if(payout>0) this.bank+=payout; this.bets=[0,0,0,0]; this.commitBest(); };
 
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
    
    rectb(x0-10,ys[0]-16,(x1-x0)+20,(ys[3]-ys[0])+32,6); 
    for(var i=0;i<4;i++) line(x0-4,ys[i],x1+4,ys[i],5); 
    for(var k=0;k<=LINKS;k++){ 
        var x=(x0+k*dx)|0; var col=(k===LINKS)?14:6; 
        for(var seg=ys[0]-10; seg<=ys[3]+10; seg+=8) line(x,seg,x,seg+3,col); 
    } 
    
    ui.drawLineCards(x0, dx, ys, this.m.lineRevealed, this.m.lineSuits);
    
    for(var j=0;j<4;j++){ 
        var isWinner = (this.m.winner === j);
        this.m.caballos[j].draw(isWinner); 
    }

    for(var s=0;s<4;s++) print('x'+this.m.mults[s], x1+6, ys[s]-4, ink(s)); 
    
    if(this.m.lastCard){ 
        ui.drawLastCard(this.m.lastCard);
    } 
    
    ui.hudTop();

    var autoText = this.auto ? "ON" : "OFF";
    var autoCol = this.auto ? 11 : 6;
    
    print("A: Voltear", 8, H-6, 6);
    print("B: Auto " + autoText, 80, H-6, autoCol);
    print("START: Volver", 160, H-6, 6);
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
// =========================
// ui_scores.js
// =========================
function ScreenScores(){ this.list=hs_load(); }
ScreenScores.prototype.update=function(){ if(btnp(6) || btnp(4) || btnp(5)) scene=menu; };
ScreenScores.prototype.draw=function(){ cls(0); print('HIGH SCORES', 80, 18, 7); for(var i=0;i<5;i++){ var e=this.list[i]; var y=40+i*16; var nm=e.name||'---'; var sc=e.score|0; print((i+1)+'. '+nm, 70, y, 12); print(sc.toString(), 170, y, 7); } print('START/A/B: Volver', 80, H-12, 6); };
 
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

    print('ARRIBA/ABAJO: Letra', 50, 96, 6); 
    print('IZQ/DER: Mover', 60, 106, 6);
    print('A: Confirmar', 90, 120, 14); 
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

