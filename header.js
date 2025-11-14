// title: Horserace
// author: Fay
// desc: Tripl3 Crown
// script: js
// saveid: horserace
// input: gamepad, mouse


// =========================
// header.js — parámetros y utilidades (ES5)
// =========================
var W=240, H=136;

var LAY={
trackX0:28, trackX1:212, yTop:40, yGap:20,
lineCardsY:108, drawCardX:120, drawCardY:118,
betSuitY:60, betSuitW:44, betSuitH:32,
chipRowY:116, margin:8
};

// RNG
var __seed=(time()|0)^0x9e3779b9; function _imul(a,b){return (a*b)|0;}
function rnd(){ __seed=(_imul(__seed,1664525)+1013904223)|0; return ((__seed>>>0)/4294967296);}
function rndi(n){return (rnd()*n)|0;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}


// Palos
var SUIT_COL=[0,2,2,11]; var SUIT_LET=['S','H','D','C'];


// Pista
var LINKS=10; var LINE_CARDS=8;

// Mouse
var M={x:0,y:0,l:false,_pl:false,lp:false};
function updMouse(){ var a=mouse(); M.x=a[0]|0; M.y=a[1]|0; M.l=!!a[2]; M.lp=M.l&&!M._pl; M._pl=M.l; }
function hit(x,y,w,h){ return M.x>=x&&M.y>=y&&M.x<x+w&&M.y<y+h; }