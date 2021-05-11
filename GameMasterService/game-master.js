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

const Game = require('./config/models/game');

const Player = require('./config/models/player');


// ------------------ postgresSQLDB------------------------------------//



// Check if the user exists in matchmaking 
// * {string: username}
// * {bool: success, string: username, string: text}
async function connectUser (call, callback) {

    let username = call.request.username;

    if(typeof(username) === "undefined"){
        callback(null, {"success": false, "username": username, "text": "Invalid User"});
    }
    else{
        const exists = await Player.findOne({where: {username: username}});
        if(exists === null){
            console.log("User " + username + " entered matchmaking");
            const player = await Player.create({username: username, status: 'searching'}); 
            callback(null, {"success": true, "username": username, "text": "Matchmaking"});   
        } 
        else{
            if(exists.status === 'searching'){
                callback(null, {"success": false, "username": username, "text": "User "+username+" is already in matchmaking!"});
            }
            else{
                callback(null, {"success": false, "username": username, "text": "User "+username+" is in a game!"});
            }
            
        }
    }
  
}

// async function remove(call, callback){

// }


// * {string username, bool creator}
// * {bool player1, bool gameFound,string gameId}
async function joinGame (call, callback) {

    var username = call.request.username;
    var gameCreator = call.request.gameCreator;


    // If you already created a game
    if(gameCreator === false){
        
        const exists = await Game.findOne();

        if(exists){

            // Join a game                          // TODO insert concurrency

            const game = await Game.findOne({where: { player2: null } });

            if(!game){
                let gameID = await createGame(username);
                console.log("All games were full, user: " + username + " created game: "+ gameID);     
                callback(null, {gameCreator: true, gameFound: false});  
            }
            else{
                await game.update({
                    player2: username
                })
                gameJoined = game.gameID;
                console.log("User: "+username+ " Joined game!");
                const player = await Player.update({status: 'in game'}, {where: {username: username}});
                callback(null, {gameCreator: false, gameFound: true, gameId: gameJoined});
            }
               
        }
        else {

            // No games, create one
            let gameID = await createGame(username);
    
            console.log("User: " + username + " created game: "+ gameID); 
            callback(null, {gameCreator: true, gameFound: false});
        }

    }
    else{

        // Check if someone joined your game
        let game = await Game.findOne({where: {player1: username}})

        if(game.player2 === null){
            // No opponent found yet
            console.log("Game not found for: "+username +" yet.");
            callback(null, {gameCreator: true, gameFound: false});
        }
        else{
            // Matchmaking complete
            console.log("User: "+ username +" found a game!");
            const player = await Player.update({status: 'in game'}, {where: {username: username}});     
            callback(null, {gameCreator: true, gameFound: true, gameId: game.gameID}); 
        }
            
    }
}


async function createGame (username) {

    const newGame = await Game.create({gameID: uuidv4(), player1: username, type: "chess", player1Score: 0, player2Score: 0 }); 
        
    console.log("Game created with ID: "+newGame.gameID);
    return newGame.gameID;
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
            }
            catch (error) {
                console.error('Unable to connect to the database:', error);
            }
        })
        .then( () => {
            Game.truncate();
            Player.truncate();
        })
        .then( () => {
            
            server.bind("game-master:5000", grpc.ServerCredentials.createInsecure());

            //start the server
            server.start();
        })
        .catch(err => {
            console.log(err);
        })

