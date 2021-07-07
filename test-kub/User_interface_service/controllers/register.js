const grpc = require("grpc");
// protoLoader used for compilation of proto file into JS.
const protoLoader = require("@grpc/proto-loader");
const { response } = require("express");
// Load synchronously.
const packageDefGM = protoLoader.loadSync("gameMaster.proto", {});
// Load package definition into Object.
const grpcObjectGM = grpc.loadPackageDefinition(packageDefGM);
// Create package from object.
const gameMasterPackage = grpcObjectGM.gameMasterPackage;

const clientGM = new gameMasterPackage.gameMaster(`${process.env.GAME_MASTER_SERVICE}:5000`, grpc.credentials.createInsecure());


exports.postRegister = (req, res, next) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    var axios = require('axios');
    var data = JSON.stringify({
        "email": email,
        "username": username,
        "password": password
    });

    var config = {
        method: 'post',
        url: `http://${process.env.AUTH_SERVICE}:4000/api/user/register`,
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
    .then(async (response) => {
        console.log(response.data);

        await saveUser(username);

        res.json({status: "Success", redirect: '/login'});

    })
    .catch(function (error) {
        console.log(error.response.data.message);

        res.send(error.response.data.message);
    });
}

exports.getRegister = (req, res, next) => {
    res.render('register', {});
}


async function saveUser(username){

    clientGM.savePlayer({"username": username}, (err, response) => {
        if(err) {
            console.log(err);
        }
    })
}