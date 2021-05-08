require("dotenv").config();

// ------------------- GRPC --------------------------------------//
const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
// Load synchronously.
const packageDef = protoLoader.loadSync("mychat.proto", {});
// Load package definition into Object.
const grpcObject = grpc.loadPackageDefinition(packageDef);
// Create package from object.
const mychatPackage = grpcObject.myChatPackage;



// Create unique game ID.
const {v4 : uuidv4} = require("uuid");

// ------------------- GRPC --------------------------------------//

// ------------------ mongoDB ------------------------------------//
// Connect to MongoDB.
const connectDb = require("./config/connection");
// Game schema.
const Game = require("./config/models/Game.model");
const { query } = require("express");
// ------------------ mongoDB ------------------------------------//


var matchmakingList = [];
var userGList = [];
var gameLobby = [];
var anonymousCount = 0;



// Check if the user exists in matchmaking 
// * {string: username}
// * {bool: success, string: username, string: text}
function connectUser (call, callback) {

    let username = call.request.username;

    if(typeof(username) === "undefined"){
        callback(null, {"success": false, "username": username, "text": "Invalid User"});
    }
    else{

        if(!matchmakingList.includes(username)){

            anonymousCount++;
            user = "user" + anonymousCount;
            matchmakingList.push(username);                         // TODO: Insert in Matchmake
    
            console.log("User " + username + " entered matchmaking");
            callback(null, {"success": true, "username": username, "text": "Matchmaking"});       
    
        } 
        else{
    
            callback(null, {"success": false, "username": username, "text": "User is already in matchmaking!"});
        }
    }
  
}


// * {string username, bool creator}
// * {bool player1, bool gameFound,string gameId}
async function joinGame (call, callback) {

    let username = call.request.username;
    let gameCreator = call.request.gameCreator;


    // If you already created a game
    if(gameCreator === false){
        
        
        if(gameLobby.length !== 0){

            // Join a game                          // TODO insert concurrency
            let i = 0;
            let foundGame = false;
            let gameJoined = null;

            await Game.findOneAndUpdate( {'player2': null}, {'player2': username},
            (err, game ) => {
                if(err){
                    console.log(err);
                }
                else{
                    if(game !== null){
                        foundGame = true;
                        gameJoined = game.gameID;
                    }
                }
            });


            if (foundGame === false){
                let gameID = createGame(username);
                console.log("All games were full, user: " + username + " created game: "+ gameID);     
                callback(null, {gameCreator: true, gameFound: false});
            }
            else {
                console.log("User: "+username+ " Joined game!");
                callback(null, {gameCreator: false, gameFound: true, gameId: gameJoined});
            }

        }
        else {

            // No games, create one
    
            let gameID = createGame(username);
    
            console.log("User: " + username + "created game: "+ gameID); 
            callback(null, {gameCreator: true, gameFound: false});
        }

    }
    else{

        // Check if someone joined your game
        let game = await Game.findOne({'player1': username}, (err, game) => {
            if(err){
                console.log(err);
            }
            else{

                if(game.player2 !== null){
                    // Matchmaking complete
                    console.log("User: "+ username +" found a game!");     
                    callback(null, {gameCreator: true, gameFound: true, gameId: game.gameID}); 
                }
                else{
                    // No opponent found yet
                    console.log("Game not found for: "+username +" yet.");
                    callback(null, {gameCreator: true, gameFound: false});
                }
            }
        });
    }
}


function createGame (username) {

    
    let game = new Game ({
        gameID: uuidv4(),
        player1: username,
        player2: null,
        type: "chess"
    });

    gameLobby.push(game);

    game
        .save()
        .then(() => {
            console.log("Game created with ID: "+game.gameID);
        })
        .catch( err => {
            console.log(err);
        });

    return game.gameID;

}


// * ------------------------------------------------------------- PLAYMASTER ---------------------------------------------------------------- //


function pushMove (call, callback) {

    let username = call.request.username;
    let gameID = call.request.gameID;
    let source = call.request.source;
    let target = call.request.target;
    let foundGame = false;

    let i=0;
    gameChessMove.every(move => {
        if(move.gameID === gameID){
            gameChessMove[i].move.source = source;
            gameChessMove[i].move.target = target;

            if(gameChessMove[i].turn === 0){
                gameChessMove[i].turn = 1; 
            }
            else{
                gameChessMove[i].turn = 0; 
            }

            gameChessMove[i].move_by = username;

            foundGame = true;

            console.log(gameChessMove[i]);

            return false;
        }
        i++;
    })

    if(foundGame) {
        console.log("Updated move on game:"+gameID);
        callback(null, {success: true});
    }
    else{
        console.log("Failed to update move on game:"+gameID);
        callback(null, {success: false});
    }
    
}


function initializeGame(call, callback) {

    let gameID = call.request.gameID;

    let move = {
        gameID: gameID,
        turn: 0,
        move: {
            source: null,
            target: null
        },
        move_by: null
    }
    
    try {
        gameChessMove.push(move);
    } catch (err) {
        console.log(err);
        callback(null, {success: false});
        
    }
    console.log(move);
    callback(null, {success: true});
}


function receiveMove (call, callback) {
    let username = call.request.username;
    let gameID = call.request.gameID;

    var source = null;
    var target = null;
    let foundGame = false;


    gameChessMove.every(move => {
        if(move.gameID === gameID){
            source = move.move.source;
            target = move.move.target;

            foundGame = true;

            return false;
        }

        return true;
    })

    if(foundGame) {
        console.log("Received move on game:"+gameID);
        callback(null, {source: source, target: target, success: true });
    }
    else{
        console.log("Failed to receive move on game:"+gameID);
        callback(null, {success: false});
    }

}

function checkTurn (call, callback) {
    let turn = call.request.turn;
    let gameID = call.request.gameID;

    let foundGame = false;
    let myturn = false;

    gameChessMove.every(move => {
        if(move.gameID === gameID){
            if(turn == move.turn){
                myturn = true;
            }
            foundGame = true;

            return false;
        }
        return true;
    })

    if(myturn){
        console.log("Its your turn");
        callback(null, {success: true});
    }
    else if(foundGame) {
        console.log("Not your turn yet ");
        callback(null, {success: false});
    }
    else{
        console.log("Failed to find game: "+gameID);
        callback(null, {success: false});
    }
}


var gameChessMove = [];

// Main
const server = new grpc.Server();

// Create service from the server definition package.
server.addService(mychatPackage.myChat.service,
    {
        "connectUser": connectUser,
        "joinGame": joinGame,
        "pushMove": pushMove,
        "receiveMove": receiveMove,
        "initializeGame": initializeGame,
        "checkTurn": checkTurn
    });

server.bind("game-master:5000", grpc.ServerCredentials.createInsecure());

    server.start();

    connectDb();

