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

const PlayerScore = require('./config/models/score');

const GameHistory = require('./config/models/history');

const Tournament = require('./config/models/tournament');

const maxPlayers = 8;

// ------------------ postgresSQLDB------------------------------------//



// Check if the user exists in matchmaking 
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

//delete game after the timeout for matchmaking has been reached
async function deleteGame(call, callback){

    const username = call.request.username;

    try {
        const game = await Game.findOne({where: { player1: username } });

        await Game.destroy({ where: {gameID: game.gameID}});

        await removePlayer(username);
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }

}

//return the name of the opponent for a play
async function getOpponent(call, callback){

    const username = call.request.username;
    const gameID = call.request.gameID;

    try {
        const game = await Game.findOne({where: { gameID: gameID } });
        let opponentUsername = game.player1;
        if(game.player1 === username){
            opponentUsername = game.player2;
        }
        
        callback(null, {success: true, opponentUsername: opponentUsername});
        
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }

}


//return the score of a play and save it into the GameList table of the SQL db
async function saveScore(call, callback){

    const username = call.request.username;
    const gameID = call.request.gameID;
    const score = call.request.score;

    try {
        const game = await Game.findOne({where: { gameID: gameID } });

        //im player 1
        if(game.player1 === username){
            await Game.update({player1Score: score}, {where: {gameID: gameID}});
            callback(null, {success: true});
        }
        //im player 2
        else{
            await Game.update({player2Score: score}, {where: {gameID: gameID}});
            callback(null, {success: true});
        }
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }
    
}


//try to join an already existing play or create one
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
                let gameID = await createGame(username, "practice");
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
            let gameID = await createGame(username, "practice");
    
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



//after the end of a play move the game from the GameList table and into the GameHistory table
async function gameHistory(call, callback) {

    const gameID = call.request.gameID;

    const game = await Game.findOne({where: { gameID: gameID } });

    if(!game){
        console.log("Game could not be found.");
        callback(null, {success: false});
    }
    else{
        // First, we start a transaction and save it into a variable
        const t = await sequelize.transaction();

        try {

            // Then, we do some calls passing this transaction as an option:

            const result = await GameHistory.create({
                gameID: game.gameID,
                player1: game.player1,
                player2: game.player2,
                player1Score: game.player1Score,
                player2Score: game.player2Score,
                game: game.game,
                type: game.type
            }, { transaction: t });

            const player1 = game.player1;
            const player2 = game.player2;
            const score1 = game.player1Score;
            const score2 = game.player2Score;

            //delete the game
            await Game.destroy({ where: {gameID: game.gameID}}, { transaction: t });

            // If the execution reaches this line, no errors were thrown.
            // We commit the transaction.
            
            //remove players from matchmaking list
            await removePlayers(gameID, player1, player2);

            await updateScorePractice(player1, player2, score1, score2);

            await t.commit();

            callback(null, {success: true});

        } catch (error) {

            console.log(error);
            // If the execution reaches this line, an error was thrown.
            // We rollback the transaction.
            await t.rollback();
            callback(null, {success: false});

        }
    }

}

//after user registration initialize a score for the given username in SQL
async function savePlayer(call, callback){

    const username = call.request.username;

    try{

        await PlayerScore.create({
            username: username
        })
        console.log("User added to Game Master");
        callback(null, {success: true});
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }

}

//return the scores (practice and tournament) for a given player
async function getScores(call, callback){

    const username = call.request.username;

    try{
        const player = await PlayerScore.findOne({where: {username: username}});

        callback(null, {success: true, practiceScore: player.practiceScore, tournamentScore: player.tournamentScore});
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }
}

