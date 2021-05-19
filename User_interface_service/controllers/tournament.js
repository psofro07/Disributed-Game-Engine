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
                                    '<td>'+playersJoined+'/8</td>'+
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
                                    '<td>'+playersJoined+'/8</td>'+
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

    clientGM.getPlayerStatus({"username": username}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  

            if(response.success === true){

                res.json({status: response.status, tournID: response.tournID});

            }
            else{
                
                console.log("Could not get player status");
            }
        }
    })

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
    