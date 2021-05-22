const express = require('express');

const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
const { render } = require("ejs");
// Load synchronously.
const packageDefGM = protoLoader.loadSync("gameMaster.proto", {});
// Load package definition into Object.
const grpcObjectGM = grpc.loadPackageDefinition(packageDefGM);

// Create package from object.
const gameMasterPackage = grpcObjectGM.gameMasterPackage;

const clientGM = new gameMasterPackage.gameMaster("game-master:5000", grpc.credentials.createInsecure());

exports.createTournament = (req, res, next) => {

    const gameType = req.params.gameType;
    const username = req.session.username;

    clientGM.createTournament({"gameType": "chess", "username": username}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){
                res.redirect('/tournamentList');
            }
            else{
                console.log("GameMaster failed to create a Tournament");
                res.redirect('/');
            }
        }
    });

}


exports.tournamentList = (req, res, next) => {

    const name = req.query.name;
    const role = req.session.role;
    const username = req.session.username;
    const practiceScore = req.session.practiceScore;
    const tournamentScore = req.session.tournamentScore;

    res.render('tournament', { role: role, name: name, username: username, practiceScore: practiceScore, tournamentScore: tournamentScore });

}


exports.getTournamentList = (req, res, next) => {

    clientGM.getTournamentList({}, (err, response) => {

        if(err) {
            console.log(err);
        }
        else{
            //console.log(response.tourList);
            if(response.success === true){

                if(response.tourList){
                    //console.log(response.tourList);
                    let i = 1;
                    var myRow = "";
                    var btn = req.body.button;
                    
                    response.tourList.forEach( tour => {
                        let tournID = tour.tournID;
                        let name = tour.name;
                        let official = tour.official;
                        let playersJoined = tour.playersJoined;
                        let status = tour.status;
                        let type = tour.type;

                        if(req.session.role === 'Official'){
                            myRow = myRow.concat(
                                '<tr>'+
                                    '<th scope="row">'+i+'</th>'+
                                    '<td style="display:none;">'+tournID+'</td>'+
                                    '<td>'+name+'</td>'+
                                    '<td>'+official+'</td>'+
                                    '<td>'+playersJoined+'/4</td>'+
                                    '<td>'+status+'</td>'+
                                    '<td>'+type+'</td>'+
                                    '<td>'+ 
                                        '<button id="'+tournID+'" type="submit" name="delete_btn" class="btn-delete">delete</button>'+
                                    '</td>'+
                                '</tr>');
                        }
                        else{

                            myRow = myRow.concat(
                                '<tr>'+
                                    '<th scope="row">'+i+'</th>'+
                                    '<td style="display:none;">'+tournID+'</td>'+
                                    '<td>'+name+'</td>'+
                                    '<td>'+official+'</td>'+
                                    '<td>'+playersJoined+'/4</td>'+
                                    '<td>'+status+'</td>'+
                                    '<td>'+type+'</td>'+
                                    '<td>'+ 
                                        '<button id="'+tournID+'" type="submit" name="join_btn" class="btn-join">'+btn+'</button>'+
                                    '</td>'+
                                '</tr>');
                        }
                        
                        i++;
                    })

                
                res.json({success: true, data: myRow});

                } 
                else{   
                    res.json({success: false, data: "No tournaments...yet"});
                }
                
            }
            else{
                console.log("Could not get tournament list");
            }
        }
    })
}


exports.joinTournament = (req, res, next) => {
    
    const username = req.session.username;
    const tournID = req.body.tournID;

    clientGM.joinTournament({"username": username, "tournID": tournID}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){
                console.log('Joined tournament');

                //console.log(response.tournID);
                res.json({success: true});

            }
            else{
                console.log("Could not connect to a tournament");
                res.json({success: false, data: "Could not connect to a tournament"});
            }
        }
    });

}


