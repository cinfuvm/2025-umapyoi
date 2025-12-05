// =========================
// classes/ui_bet.js
// =========================
function ScreenBet(m){ 
    this.m=m; this.active=100; this.clickCD=0; 
    this.row = 1; this.col = 0; this.animT = 0; this.exitPrompt = false;
    playMus(MUS_BET);
}

ScreenBet.prototype.update=function(){
    updMouse(); if(this.clickCD>0) this.clickCD--; this.animT++;

    if(this.exitPrompt){

        if(btnp(4) || btnp(6) || (M.lp && hit(60, 65, 50, 30))){
            sfx(SND_SEL, -1, 8, -1, 3); 
            this.m.refundBets(); this.m.resetRaceOnly(); this.exitPrompt = false; scene=menu;
        }

        if(btnp(5) || (M.lp && hit(110, 65, 50, 30))){ 
            sfx(SND_NAV, -1, 4, -1, 8); this.exitPrompt = false; 
        }
        return; 
    }

    if(btnp(2)){ this.col = (this.col + 3) % 4; sfx(SND_NAV, -1, 8, -1, 8); } 
    if(btnp(3)){ this.col = (this.col + 1) % 4; sfx(SND_NAV, -1, 8, -1, 8); }
    if(btnp(0) || btnp(1)){ this.row = (this.row + 1) % 2; sfx(SND_NAV, -1, 8, -1, 8); }
    
    if(btnp(4)){ 
        sfx(SND_SEL, -1, 8, -1, 3);
        if(this.row === 1) this.active = CHIP_VALS[this.col];
        else this.m.placeBet(this.col, this.active);
    }
    
    if(btnp(5) && this.m.betsTotal() > 0){ sfx(SND_SEL, -1, 8, -1, 3); this.m.startRace(); scene=new ScreenRace(this.m); }

    if(btnp(6)){
        if(this.m.betsTotal() > 0){ sfx(SND_NAV, -1, 8); this.m.refundBets(); }
        else { sfx(SND_NAV, -1, 8); this.exitPrompt = true; }
    }

    var chipStartX=35, chipGap=45; 
    for(var i=0;i<CHIP_VALS.length;i++){ 
        var cx = chipStartX + (i * chipGap), cy = LAY.chipRowY - 22;

        if(hit(cx, cy, 20, 20) && M.l){ 
            sfx(SND_SEL, -1, 8, -1, 3); this.active = CHIP_VALS[i]; this.row=1; this.col=i; 
        }
    }

    var startX=20, gapX=52;
    for(var s=0;s<4;s++){
        var sx = startX + (s * gapX), sy = LAY.betSuitY - 10; 
        var boxW = 20, boxH = 28;
        var bx = sx + (LAY.betSuitW - boxW)/2;
        var by = sy + (LAY.betSuitH - boxH)/2;

        if(hit(bx, by, boxW, boxH)){
            if(M.x!=0) { this.row=0; this.col=s; }
            if((M.lp || (M.l && this.clickCD===0))){ 
                sfx(SND_SEL, -1, 8, -1, 3); 
                this.m.placeBet(s, this.active); 
                this.clickCD=6; 
            }
        }
    }

    var yK = H-12;

    if(M.lp && hit(0, yK-5, 60, 20)){
        sfx(SND_SEL, -1, 8, -1, 3);
        if(this.row === 1) this.active = CHIP_VALS[this.col];
        else this.m.placeBet(this.col, this.active);
    }

    if(this.m.betsTotal() > 0){
        if(M.lp && hit(80, yK-5, 60, 20)){
            sfx(SND_SEL, -1, 8, -1, 3); 
            this.m.startRace(); 
            scene = new ScreenRace(this.m);
        }
    }

    if(M.lp && hit(160, yK-5, 80, 20)){
        if(this.m.betsTotal() > 0){ sfx(SND_NAV, -1, 8); this.m.refundBets(); }
        else { sfx(SND_NAV, -1, 8); this.exitPrompt = true; }
    }
    
    if(this.m.bank<=0 && this.m.betsTotal()===0){ this.m.winner=-1; this.m.commitBest(); scene=new ScreenFinish(this.m); }
};

