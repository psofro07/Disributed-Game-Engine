
module.exports = (req, res, next) => {
    var axios = require('axios');

    const token = req.cookies.token || '';

    var config = {
    method: 'get',
    url: 'http://localhost:4000/api/user/tokenValidation',
    headers: { 
        'Authorization': 'Bearer '+token
    }
    };

    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        next();
    })
    .catch(function (error) {
        console.log(error.response.data.error);
        res.redirect('/login');
    });
}