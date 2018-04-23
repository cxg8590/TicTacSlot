class Player{
    constructor(){
        this.score = 0;
    }

//add any points the player just scored
    addScore(scr){
        this.score += scr;
    }

    getScore(){
        return this.score;
    }
}