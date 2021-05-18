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

    clientGM.createTournament({"gameType": gameType, "username": username}, (err, response) => {
        if(err) {
            console.log(err);
            return
        }
        else {  

            if(response.success === true){
                //console.log(response.name);
                //const url = '/tournament/'+response.tournID+'?name='+response.name;
                //console.log(response.tournID);
                res.redirect('tournamentList');
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


exports.getPlayers = (req, res, next) => {
    
    const tournID = req.body.tournID;

    clientGM.getPlayers({"tournID": tournID}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){
                //console.log(response.players);
                
                res.json({success: true, players: response.players});

            }
            else{
                console.log("Failed to fetch tournament players");
                res.json({success: false});
                //res.render('/')
            }
        }
    });
}


exports.joinTournament = (req, res, next) => {
    
    const username = req.session.username;

    clientGM.joinTournament({"username": username}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){
                //console.log(response.name);
                const url = '/tournament/'+response.tournID+'?name='+response.name;
                //console.log(response.tournID);
                res.redirect(url);

            }
            else{
                console.log("Could not connect to a tournament");
                res.redirect('/');
            }
        }
    });

}
    