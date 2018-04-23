"use strict"
let canvas2, ctx2;

//images
var xSymbol = new Image(100,100);
xSymbol.src = "media/reelX.png";
var oSymbol = new Image(100,100);
oSymbol.src = "media/reelO.png";
var doubleSymbol = new Image(100,100);
doubleSymbol.src = "media/reelX2.png";
var symbolOffset = 148;
var blank = new Image(100,100);
blank.src = "media/blank.png";

class Reel {
    constructor(xpos, ypos){
        this.xpos = positionHelper(0,xpos);
        this.ypos = positionHelper(1,ypos);
        
        this.spinHeight = 0;
        
        this.symbols = new Array(3);
        this.symbols[0] = oSymbol;
        this.symbols[1] = xSymbol;
        this.symbols[2] = doubleSymbol;
        
        this.xWin = new Image(100,100);
        this.xWin.src = ("media/xWin/xWin" + xpos + ypos + ".png");
        
        this.oWin = new Image(100,100);
        this.oWin.src = ("media/oWin/oWin" + xpos + ypos + ".png");
        
        this.result = 3; //result of spin
        
        //
        ctx2.save();
        ctx2.beginPath();
        ctx2.rect(this.xpos,this.ypos,symbolOffset,symbolOffset);
        ctx2.clip();
        
        for(var i = 0; i < 3; i++){
            var drawPos = (symbolOffset * i) - symbolOffset;
            ctx2.drawImage(this.symbols[i],this.xpos,this.ypos + drawPos, symbolOffset,symbolOffset);
        }
        
        ctx2.restore();
        console.log("draw reel");
        
        
    }
    
    start(){
        this.symbols[0] = oSymbol;
        this.symbols[1] = xSymbol;
        this.symbols[2] = doubleSymbol;
        this.spinning = true;//is the reel spinning normally
        this.stopped = false;//the reel is stopped
        this.stopping = false;//the reel is in the process of stopping
        this.ending = false;//the reel is in the process of ending
    }
    
    stop(){
        this.spinning = false;
        this.stopped = true;
        this.stopping = true;
        
        var resultSymbol;
        
        if(this.spinHeight >= 40){
            resultSymbol = this.symbols[0];
        } 
        else{
            resultSymbol = this.symbols[1];
        }
        
        this.result = calcResult(resultSymbol);
    }
    
    spin(){
        this.spinHeight = 0;
        
        this.symbols.splice(0,0,this.symbols[2]);
        this.symbols.pop();
    }
    
    getResult(){
        
        console.log("result: " + this.result);
        return this.result;
    }
    gameOver(winner){
        if(winner == 0){
            this.symbols.splice(0,0,this.xWin);
        }
        else if(winner == 1){
            this.symbols.splice(0,0,this.oWin);
        }
        else{
            this.symbols.splice(0,0,blank);
        }
        this.ending = true;
    }
    
}

function animate(){
    animateReels();
    
    animateTurn();
    
    animateLevers();
}

function animateReels(){
    
    reels.forEach(function(reel){
            //set up clipping so reels don't appear outside their box
            ctx2.save();
            ctx2.beginPath();
            ctx2.rect(reel.xpos,reel.ypos,symbolOffset,symbolOffset);
            ctx2.clip();
        
            if(reel.spinning){

                //animate reels            
                for(var i = 0; i < 3; i++){
                    var drawPos = (symbolOffset * i) - symbolOffset;
                    //ctx2.translate(0,reel.spinHeight);
                    ctx2.drawImage(reel.symbols[i],reel.xpos,reel.ypos + drawPos + reel.spinHeight, symbolOffset,symbolOffset);
                }
                
                reel.spinHeight+=5;
                //console.log("reel spinheight: " + reel.spinHeight)
                if(reel.spinHeight >= symbolOffset) reel.spin();
            }
            else if(reel.ending){
                //animate reels to end game          
                for(var i = 0; i < 3; i++){
                    var drawPos = (symbolOffset * i) - symbolOffset;
                    //ctx2.translate(0,reel.spinHeight);
                    ctx2.drawImage(reel.symbols[i],reel.xpos,reel.ypos + drawPos + reel.spinHeight, symbolOffset,symbolOffset);
                }
                reel.spinHeight+=3;
                if(reel.spinHeight > 40){
                    reel.ending = false;
                    reel.stopped = true;
                    reel.stopping = true;
                }
            }
            else if(reel.stopped){
                    if(reel.spinHeight >= 40){
                        for(var i = 0; i < 3; i++){
                            var drawPos = (symbolOffset * i) - symbolOffset;
                            ctx2.drawImage(reel.symbols[i],reel.xpos,reel.ypos + drawPos + reel.spinHeight, symbolOffset,symbolOffset);
                        }
                        if(reel.stopping){
                            reel.spinHeight+=3;
                            if(reel.spinHeight >= symbolOffset){
                                reel.spin();
                                reel.stopping = false;
                            } 
                        }
                        
                    }
                    else{
                        var resultSymbol = reel.symbols[1];
                        reel.result = calcResult(resultSymbol);
                        for(var i = 0; i < 3; i++){
                            var drawPos = (symbolOffset * i) - symbolOffset;
                            ctx2.drawImage(reel.symbols[i],reel.xpos,reel.ypos + drawPos + reel.spinHeight, symbolOffset,symbolOffset);
                        }
                        if(reel.stopping){
                            reel.spinHeight-=1;
                            if(reel.spinHeight <= 0){
                                reel.stopping = false;
                            } 
                        }
                    }
                
            }
            
            ctx2.restore();
    });
}

function animateTurn(){
    //make sure turn marker is there
    if(turnSwitching){
        ctx2.save();
        ctx2.beginPath();
        ctx2.rect(390,765, 120,120);
        ctx2.clip();
        
        if(turn) {
            ctx2.drawImage(xSymbol,390,645+turnHeight, 120,120);
            ctx2.drawImage(oSymbol,390,765+turnHeight, 120,120);
        }
        else{
            ctx2.drawImage(xSymbol,390,765+turnHeight, 120,120);
            ctx2.drawImage(oSymbol,390,645+turnHeight, 120,120);
        }
        
        turnHeight+=5;
        
        if(turnHeight > 120){
            turnSwitching = false;
            turnHeight = 0;
        }
        ctx2.restore();
    }
    else{
        if(turn) ctx2.drawImage(xSymbol,390,765, 120,120);
        else{ctx2.drawImage(oSymbol,390,765, 120,120);}
    }
}

function animateLevers(){
    if(blueDown || redDown){
        ctx.clearRect(0,0,900,900);
        ctx.drawImage(machineImage,0,0); //draw slot machine
        ctx.fillText(players[0].getScore().toString(),175,840); //print x score
        ctx.fillText(players[1].getScore().toString(),545,840);//print o score
        
        if(blueDown){
            ctx.drawImage(blueButton,1,430,72,68);
            ctx.drawImage(redLever,829,100, 72,398);//lever that isnt pulled
        } 
        else if(redDown){
            ctx.drawImage(redButton,829,430,72,68);
            ctx.drawImage(blueLever,1,100, 72,398);//lever that isnt pulled
        } 
        
        handleTimer += 5;
        if(handleTimer >= handleTime){
            blueDown = false;
            redDown = false;
            handleTimer = 0;
            drawMachine();
        }
    }
}

function calcResult(reelRes){
    if(reelRes == xSymbol) return 0;
    else if(reelRes == oSymbol) return 1;
    else if(reelRes == doubleSymbol) return 2;
}

