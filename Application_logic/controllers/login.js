exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  var axios = require('axios');
  var data = JSON.stringify({
    "username": username,
    "password": password
  });

  var config = {
    method: 'post',
    url: 'http://localhost:4000/api/user/login',
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(response.data);
    const token = response.data.token;
    res.cookie('token', token, {maxAge: 1000000, httpOnly:true}).json({status: "Success", redirect: '/home'});
  })
  .catch(function (error) {
    console.log(error.response.data.error);
    res.send(error.response.data.error)
  });
}


exports.getLogin = (req, res, next) => {
  res.render('login', {});
}