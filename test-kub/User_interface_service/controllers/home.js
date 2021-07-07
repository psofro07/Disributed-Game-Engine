const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
// Load synchronously.
const packageDef = protoLoader.loadSync("gameMaster.proto", {});
// Load package definition into Object.
const grpcObject = grpc.loadPackageDefinition(packageDef);
// Create package from object.
const gameMasterPackage = grpcObject.gameMasterPackage;

const client = new gameMasterPackage.gameMaster(`${process.env.GAME_MASTER_SERVICE}:5000`, grpc.credentials.createInsecure());


exports.getHome = async (req, res, next) => {

    const username = req.session.username;
    const email = req.session.email;
    const role = req.session.role;
    var practiceScore = 0;
    var tournamentScore = 0;

    if(role === "Player"){
        await client.getScores({"username": username }, (err, response) => {

            if(err) {
                console.log(err);
            }
            else{
                if(response.success === true){
                    practiceScore = response.practiceScore;
                    tournamentScore = response.tournamentScore;
                    
                    req.session.practiceScore = practiceScore;
                    req.session.tournamentScore = tournamentScore;
                    res.render('home', { email: email, username: username, role: role, practiceScore: practiceScore, tournamentScore: tournamentScore}); 
                }
                else{
                    console.log("Could not get scores");
                }
            }
        })
    }
    else{
        res.render('home', { email: email, username: username, role: role}); 
    }
        
    
}

exports.practiceHistory = (req, res, next) => {
    
    const username = req.session.username;
    const email = req.session.email;
    const role = req.session.role;
    const practiceScore = req.session.practiceScore;
    const tournamentScore = req.session.tournamentScore 

    res.render('practiceHistory', {email: email, username: username, role: role, practiceScore: practiceScore, tournamentScore: tournamentScore});
}


exports.getPracticeHistory = async (req, res, next) => {

    const username = req.session.username;

    await client.getPracticeHistory({"username": username }, (err, response) => {

        if(err) {
            console.log(err);
        }
        else{
            if(response.success === true){

                if(response.games){
                    //console.log(response.games);
                let i = 1;
                var myRow = "";
                
                response.games.forEach( game => {
                    let gameID = game.gameID;
                    let player1 = game.player1;
                    let player2 = game.player2;
                    let player1Score = game.player1Score;
                    let player2Score = game.player2Score;
                    if(player1Score === 1){
                        player1Score = 'Won';
                        player2Score = 'Lost';
                    }
                    else if (player1Score === 0.5){
                        player1Score = 'Tie';
                        player2Score = 'Tie';
                    }
                    else{
                        player1Score = 'Lost';
                        player2Score = 'Won';
                    }
                    let Game = game.game;
                    let type = game.type;
                    let date = game.date;

                    myRow = myRow.concat(
                        '<tr>'+
                            '<th scope="row">'+i+'</th>'+
                            '<td>'+gameID+'</td>'+
                            '<td>'+player1+'</td>'+
                            '<td>'+player2+'</td>'+
                            '<td>'+player1Score+'</td>'+
                            '<td>'+player2Score+'</td>'+
                            '<td>'+Game+'</td>'+
                            '<td>'+type+'</td>'+
                            '<td>'+date+'</td>'+

                            // '<td>'+ 
                            //     '<button  type="submit" name="edit_btn" class="btn-edit">EDIT</button>'+
                            // '</td>'+
                            // '<td>'+
                            //     '<button id="'+username+'" type="submit" name="delete_btn" class="btn-delete">DELETE</button>'+
                            // '</td>'+
                        '</tr>');
                    i++;
                })

                
                res.json({success: true, data: myRow});

                } 
                else{   
                    res.json({success: false, data: "No history"});
                }
                
            }
            else{
                console.log("Could not get practice history");
            }
        }
    })


}