//return the practice history of the plays for a given user
async function getPracticeHistory(call, callback){

    const username = call.request.username;

    try{
        const games = await GameHistory.findAll({
                                where: sequelize.and(
                                    { type: "practice" }, 
                                    sequelize.or(
                                        { player1: username },
                                        { player2: username }
                                    )
                                )
                            });
         
        var gameList = [];
        games.forEach( game => {
            gameList.push({
                gameID: game.gameID,
                player1: game.player1,
                player2: game.player2,
                player1Score: game.player1Score,
                player2Score: game.player2Score,
                game: game.game,
                type: game.type,
                date: game.createdAt
            })
        });
        //console.log(gameList);  
        callback(null, {success: true, games: gameList});
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }
}


async function createTournament (call, callback){
    var gameType = call.request.gameType;

    try {
        const newTournament = await Tournament.create(
        {
            tournID: uuidv4(),
            player1: "empty",
            player2: "empty",
            player3: "empty",
            player4: "empty",
            player5: "empty",
            player6: "empty",
            player7: "empty",
            player8: "empty",
            type: "chess"
        });

        console.log("Created a Tournament with ID: "+newTournament.tournID);
        callback(null, {success: true, tournID: newTournament.tournID});

    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }

}


async function getPlayers (call, callback){

    var tournID = call.request.tournID;

    const getTournament = await Tournament.findOne({ where: {tournID: tournID}});

    try {
        // let players = {
        //     player1: getTournament.dataValues.player1,
        //     player2: getTournament.dataValues.player2,
        //     player3: getTournament.dataValues.player3,
        //     player4: getTournament.dataValues.player4,
        //     player5: getTournament.dataValues.player5,
        //     player6: getTournament.dataValues.player6,
        //     player7: getTournament.dataValues.player8,
        //     player8: getTournament.dataValues.player9,
        // }

        console.log("Fetching all players");
        callback(null, {players: players, success: true});

    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }

}

//update the score after each play for both users
async function updateScorePractice(player1, player2, score1, score2){

    try {

        //for player1
        let player = await PlayerScore.findOne({where: {username: player1}});
        let score = player.practiceScore + score1;

        await PlayerScore.update({practiceScore: score} , {where: {username: player1}});
        console.log("Updated practice score for "+player1);


        //for player2
        player = await PlayerScore.findOne({where: {username: player2}});
        score = player.practiceScore + score2;

        await PlayerScore.update({practiceScore: score} , {where: {username: player2}});
        console.log("Updated practice score for "+player2);

    }
    catch(error){
        console.log(error);
    }
    
}

//remove the players from mathcmaking (after end of a play)
async function removePlayers(gameID, player1, player2) {

    try {
        await Player.destroy({where: {username: player1}});
        await Player.destroy({where: {username: player2}});

        console.log("Removed players from matchmaking list");
    }
    catch(error){
        console.log(error);
    }
    
}

//remove a single player from the matchmaking list after timeout is reached
async function removePlayer(player1) {

    try {
        await Player.destroy({where: {username: player1}});

        console.log("Removed player "+player1+" from matchmaking list");
    }
    catch(error){
        console.log(error);
    }
    
}

//create the game if none exists
async function createGame (username, type) {

    const newGame = await Game.create({gameID: uuidv4(), player1: username, game: "chess", player1Score: 0, player2Score: 0 , type: type}); 
        
    console.log("Game created with ID: "+newGame.gameID);
    return newGame.gameID;
}


// Main
const server = new grpc.Server();

// Create service from the server definition package.
server.addService(gameMasterPackage.gameMaster.service,
    {
        "connectUser": connectUser,
        "joinGame": joinGame,
        "saveScore": saveScore,
        "gameHistory": gameHistory,
        "savePlayer": savePlayer,
        "getScores": getScores,
        "getPracticeHistory": getPracticeHistory,
        "createTournament": createTournament,
        "getPlayers": getPlayers,
        "deleteGame": deleteGame,
        "getOpponent": getOpponent
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
            Tournament.truncate();
        })
        .then( () => {
            
            server.bind("game-master:5000", grpc.ServerCredentials.createInsecure());

            //start the server
            server.start();
        })
        .catch(err => {
            console.log(err);
        })

