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
		url: 'http://authentication:4000/api/user/login',
		headers: { 
		'Content-Type': 'application/json'
		},
		data : data
	};

	axios(config)
	.then(function (response) {
		console.log(response.data);
		
		const token = response.data.token;
		const username = response.data.username;
		const email = response.data.email;
		const role = response.data.role;

		req.session.username = username;
		req.session.isLoggedIn = true;
		req.session.email = email;
		req.session.role = role;
		res.cookie('token', token, {maxAge: 1000000, httpOnly:true}).json({status: "Success", redirect: '/home'});
	})
	.catch(function (error) {
		console.log(error.response.data.message);

		res.send(error.response.data.message);
	});
}


exports.getLogin = (req, res, next) => {

	if(req.session.isLoggedIn){
		res.redirect('/home');
	}
	else{
		res.render('login', {});
	}
	
}