exports.getPractice = (req, res, next) => {

    const GET_MESSAGES_INTERVAL = 2000;
    
    var username = req.session.username;
    const gameType = req.params.gameType;   // chess or tic-tac-toe

    var gameCreator = false;
    var gameFound = false;
    var gameJoined_id = null;
    var searchCount = 0;
    
    matchmake();

    function matchmake() {

        console.log("User "+ username + " trying to connect.");

        client.connectUser({"username": username}, (err, response) => { 

            if(err) {
                console.log(err);
            }
            else {  

                if(response.success === true){
                    console.log("Connected!");
                    findGame();
                }
                else{
                    console.log(response.text);
                    res.redirect("/home");
                }
            }

        });
        
    }

    function findGame() {

        if(gameCreator === false){

            // Find a game or create one
            client.joinGame({"username": username, "gameCreator": gameCreator, "gameType": gameType}, (err, response) => {

                if(err){
                    console.log(err);
                }
                else {

                    if( response.gameFound === false){
                        console.log("There were no available games so I created one.");
                        gameCreator = response.gameCreator; // true
                        setTimeout(() => {findGame();}, GET_MESSAGES_INTERVAL );
                    }
                    else {
                        console.log("User "+username+ " found game! Recieved from server: "+ JSON.stringify(response));
                        gameFound = response.gameFound; // true
                        gameJoined_id = response.gameId;
                        req.session.play = 'practice';
                        req.session.player = 'player2';
                        req.session.gameID = gameJoined_id;
                        res.redirect('/game/'+gameType);
                        
                        
                    }
                }
        
            });
        }
        else{

            // Waiting for a player to join my game.
            client.joinGame({"username": username, "gameCreator": gameCreator, "gameType": gameType}, (err, response) => {
                
                console.log("Waiting for a player to join my game.");

                if(response.gameFound === false){
                    //console.log("No one joined my game yet");
                    setTimeout(() => {
                        if(searchCount < 10){
                            console.log("Waiting...");
                            searchCount = searchCount + 1;
                            findGame();                         
                        }
                        else{
                            //client.close();
                            console.log("Server timed out.");
                            console.log("No available games found at this time try again later.");
                            client.deleteGame({"username": username}, (err, response) => {});
                            res.redirect("/home");
                        }
                    }, GET_MESSAGES_INTERVAL);
                }
                else {

                    gameFound = response.gameFound; // true
                    gameJoined_id = response.gameId;

                    console.log("Game found! Recieved from server: "+ JSON.stringify(response));
                    gameFound = response.gameFound; // true
                    gameJoined_id = response.gameId;
                    req.session.play = 'practice';
                    req.session.player = 'player1';
                    req.session.gameID = gameJoined_id;
                    res.redirect('/game/'+gameType);
                }  
            
            });    
            
        }
    
    }

    
}


exports.tournamentHistory = (req, res, next) => {
    
    const username = req.session.username;
    const email = req.session.email;
    const role = req.session.role;
    const practiceScore = req.session.practiceScore;
    const tournamentScore = req.session.tournamentScore 

    res.render('tournamentHistory', {email: email, username: username, role: role, practiceScore: practiceScore, tournamentScore: tournamentScore});
}


exports.getTournamentHistory = async (req, res, next) => {

    await client.getTournamentHistory({}, (err, response) => {

        if(err) {
            console.log(err);
        }
        else{
            if(response.success === true){

                if(response.games){
                    //console.log(response.games);
                    let i = 1;
                    var myRow = "";
                    
                    response.games.forEach( game => {
                        let gameID = game.gameID;
                        let player1 = game.player1;
                        let player2 = game.player2;
                        let player1Score = game.player1Score;
                        let player2Score = game.player2Score;
                        if(player1Score === 1){
                            player1Score = 'Won(+'+game.player1Score+' points)';
                            if(game.round === 'normal'){
                                player2Score = 'Lost(-'+game.player2Score+' points)';
                            }
                            else{
                                player2Score = 'Lost(+'+game.player2Score+' points)';
                            }
                            
                        }
                        else if (player1Score === 0.5){
                            player1Score = 'Tie';
                            player2Score = 'Tie';
                        }
                        else{
                            if(game.round === 'normal'){
                                player1Score = 'Lost(-'+game.player1Score+' points)';
                            }
                            else{
                                player1Score = 'Lost(+'+game.player1Score+' points)';
                            }
                            
                            player2Score = 'Won(+'+game.player2Score+' points)';
                        }
                        let Game = game.game;
                        let type = game.type;
                        let name = game.name;
                        let round = game.round;
                        let date = game.date;

                        myRow = myRow.concat(
                            '<tr>'+
                                '<th scope="row">'+i+'</th>'+
                                '<td>'+gameID+'</td>'+
                                '<td>'+player1+'</td>'+
                                '<td>'+player2+'</td>'+
                                '<td>'+player1Score+'</td>'+
                                '<td>'+player2Score+'</td>'+
                                '<td>'+Game+'</td>'+
                                '<td>'+type+'</td>'+
                                '<td>'+name+'</td>'+
                                '<td>'+round+'</td>'+
                                '<td>'+date+'</td>'+
                            '</tr>');
                        i++;
                    })

                    
                    res.json({success: true, data: myRow});

                } 
                else{   
                    res.json({success: false, data: "No history"});
                }
                
            }
            else{
                console.log("Could not get tournament history");
            }
        }
    })


}