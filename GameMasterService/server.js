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

            let game = await Game.updateOne( {'player2': null}, {'player2': username},
            (err, game ) => {
                if(err){
                    console.log(err);
                }
                else{
                    foundGame = true;
                    gameJoined = game.gameID;
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
                    callback(null, {gameCreator: true, gameFound: true, gameId: game.gameId}); 
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


// ? Not part of the service functions.

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




// Main
const server = new grpc.Server();

// Create service from the server definition package.
server.addService(mychatPackage.myChat.service,
    {
        "connectUser": connectUser,
        "joinGame": joinGame
    });

server.bind("game-master:5000", grpc.ServerCredentials.createInsecure());

    server.start();

    connectDb();

