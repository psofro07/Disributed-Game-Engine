const User = require('../models/user');
const jwt = require('jsonwebtoken');

const {loginValidation} = require('../util/validation');

exports.postLogin = (req, res, next) => {
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
        
        User.findOne({where: { username: req.body.username} })
            .then( user => {
                //check username
                if(!user) return res.status(400).send('username does not exist');
                //check password
                const password = user.password
                if(password != req.body.password) return res.status(400).send('password is incorrect');
                //assign a token
                const token = jwt.sign({username: user.username}, process.env.ACCESS_TOKEN_SECRET)
                res.header('auth-token', token).send('Logged in!')

            })
            .catch(err => {
                console.log(err)
            })
             
}