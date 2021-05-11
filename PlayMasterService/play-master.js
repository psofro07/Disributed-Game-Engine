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
const GameMove = require("./config/models/GameMove.model");
const { query } = require("express");
// ------------------ mongoDB ------------------------------------//



// * ------------------------------------------------------------- PLAYMASTER ---------------------------------------------------------------- //


async function pushMove (call, callback) {

    let username = call.request.username;
    let gameID = call.request.gameID;
    let source = call.request.source;
    let target = call.request.target;
    let foundGame = false;

    let myMove = await GameMove.findOneAndUpdate( {'gameID': gameID}, {
        'move': {
            'source': source,
            'target': target
        },
        'move_by': username
        },
        (err, gameMove ) => {
            if(err){
                console.log(err);
            }
            else{
                if(gameMove !== null){
                    foundGame = true;
                    console.log("Move made by: "+username);
                }
            }
        }
    );

    
    if(foundGame) {
        //Change turn
        let move2 = await myMove.updateOne({ 'turn': !myMove.turn});

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

    let move = new GameMove ({
        gameID: gameID,
        turn: 0,
        move: {
            source: null,
            target: null
        },
        move_by: null,
        status: {
           state: 'playing',
           winner: null 
        }
    });


    move
        .save()
        .then(() => {
            console.log(move);
            callback(null, {success: true});
        })
        .catch( err => {
            console.log(err);
            callback(null, {success: false});
        });
    
}


async function receiveMove (call, callback) {
    let username = call.request.username;
    let gameID = call.request.gameID;

    var source = null;
    var target = null;
    var state = "playing";
    let foundGame = false;

    await GameMove.findOne( {'gameID': gameID},
        (err, gameMove ) => {
            if(err){
                console.log(err);
            }
            else{
                if(gameMove !== null){
                    //console.log("Received move")
                    foundGame = true;
                    source = gameMove.move.source;
                    target = gameMove.move.target;

                    if (gameMove.status.state === "checkmate"){
                        state = "checkmate";
                    }
                    else if(gameMove.status.state === "tie"){
                        state = "tie";
                    }
                    else {
                        state = "playing";
                    }

                    console.log("Received move: "+ source +" "+target);             
                }
            }
        }
    );
    

    if(foundGame) {
        console.log("Received move on game:"+gameID);
        callback(null, {source: source, target: target, success: true, state: state});
    }
    else{
        console.log("Failed to receive move on game:"+gameID);
        callback(null, {success: false});
    }

}


async function checkTurn (call, callback) {
    let turn = call.request.turn;
    let gameID = call.request.gameID;

    let foundGame = false;
    let myturn = false;

    await GameMove.findOne( {'gameID': gameID},
        (err, gameMove ) => {
            if(err){
                console.log(err);
            }
            else{
                if(gameMove !== null){
                    foundGame = true;
                    if(gameMove.turn == turn){
                        myturn = true;
                    }
                    else{
                        myturn = false;
                    }             
                }     
            }
        }
    );
    

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

async function gameEnd(call, callback) {

    let username = call.request.username;
    let gameID = call.request.gameID;
    let state = call.request.state;

    if(state == "checkmate"){
        username = "stalemate";
    }

    let gameFound = false;

    let myMove = await GameMove.findOneAndUpdate( {'gameID': gameID}, {
        status: {
            state: state,
            winner: username
        }
        },
        (err, gameMove ) => {
            if(err){
                console.log(err);
            }
            else{
                gameFound = true;
                
            }
        }
    );

    if(gameFound) {
        console.log("Game ended by: "+username);
        callback(null, {success: true});
    }
    else{
        console.log("Failed to end game: "+gameID);
        callback(null, {success: false});
    }


}


// Main
const server = new grpc.Server();

// Create service from the server definition package.
server.addService(playMasterPackage.playMaster.service,
    {
        "pushMove": pushMove,
        "receiveMove": receiveMove,
        "initializeGame": initializeGame,
        "checkTurn": checkTurn,
        "gameEnd": gameEnd
    });

server.bind("play-master:6000", grpc.ServerCredentials.createInsecure());

    server.start();

    connectDb();