ScreenBet.prototype.draw=function(){ 
    cls(0); map(30, 0, 30, 17, 0, 0, -1);
    print("APUESTAS", 11, 12, 7); 
    var bankText = "BANCO: " + (this.m.bank|0);
    var wBank = print(bankText, 0, -10, 0);
    print(bankText, W - wBank - 11, 12, 7); 
    
    var CARD_IDS = [400, 403, 406, 409]; var TEAM_COLS = [13, 2, 4, 11];
    var startX = 20, gapX = 52; 

    for(var s=0;s<4;s++){ 
        var sx = startX + (s * gapX), sy = LAY.betSuitY - 10; 
        var boxW = 20, boxH = 28; 
        var bx = sx + (LAY.betSuitW - boxW)/2, by = sy + (LAY.betSuitH - boxH)/2;

        if(!this.exitPrompt && this.row === 0 && this.col === s){ rectb(bx-2, by-2, boxW+4, boxH+4, 12); }
        rect(bx, by, boxW, boxH, 1); rectb(bx, by, boxW, boxH, ink(s)); 
        if(typeof pal === 'function'){ pal(14, TEAM_COLS[s]); pal(15, TEAM_COLS[s]); pal(0, TEAM_COLS[s]); pal(2, TEAM_COLS[s]); }
        spr(CARD_IDS[s], bx+2, by+2, 0, 1, 0, 0, 2, 3);
        if(typeof pal === 'function') pal();
        var v = this.m.bets[s]||0; 
        if(v > 0) {
            var wV = print(v, 0, -10, 0);
            print(v, sx + (boxW-wV)/2 + 12 + 1, sy + boxH + 5, 0); print(v, sx + (boxW-wV)/2 + 12, sy + boxH + 4, 4); 
        }
    } 
    
    var chipStartX = 35, chipGap = 45;
    for(var i=0;i<CHIP_VALS.length;i++){ 
        var val = CHIP_VALS[i]; var sprites = CHIP_SPRITES[val]; var sprId = sprites[0]; 
        if(this.active === val){ var frame = (this.animT / 10 | 0) % 2; sprId = sprites[2 + frame]; } 
        else if(!this.exitPrompt && this.row === 1 && this.col === i){ sprId = sprites[1]; }
        var cx = chipStartX + (i * chipGap), cy = LAY.chipRowY - 22; 
        spr(sprId, cx, cy, 0, 1, 0, 0, 2, 2);
        var wTxt = print(val, 0, -10, 0, false, 1, true); 
        print(val, cx + 8 - (wTxt/2) + 1, cy + 19, 0, false, 1, true); print(val, cx + 8 - (wTxt/2), cy + 18, 6, false, 1, true);
    } 

    var yK = H-12; rect(0, yK-2, W, 14, 0);
    spr(KEY_Z, 4, yK-2, 0, 1, 0, 0, 2, 2); print("Apostar", 22, yK+4, 6, false, 1, true);
    if(this.m.betsTotal() > 0){ spr(KEY_X, 85, yK-2, 0, 1, 0, 0, 2, 2); print("Correr!", 103, yK+4, 11, false, 1, true); } 
    else { print("Elije ficha...", 90, yK+4, 13, false, 1, true); }
    var labelStart = (this.m.betsTotal() > 0) ? "Limpiar" : "Salir";
    spr(KEY_A, 170, yK-2, 0, 1, 0, 0, 2, 2); print(labelStart, 188, yK+4, 6, false, 1, true);

    if(this.exitPrompt){
        rect(60, 40, 120, 50, 0); rectb(60, 40, 120, 50, 12); print("¿SALIR AL MENU?", 75, 50, 14);
        spr(KEY_Z, 70, 70, 0, 1, 0, 0, 2, 2); print("SI", 90, 75, 6);
        spr(KEY_X, 110, 70, 0, 1, 0, 0, 2, 2); print("NO", 130, 75, 6);
    }
};