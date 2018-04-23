"use strict"

let canvas, ctx;

//pics
var machineImage = new Image(900,900);//x504 y549
machineImage.src = "media/SlotMachine.png";
var redLever = new Image(72,398);
redLever.src = "media/leverRed.png";
var redButton = new Image(72,68);
redButton.src = "media/redHandle.png";
var redDown = false;//is red handle down

var blueLever = new Image(72,398);
blueLever.src = "media/leverBlue.png";
var blueButton = new Image(72,68);
blueButton.src = "media/blueHandle.png";
var blueDown = false;//is blue handle down

var handleTimer = 0; //timer for handle animation
var handleTime = 100;//time handle will be down

//reels
var reels = new Array(9);
//for pretty much everything for simplicity when using arrays and such
//0 = X, 1 = O, 2 = Double, 3 = Nothing/not set 

//grid array for recording reel results
var pointCheck = new Array(9);//x = 0, o = 1, double = 2, none = 3

//array of players
var players = new Array(2);

var turn = true; //x=true o=false
var turnSwitching = false;//is it currently switching turns?
var turnHeight = 0; //increments to animate the turn symbol

var running = false; //is the game currently running
var gameOver = false; // is the game over
var intervalID; //for setting fps

const init = () =>{
    //set up main canvas
	canvas = document.querySelector('#mainCanvas');
	ctx = canvas.getContext('2d');
    
    //set up canvas for slot reels
    canvas2 = document.querySelector('#underCanvas');
    ctx2 = canvas2.getContext('2d');
    
    ctx2.drawImage(blank,390,765, 120,120); //draw initial turn
    
    //set text for scores
    ctx.font = "60px BigTop";
    ctx.fillStyle = "yellow";
    
    //set game to not game over
    gameOver = false;
    
    //set up the reels
    var reelNum = 0; //reels array number
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            reels[reelNum] = new Reel(i,j);
            pointCheck[reelNum] = 3; //putting none for all
            reelNum++;
        }
    }
    
    //set up the players
    for(var i = 0; i < 2; i++){
        players[i] = new Player();
    }
    
    drawMachine(); //draw slot machine
    
    canvas.onmouseup = click;
}

const start = () =>{
    if(typeof intervalID != "undefined") clearInterval(intervalID);
    intervalID = setInterval(animate, 10);
}
function click(e){
    var mouse = getMouse(e); //get the mouse position
    console.log("mouse x: " + mouse.x + "mouse y: " + mouse.y);
    //x87 y84
    if(running){
        //reel stopping logic
        for(var i = 0; i < reels.length; i++){
            var reel = reels[i];
            if((mouse.x >= reel.xpos && mouse.x <= (reel.xpos + symbolOffset)) && (mouse.y >= reel.ypos && mouse.y <= (reel.ypos + symbolOffset))){
                turnSwitch();
                reel.stop();
                pointCheck[i] = reel.getResult();
                console.log("result reel: " + pointCheck[i]);
                if(checkGame()) scoreGame();
            }
        }
    }
    else{
        if((mouse.x >= 829 && mouse.x <= 900) && (mouse.y >= 100 && mouse.y <= 168)){
            turn = true;
            redDown = true;
        }
        else if((mouse.x >= 1 && mouse.x <= 73) && (mouse.y >= 100 && mouse.y <= 168)){
            turn = false;
            blueDown = true;
        }
        else {return;}
        //start the game
        //set up the array that stores what is on every space
        for(var i = 0; i < 9; i++){
            pointCheck[i] = 3; //putting none for all
            reels[i].start();
        }
        start();
        running = true;
    }
}
//checks if game is over
function checkGame(){
    if(checkLineFull(pointCheck[0],pointCheck[1],pointCheck[2]) == false) return false;
    else if(checkLineFull(pointCheck[3],pointCheck[4],pointCheck[5]) == false) return false;
    else if(checkLineFull(pointCheck[6],pointCheck[7],pointCheck[8]) == false) return false;
    else if(checkLineFull(pointCheck[0],pointCheck[3],pointCheck[6]) == false) return false;
    else if(checkLineFull(pointCheck[1],pointCheck[4],pointCheck[7]) == false) return false;
    else if(checkLineFull(pointCheck[2],pointCheck[5],pointCheck[8]) == false) return false;
    else if(checkLineFull(pointCheck[0],pointCheck[4],pointCheck[8]) == false) return false;
    else if(checkLineFull(pointCheck[2],pointCheck[4],pointCheck[6]) == false) return false;
    else{
        console.log("game ending");
        return true;
    }
    
}

