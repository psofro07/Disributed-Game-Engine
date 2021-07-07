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

const clientGM = new gameMasterPackage.gameMaster(`${process.env.GAME_MASTER_SERVICE}:5000`, grpc.credentials.createInsecure());


exports.getLeaderboards = (req, res, next) => {

    var type = req.params.type;

    clientGM.leaderboards({}, (err, response) => {
        if(err) {
            console.log(err);
        }
        else {  
            //console.log(response.tourList);
            if(response.success === true){

                if(response.playerList){
                    //console.log(response.tourList);
                    let i = 1;
                    var myRow = "";

                    if(type === 'Practice'){
                        response.playerList.forEach( player => {
                            let username = player.username;
                            let practiceScore = player.practiceScore;
    
                            myRow = myRow.concat(
                                '<tr>'+
                                    '<th scope="row">'+i+'</th>'+
                                    '<td>'+username+'</td>'+
                                    '<td>'+practiceScore+'</td>'+
                                '</tr>');
                            i++;
                            
                        })
                    }
                    else if(type === 'Tournament'){
                        response.playerList.forEach( player => {
                            let username = player.username;
                            let tournamentScore = player.tournamentScore;
    
                            myRow = myRow.concat(
                                '<tr>'+
                                    '<th scope="row">'+i+'</th>'+
                                    '<td>'+username+'</td>'+
                                    '<td>'+tournamentScore+'</td>'+
                                '</tr>');
                            i++;
                            
                        })
                    }
                    else{
                        console.log('Something wrong with url parameter');
                    }
                    

                
                    res.json({success: true, data: myRow});

                } 
                else{   
                    res.json({success: false, data: "There should be leaderboards if you 've reached this far"});
                }
                
            }
            else{
                console.log("Could not get leaderboards list");
            }
            
        }
    })

}



exports.leaderboards = (req, res, next) => {

    const role = req.session.role;
    const username = req.session.username;
    const practiceScore = req.session.practiceScore;
    const tournamentScore = req.session.tournamentScore;
    const type = req.params.type;

    res.render('leaderboards', { role: role, username: username, practiceScore: practiceScore, tournamentScore: tournamentScore, type: type });

}




