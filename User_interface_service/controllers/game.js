const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
// Load synchronously.
const packageDef = protoLoader.loadSync("playMaster.proto", {});
const packageDefGM = protoLoader.loadSync("gameMaster.proto", {});
// Load package definition into Object.
const grpcObject = grpc.loadPackageDefinition(packageDef);
const grpcObjectGM = grpc.loadPackageDefinition(packageDefGM);

// Create package from object.
const playMasterPackage = grpcObject.playMasterPackage;
const gameMasterPackage = grpcObjectGM.gameMasterPackage;

const client = new playMasterPackage.playMaster("play-master:6000", grpc.credentials.createInsecure());
const clientGM = new gameMasterPackage.gameMaster("game-master:5000", grpc.credentials.createInsecure());

exports.ticTacToe = (req, res, next) => {

    const gameID = req.session.gameID;
    const username = req.session.username;

    let mycolor = 'X';
    if(req.session.player === 'player2'){
        mycolor = 'O';
    }

    clientGM.getOpponent({"gameID": gameID, "username": username}, (err, response) => {
        if(err){
            console.log(err);
        }
        else{
            if(response.success === true){
                const opponent = response.opponentUsername;
                res.render('tic-tac-toe', { mycolor: mycolor, username: username, opponent: opponent}); 
            }
            else{
                console.log("Could not fetch opponent username");
                res.render('tic-tac-toe', { mycolor: mycolor, username: username, opponent: null}); 
            }
        }
    });

}

exports.chess = (req, res, next) => {

    const gameID = req.session.gameID;
    const username = req.session.username;

    let mycolor = 'w';
    if(req.session.player === 'player2'){
        mycolor = 'b';
    }
    
    clientGM.getOpponent({"gameID": gameID, "username": username}, (err, response) => {
        if(err){
            console.log(err);
        }
        else{
            if(response.success === true){
                const opponent = response.opponentUsername;
                res.render('chess', { mycolor: mycolor, username: username, opponent: opponent}); 
            }
            else{
                console.log("Could not fetch opponent username");
                res.render('chess', { mycolor: mycolor, username: username, opponent: null}); 
            }
        }
    });

    
}


exports.initializeGame = (req, res, next) => {
    const gameID = req.session.gameID;

    initializeGame();

    function initializeGame() {
        client.initializeGame({"gameID": gameID}, (err, response) => {
            if(err) {
                console.log(err);
            }
            else {  

                if(response.success === true){
                    console.log("Playmaster initialised game!");
                }
                else{
                    console.log("Playmaster failed to initialize game");
                }
                res.send(response.success);
            }
            

        });
   }
}


exports.sendMove = (req, res, next) => {

    const mycolor = req.body.mycolor;
    const source = req.body.source;
    const target = req.body.target;
    const gameID = req.session.gameID;
    const username = req.session.username;

    sendMove();
    

    function sendMove() {

        client.pushMove({"username": username, "gameID": gameID, "source": source, "target": target}, (err, response) => {

            if(err) {
                console.log(err);
            }
            else {  

                if(response.success === true){
                    console.log("Move pushed by Playmaster!");
                }
                else{
                    console.log("Failed to push move to Playmaster");
                }
                res.send(response.success);
            }

        });

    }
}


exports.receiveMove = (req, res, next) => {

    const gameID = req.session.gameID;
    const username = req.session.username;

    var turn = 0;
    if(req.session.player === 'player2'){
        turn = 1;
    }

    receiveMove();

    function receiveMove() {

        client.checkTurn({"gameID": gameID, "turn": turn}, (err, response) => {
            if(err) {
                console.log(err);
            }
            else {  

                if(response.success === true){
                    client.receiveMove({"username": username, "gameID": gameID}, (err, response) => {

                        if(err) {
                            console.log(err);
                        }
                        else {  
            
                            if(response.success === true){
                                console.log("Move received by Playmaster!");
                                if(response.state === "checkmate"){
                                    //console.log(req.session.username);
                                    sendScore(username, gameID, -1);
                                }
                                if(response.state === "tie"){
                                    sendScore(username, gameID, 0.5);
                                } 
                                res.json({success: response.success, source: response.source, target: response.target, state: response.state});
                            }
                            else{
                                console.log("Failed to receive move from Playmaster");
                                res.send(response.success);
                            }
                            
                        }
            
                    });
                }
                else{
                    console.log("Not my turn yet "+ req.session.username);

                    if(response.state == "playing"){
                        setTimeout(() => {receiveMove(); }, 1000 );
                    }
                    else{
                        console.log("GAME REACHED THE END");
                        moveGame(gameID);
                        return;
                    }
                }
                
            }
        })

        
    }
}


exports.endGame = (req, res, next) => {
    const gameID = req.session.gameID;
    const username = req.session.username;
    const state = req.body.state;
    const score = req.body.score;

    endGame();

    function endGame() {

        client.gameEnd({"username": username, "gameID": gameID, "state": state}, (err, response) => {

            if(err) {
                console.log(err);
            }
            else {  

                if(response.success === true){
                    console.log("Game ended");
                    sendScore(username, gameID, score);
                    res.json({success: response.success});
                }
                else{
                    console.log("Could not end game");
                    res.json({success: response.success});
                }
                
            }
        })
    }

}

function moveGame(gameID){

    clientGM.gameHistory({"gameID": gameID}, (err, response) => {
        
        if(err) {
            console.log(err);
        }
        else {
            if(response.success === true){
                console.log("Game moved to history with id: "+gameID);
            }
            else{
                console.log("Failed to move game with id: "+gameID);
            }
        }
    })
}


function sendScore(username, gameID, score){

    clientGM.saveScore({"username": username, "gameID": gameID, "score": score}, (err, response) => {
        
        if(err) {
            console.log(err);
        }
        else {
            if(response.success === true){
                console.log("Score saved for "+username);
            }
            else{
                console.log("Could not save score");
            }
        }
    })
}