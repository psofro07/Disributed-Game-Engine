require("dotenv").config();

// ------------------- GRPC --------------------------------------//
const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
// Load synchronously.
const packageDef = protoLoader.loadSync("gameMaster.proto", {});
// Load package definition into Object.
const grpcObject = grpc.loadPackageDefinition(packageDef);
// Create package from object.
const gameMasterPackage = grpcObject.gameMasterPackage;



// Create unique game ID.
const {v4 : uuidv4} = require("uuid");

// ------------------- GRPC --------------------------------------//

// ------------------ postgresSQLDB ------------------------------------//
const sequelize = require('./config/connection');

const Game = require('./config/models/Game.model');


// ------------------ postgresSQLDB------------------------------------//


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

    var username = call.request.username;
    var gameCreator = call.request.gameCreator;


    // If you already created a game
    if(gameCreator === false){
        
        
        if(gameLobby.length !== 0){

            // Join a game                          // TODO insert concurrency

            Game.findOne({where: { player2: null } })
                .then(game => {
                    if(!game){
                        let gameID = createGame(username);
                        console.log("All games were full, user: " + username + " created game: "+ gameID);     
                        callback(null, {gameCreator: true, gameFound: false});  
                    }
                    else{
                        game.update({
                            player2: username
                        })
                        gameJoined = game.gameID;
                        console.log("User: "+username+ " Joined game!");
                        callback(null, {gameCreator: false, gameFound: true, gameId: gameJoined});
                    }
                })
                .catch(err => {
                    console.log(err);
                })

        }
        else {

            // No games, create one
            let gameID = createGame(username);
    
            console.log("User: " + username + " created game: "+ gameID); 
            callback(null, {gameCreator: true, gameFound: false});
        }

    }
    else{

        // Check if someone joined your game
        Game.findOne({where: {player1: username}})
            .then(game => {
                if(game){
                    // Matchmaking complete
                    console.log("User: "+ username +" found a game!");     
                    callback(null, {gameCreator: true, gameFound: true, gameId: game.gameID}); 
                }
                else{
                    // No opponent found yet
                    console.log("Game not found for: "+username +" yet.");
                    callback(null, {gameCreator: true, gameFound: false});
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
}


async function createGame (username) {

    
    let game = new Game ({
        gameID: uuidv4(),
        player1: username,
        type: "chess"
    });

    gameLobby.push(game);

   await Game.create({
            gameID: uuidv4(),
            player1: username,
            player1Score: 0,
            player2Score: 0,
            type: "chess"
         })
        .then(result => {
            console.log("Game created with ID: "+result.gameID);
            return result.gameID;
        })
        .catch( err => {
            console.log(err);
        });

}


// Main
const server = new grpc.Server();

// Create service from the server definition package.
server.addService(gameMasterPackage.gameMaster.service,
    {
        "connectUser": connectUser,
        "joinGame": joinGame
    });

    //connect to db
    sequelize
        .sync()
        .then( () => {
            try {
                sequelize.authenticate();
                console.log('Connection has been established successfully with database.');
              } catch (error) {
                console.error('Unable to connect to the database:', error);
              }
        })
        .then( () => {
            
            server.bind("game-master:5000", grpc.ServerCredentials.createInsecure());

            //start the server
            server.start();
        })
        .catch(err => {
            console.log(err);
        })

