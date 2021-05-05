var gameLobby = [];
    
let game = {
    gameId: "game1",
    player1: "user1",
    player2: "hi",
    type: "chess"
}

let game1 = {
    gameId: "game2",
    player1: "user2",
    player2: "",
    type: "chess"
}

gameLobby.push(game);
gameLobby.push(game1);

let i = 0;
gameLobby.forEach(function(game){
    if(game.player2 === ""){
        gameLobby[i].player2 = "Pavlos";
        console.log(game.player2)
    }
    i++;

});

