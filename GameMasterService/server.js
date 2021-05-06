require("dotenv").config();

const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
// Load synchronously.
const packageDef = protoLoader.loadSync("mychat.proto", {});
// Load package definition into Object.
const grpcObject = grpc.loadPackageDefinition(packageDef);
// Create package from object.
const mychatPackage = grpcObject.myChatPackage;

// Connect to MongoDB.
const connectDb = require("./config/connection");

// Create unique game ID.
const {v4 : uuidv4} = require("uuid");




// User schema.
const User = require("./config/models/User.model");


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
    else {

        if(!matchmakingList.includes(username)){

            anonymousCount++;
            user = "user" + anonymousCount;
            matchmakingList.push(username);                         // TODO: Insert in Matchmake
    
            console.log("User " + username + " entered matchmaking");
            callback(null, {"success": true, "username": username, "text": "Matchmaking"});       
    
        } 
        else {
    
            callback(null, {"success": false, "username": username, "text": "User is already in matchmaking!"});
        }
    }
  
}


// * {string username, bool creator}
// * {bool player1, bool gameFound,string gameId}
function joinGame (call, callback) {

    let username = call.request.username;
    let gameCreator = call.request.gameCreator;


    // If you already created a game
    if(gameCreator === false){
        
        
        if(gameLobby.length !== 0){

            // Join a game                          // TODO insert concurrency
            let i = 0;
            let foundGame = false;
            let gameJoined = null;
            gameLobby.every( (game) => {
            
                if (game.player2 === null){

                    gameLobby[i].player2 = username;
                    foundGame = true;
                    gameJoined = game.gameId;
                
                    return false;                 // Stop the loop game joined
                }
                
                i++;
                return true;
            });

            if (foundGame === false){
                let gameId = createGame(username);
                console.log("All games were full, user: " + username + " created game: "+ gameId);     
                callback(null, {gameCreator: true, gameFound: false});
            }
            else {
                console.log("User: "+username+ " Joined game!");
                callback(null, {gameCreator: false, gameFound: true, gameId: gameJoined});
            }

        }
        else {

            // No games, create one
    
            let gameId = createGame(username);
    
            console.log("User: " + username + "created game: "+ gameId);     
            callback(null, {gameCreator: true, gameFound: false});
        }

    }
    else {

        // Check if someone joined your game
        gameLobby.forEach((game) => {
            
            if (game.player1 === username){

                if(game.player2 !== null){

                    // Matchmaking complete
                    console.log("User: "+ username +" found a game!");     
                    callback(null, {gameCreator: true, gameFound: true, gameId: game.gameId});    
                }
                else {
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

    
    let game = {
        gameId: uuidv4(),
        player1: username,
        player2: null,
        type: "chess"
    }

    gameLobby.push(game);                 // TODO create new document

    return game.gameId;

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

        const user1 = new User({ username: "userTest" });

        user1.save().then( () => console.log("User created") );



   

    // connectDb().then(() => {
    //     console.log("--------------MongoDB connected------------");
    // });