//calculate final score
function scoreGame(){
    var checkArray = [pointCheck[0],pointCheck[1],pointCheck[2]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[3],pointCheck[4],pointCheck[5]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[6],pointCheck[7],pointCheck[8]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[0],pointCheck[3],pointCheck[6]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[1],pointCheck[4],pointCheck[7]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[2],pointCheck[5],pointCheck[8]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[0],pointCheck[4],pointCheck[8]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    checkArray = [pointCheck[2],pointCheck[4],pointCheck[6]];
    if(checkLine(checkArray)) scoreLine(checkArray);
    
    endGame();
}

function endGame(){
    var xScore = players[0].getScore();
    var oScore = players[1].getScore();
    
    ctx.drawImage(machineImage,0,0); //reset slot image
    ctx.fillText(xScore.toString(),175,840); //print x score
    ctx.fillText(oScore.toString(),545,840);//print o score
    var winner;
    if(xScore > oScore) winner = 0;
    else if(oScore > xScore) winner = 1;
    else{winner = 2;}
    
    reels.forEach(function(reel){
        reel.gameOver(winner);
    });
    
    running = false;
}

//utility functions for various checks of lines of reels

//check if a line is full
function checkLineFull(a,b,c){
    if(a != 3 && b != 3 && c != 3) return true;
    else { return false;}
}

//check if a line has a winner
function checkLine(line){
    var a = line[0];
    var b = line[1];
    var c = line[2];
    
    if(a != 3 && b != 3 && c != 3){
        if(a!=2){
            if((a == b || b == 2) && (a == c || c == 2)) return true;
        }
        else if(b!=2){
            if((a == b || a == 2) && (a == c || c == 2)) return true;
        }
        else if(c!=2){
            if((a == b || b == 2) && (a == c || a == 2)) return true;
        }
        else{ return false; }
    }
    else{ return false; }
}

//check who won a line
function checkLineWinner(line){
    for(var i = 0; i < line.length; i++){
        if(line[i]!=2){
            if(line[i] == 0) return 0;
            else{ return 1; }
        }
    }
}

//add the score of a line to the player who scored it
function scoreLine(line){
    var score = 0;
    var multCount = 0;
    var player = players[checkLineWinner(line)];
    
    for(var i = 0; i < line.length; i++){
        if(line[i] == 2) multCount++;
        else {score += 100;}
    }
    
    if(multCount == 0) player.addScore(score);
    else { player.addScore(score * (multCount * 2)); }
}

//general utility functions

//redraws the machine
function drawMachine(){
    ctx.clearRect(0,0,900,900);
    ctx.drawImage(machineImage,0,0); //draw slot machine
    ctx.drawImage(redLever,829,100, 72,398);//red lever
    ctx.drawImage(blueLever,1,100, 72,398);//blue lever
    ctx.fillText(players[0].getScore().toString(),175,840); //print x score
    ctx.fillText(players[1].getScore().toString(),545,840);//print o score
}


//get the current mouse location relative to the canvas
function getMouse(e){
	var mouse = {}
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;
}

//change the turn Icon
function turnSwitch(){
    turn = boolSwitch(turn);
    turnSwitching = true;
    console.log("turn: " + turn);
    
}

//helps with positioning the reels
function positionHelper(axis,pos){
    if(axis == 0){ //x
        if(pos == 0) return 150;
        if(pos == 1) return 370;
        if(pos == 2) return 600;
    }
    if(axis == 1){ //y
        if(pos == 0) return 209;
        if(pos == 1) return 398;
        if(pos == 2) return 586;
    }
}

//easily switch a bool
function boolSwitch(b){
    var bl;
    if(b) bl = false;
    else{ bl = true; }
    return bl;
}



window.onload = init;