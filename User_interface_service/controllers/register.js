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
        url: 'http://authentication:4000/api/user/register',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        console.log(response.data);

        res.json({status: "Success", redirect: '/login'});

    })
    .catch(function (error) {
        console.log(error.response.data.msg);

        res.send(error.response.data.msg);
    });
}

exports.getRegister = (req, res, next) => {
    res.render('register', {});
}