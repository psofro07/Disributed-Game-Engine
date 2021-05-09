require("dotenv").config();

// ------------------- GRPC --------------------------------------//
const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
// Load synchronously.
const packageDef = protoLoader.loadSync("playMaster.proto", {});
// Load package definition into Object.
const grpcObject = grpc.loadPackageDefinition(packageDef);
// Create package from object.
const playMasterPackage = grpcObject.playMasterPackage;


// ------------------- GRPC --------------------------------------//

// ------------------ mongoDB ------------------------------------//
// Connect to MongoDB.
const connectDb = require("./config/connection");
// Game schema.
const Game = require("./config/models/Game.model");
const { query } = require("express");
// ------------------ mongoDB ------------------------------------//



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
server.addService(playMasterPackage.playMaster.service,
    {
        "pushMove": pushMove,
        "receiveMove": receiveMove,
        "initializeGame": initializeGame,
        "checkTurn": checkTurn
    });

server.bind("play-master:6000", grpc.ServerCredentials.createInsecure());

    server.start();

    connectDb();

