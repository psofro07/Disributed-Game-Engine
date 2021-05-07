exports.getHome = (req, res, next) => {
    const username = req.session.username;
    const email = req.session.email;
    const role = req.session.role;

    res.render('home', { email: email, username: username, role: role}); 
}

exports.getPractice = (req, res, next) => {
    const grpc = require("grpc");
    // protoLoader used for compilation of proto file into JS.
    const protoLoader = require("@grpc/proto-loader");
    // Load synchronously.
    const packageDef = protoLoader.loadSync("mychat.proto", {});
    // Load package definition into Object.
    const grpcObject = grpc.loadPackageDefinition(packageDef);
    // Create package from object.
    const mychatPackage = grpcObject.myChatPackage;

    const client = new mychatPackage.myChat("game-master:5000", grpc.credentials.createInsecure());

    const GET_MESSAGES_INTERVAL = 2000;
    
    var username = req.session.username;
    var gameCreator = false;
    var gameFound = false;
    var gameJoined_id = null;
    var searchCount = 0;



    matchmake();



    function matchmake() {

        console.log("User: "+ username + " trying to connect.");
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
                }
            }

        });
        
    }

    function findGame(){


        if( gameCreator === false){

            // Find a game or create one
            client.joinGame({"username": username, "gameCreator": gameCreator}, (err, response) => {

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
                        res.render('chess');
                        //res.redirect('/home');
                        //res.redirect('/home');
                    }
                }
        
            });
        }
        else{

            // Waiting for a player to join my game.
            client.joinGame({"username": username, "gameCreator": gameCreator}, (err, response) => {
                
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
                            client.close();
                            console.log("Server timed out.");
                            console.log("No available games found at this time try again later.");
                            next();
                        }
                    }, GET_MESSAGES_INTERVAL);
                }
                else {

                    console.log("User "+username+ " found game! Recieved from server: "+ JSON.stringify(response));
                    gameFound = response.gameFound; // true
                    gameJoined_id = response.gameId;
                    
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
                                // TODO: destroy the game you created.
                                client.close();
                                console.log("Server timed out.");
                                console.log("No available games found at this time try again later.");
                                res.redirect('/home');
                                
                            }
                        }, GET_MESSAGES_INTERVAL);
                    }
                    else {

                        console.log("Game found! Recieved from server: "+ JSON.stringify(response));
                        gameFound = response.gameFound; // true
                        gameJoined_id = response.gameId;
                        res.render('chess');
                    }
                }
            });

        }

    }

    
}