exports.leaveTournament = (req, res, next) => {
    
    const username = req.session.username;
    const tournID = req.body.tournID;

    clientGM.leaveTournament({"username": username, "tournID": tournID}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){
                console.log('Left tournament');

                //console.log(response.tournID);
                res.json({success: true});

            }
            else{
                console.log("Could not leave the tournament");
                res.json({success: false, data: "Could not leave the tournament"});
            }
        }
    });

}


exports.refreshTournamentList = (req, res, next) => {
    
    const username = req.session.username;

    if(req.session.role === 'Official'){
        
        res.json({role: req.session.role});
    }
    else{

        clientGM.getPlayerStatus({"username": username}, (err, response) => {
            if(err) {
                console.log(err);
            }
            else {  
    
                if(response.success === true){
                    
                    res.json({role: req.session.role, status: response.status, tournID: response.tournID, tournStatus: response.tournStatus});
    
                }
                else{
                    
                    console.log("Could not get player status");
                }
            }
        })
    }

    

}


exports.deleteTournament = (req, res, next) => {
    
    const tournID = req.body.tournID;

    clientGM.deleteTournament({"tournID": tournID}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){

                res.json({success: true});

            }
            else{
                console.log("Could not delete the tournament");
            }
        }
    });

}


exports.tournamentMatchmake = (req, res, next) => {
    
    const GET_MESSAGES_INTERVAL = 2000;
    const username = req.session.username;
    const tournID = req.params.tournID;
    var gameCreator = false;
    var gameFound = false;

    findGame();
    
    function findGame() {

        if(gameCreator === false){

            // Find a game or create one
            clientGM.joinGameTournament({"gameCreator": gameCreator , "tournID": tournID, "username": username}, (err, response) => {

                if(err){
                    console.log(err);
                }
                else {

                    if( response.gameFound === false && response.success === true ){
                        console.log("There were no available games so I created one "+username);
                        gameCreator = true; // true
                        findGame();
                    }
                    else if(response.gameFound === true && response.success === true) {
                        console.log("User "+username+ " found game! Recieved from server: "+response.gameId);
                        gameFound = response.gameFound; // true
                        gameJoined_id = response.gameId;
                        req.session.play = 'tournament';
                        req.session.player = 'player2';
                        req.session.gameID = gameJoined_id;
                        res.redirect('/game/chess');  
                    }
                    else if(response.success === false){
                        setTimeout(function(){
                            findGame();
                        }, 1000);
                    }
                }
        
            });
        }
        else{

            // Waiting for a player to join my game.
            clientGM.joinGameTournament({"gameCreator": gameCreator , "tournID": tournID, "username": username}, (err, response) => {
                
                console.log("Waiting for a player to join my game: "+req.session.username);

                if(response.gameFound === false && response.success === true ){
                    console.log("No one joined my game yet "+username);
                    setTimeout(() => {findGame();}, GET_MESSAGES_INTERVAL);
                }
                else if(response.gameFound === true && response.success === true) {

                    console.log("User "+username+ " found game! Recieved from server: "+response.gameId);
                    gameFound = response.gameFound; // true
                    gameJoined_id = response.gameId;
                    req.session.play = 'tournament';
                    req.session.player = 'player1';
                    req.session.gameID = gameJoined_id;
                    res.redirect('/game/chess');
                }
                else if(response.success === false){
                    setTimeout(function(){
                        findGame();
                    }, 1000);
                }  
            
            });    
            
        }
    
    }

}



exports.continueTournament = (req, res, next) => {

    const username = req.session.username;

    waitForPlayers();

    function waitForPlayers(){

        clientGM.continueTournament({"username": username}, (err, response) => {
            if(err){
                console.log(err)
            }
            else{

                if(response.success === true && response.finished === true){
                    res.redirect('/tournamentMatchmake/'+response.tournID);
                }
                else if(response.success === true && response.finished === false){
                    setTimeout(function(){
                        console.log('waiting...');
                        waitForPlayers();
                    }, 2000);
                }
                else{
                    console.log('Could not continue tournament');
                }

            }
        })

    }

}