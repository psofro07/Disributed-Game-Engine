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

const TournamentPlayers = require('./config/models/tournamentPlayers');

const maxPlayers = 4;

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
                let gameID = await createGame(username, "practice", '');
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
            let gameID = await createGame(username, "practice", '');
    
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
            const type = game.type;

            //delete the game
            await Game.destroy({ where: {gameID: game.gameID}}, { transaction: t });

            // If the execution reaches this line, no errors were thrown.
            // We commit the transaction.
            
            //remove players from matchmaking list
            await removePlayers(gameID, player1, player2);

            if(type === 'prcatice'){
                await updateScorePractice(player1, player2, score1, score2);
            }

            await t.commit();

            callback(null, {success: true});

        }catch(error) {

            console.log(error);
            // If the execution reaches this line, an error was thrown.
            // We rollback the transaction.
            await t.rollback();
            callback(null, {success: false});

        }
    }

}


async function leaderboards(call, callback){

    try{
        const players = await PlayerScore.findAll();                                
         
        var playerList = [];
        players.forEach( player => {
            playerList.push({
                username: player.username,
                practiceScore: player.practiceScore,
                tournamentScore: player.tournamentScore,
            })
        });

        //console.log(tourList);  
        callback(null, {success: true, playerList: playerList});
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
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


async function deletePlayer(call, callback){

    const username = call.request.username;

    try{

        await PlayerScore.destroy({where: {username: username}});
        console.log("User "+username+" removed from Game Master");
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


async function getPlayerStatus(call, callback){

    const username = call.request.username;

    try {
        
        const player = await TournamentPlayers.findOne({where: {username: username}});

        if(player !== null){
            const tour = await Tournament.findOne({where: {tournID: player.tournID}});
            callback(null, {success: true, status: player.status, tournID: player.tournID, tournStatus: tour.status});
        }
        else{
            callback(null, {success: true, status: '', tournID: '', tournStatus: ''});
        }
        
        
    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }
}


async function createTournament(call, callback){
    const gameType = call.request.gameType;
    const username = call.request.username;

    try {
        const newTournament = await Tournament.create(
        {
            tournID: uuidv4(),
            official: username,
            type: gameType
        });

        console.log("Created a Tournament with ID: "+newTournament.tournID);
        callback(null, {success: true, tournID: newTournament.tournID, name: newTournament.name});

    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }

}


async function deleteTournament(call, callback){

    const tournID = call.request.tournID;

    try {

        const tour = await Tournament.findOne({where: {tournID: tournID}});
        await tour.destroy();
        console.log("Deleted a Tournament with ID: "+tour.tournID);

        await TournamentPlayers.destroy({where: {tournID: tournID}});
        console.log("Removed all players from this tournament");

        callback(null, {success: true});

    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }

}


async function getTournamentList(call, callback){

    try{
        const tournaments = await Tournament.findAll();
                                
         
        var tourList = [];
        tournaments.forEach( tour => {
            tourList.push({
                tournID: tour.tournID,
                name: tour.name,
                official: tour.official,
                playersJoined: tour.playersJoined,
                status: tour.status,
                type: tour.type
            })
        });
        //console.log(tourList);  
        callback(null, {success: true, tourList: tourList});
    }
    catch(error){
        console.log(error);
        callback(null, {success: false});
    }

}


async function joinTournament(call, callback){          //TODO: Concurrency

    const username = call.request.username;
    const tournID = call.request.tournID;

    try {
        
        await TournamentPlayers.create({
            username: username,
            tournID: tournID,
        })

        const tour =  await Tournament.findOne({where: {tournID: tournID}});

        await tour.update({playersJoined: tour.playersJoined+1});

        if(tour.playersJoined === maxPlayers){
            let i;
            for (i = 0; i < maxPlayers/2; i++) {
                await createGame(null, 'tournament', tour.tournID);
            }
            
            await tour.update({status: "full"});
        }
          
        callback(null, {success: true});
              
    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }

}


async function leaveTournament(call, callback){          //TODO: Concurrency

    const username = call.request.username;
    const tournID = call.request.tournID;

    try {
        
        await TournamentPlayers.destroy({where: {username: username}});

        const tour =  await Tournament.findOne({where: {tournID: tournID}});

        await tour.update({playersJoined: tour.playersJoined-1});

        if(tour.playersJoined !== maxPlayers){
            await tour.update({status: "joinable"});
            await Game.destroy({where: {tournID: tournID}});
        }
          
        callback(null, {success: true});
              
    } 
    catch (err) {
        console.log(err);
        callback(null, {success: false});
    }

}


async function tournamentMatchmake(call, callback){          //TODO: Concurrency

    const username = call.request.username;
    const tournID = call.request.tournID;


    const t = await sequelize.transaction();

    try {

        const game = await Game.findOne({
            where: sequelize.and(
                { tournID: tournID }, 
                    sequelize.or(
                        { player1: null },
                        { player2: null }
                    )
            )
        });

        if(game !== null){
            if(game.player1 === null){
                await game.update({player1: username}, { transaction: t })
            }
            else{
                await game.update({player2: username}, { transaction: t })
            }

            await t.commit();

            const playerNumber = await getPlayerNumber(game.gameID, username);
            //console.log(playerNumber);
            callback(null, {success: true, gameID: game.gameID, playerNumber: playerNumber});
        }
        else{
            callback(null, {success: false});
        }
              
    } 
    catch (err) {
        await t.rollback();
        console.log(err);
        callback(null, {success: false});
    }

}


async function getPlayerNumber(gameID, username){

    try {
        const game = await Game.findOne({where: {gameID: gameID}});

        if(username === game.player1){
            return 'player1';
        }
        else{
            return 'player2';
        }
    }
    catch(error) {
        console.log(error);
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
async function createGame (username, type, tournID) {

    var newGame;

    if(type === 'tournament'){
        newGame = await Game.create({gameID: uuidv4(), player1: username, game: "chess", player1Score: 0, player2Score: 0 , type: type, tournID: tournID}); 
    }
    else{
        newGame = await Game.create({gameID: uuidv4(), player1: username, game: "chess", player1Score: 0, player2Score: 0 , type: type}); 
    }
    
        
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
        "deleteGame": deleteGame,
        "getOpponent": getOpponent,
        "deletePlayer": deletePlayer,
        "joinTournament": joinTournament,
        "getTournamentList": getTournamentList,
        "leaveTournament": leaveTournament,
        "getPlayerStatus": getPlayerStatus,
        "deleteTournament": deleteTournament,
        "leaderboards": leaderboards,
        "tournamentMatchmake": tournamentMatchmake
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
            TournamentPlayers.truncate();
            Tournament.truncate();
            Tournament.create(
                {
                    tournID: uuidv4(),
                    official: 'Thanos',
                    type: 'chess'
            });
            Tournament.create(
                {
                    tournID: uuidv4(),
                    official: 'Thanos',
                    type: 'chess'
            });
        })
        .then( () => {
            
            server.bind("game-master:5000", grpc.ServerCredentials.createInsecure());

            //start the server
            server.start();
        })
        .catch(err => {
            console.log(err);
        })

