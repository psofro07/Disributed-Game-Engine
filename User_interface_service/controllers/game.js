exports.chess = (req, res, next) => {

    const gameID = req.session.gameID;
    const username = req.session.username;

    let mycolor = 'w';
    if(req.session.player === 'player2'){
        mycolor = 'b';
    }
    


    res.render('chess', { mycolor: mycolor, username: username}); 
}


exports.sendMove = (req, res, next) => {

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

    const mycolor = req.body.mycolor;
    const source = req.body.source;
    const target = req.body.target;
    const gameID = req.session.gameID;
    const username = req.session.username;

    sendMove().then( success => {
        console.log(success);
        res.json({'success': success});
    })
    

    function sendMove() {

        client.pushMove({"username": username, "gameID": gameID, "source": source, "target": target}, (err, response) => {

            if(err) {
                console.log(err);
            }
            else {  

                if(response.success === true){
                    console.log("Move pushed by Playmaster!");
                }
                else{
                    console.log("Failed to push move to Playmaster");
                }
                return response.success
            }

        });

    }
}