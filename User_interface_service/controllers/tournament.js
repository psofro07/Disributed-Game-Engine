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

    clientGM.createTournament({"gameType": gameType}, (err, response) => {
        if(err) {
            console.log(err);
            return
        }
        else {  

            if(response.success === true){
                console.log("GameMaster created a tournament!");
                let url = '/tournament/'+response.tournID;
                console.log(response.tournID);
                res.redirect(url);
            }
            else{
                console.log("Playmaster failed to create a Tournament");
                res.render('/')
            }
        }
    });

}

exports.tournamentLobby = (req, res, next) => {

    const tournID = req.params.tournID;
    const role = req.session.role;

    res.render('tournament', {tournID: tournID, role: role});

}

exports.getPlayers = (req, res, next) => {
    
    const tournID = req.body.tournID;

    clientGM.getPlayers({"tournID": tournID}, (err, response) => {
        if(err) {
            console.log(err);
            return
        }
        else {  

            if(response.success === true){
                console.log("Returned all players!");
                //let url = '/tournament/'+response.tournID;
                let players = response.players[0];
                
                res.json({success: true, players: response.players});
                //res.redirect(url);
            }
            else{
                console.log("Failed to fetch tournament players");
                res.json({success: false});
                //res.render('/')
            }
        }
    });
}
    