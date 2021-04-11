const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.postRegister = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw res.status(error.statusCode).json(error.data[0]);
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then(hashedPass => {
            User.create({
                email: email,
                password: hashedPass,
                username: username
            })
        })
        .then(result => {
            res.status(201).json({ message: 'User created!' });
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
        });    
}

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({where: { username: username } })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this username could not be found.');
                error.statusCode = 401;
                throw res.status(error.statusCode).json({ error: error.message});
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw res.status(error.statusCode).json({ error: error.message});
            }
            const token = jwt.sign({email: loadedUser.email, username: loadedUser.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ token: token, username: loadedUser.username });
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
        });
}

exports.tokenValidation = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw res.status(error.statusCode).json({ error: error.message});
    }

    //token is sent as 'Bearer token'
    const token = authHeader.split(' ')[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        const error = new Error('Invalid token.');
        error.statusCode = 500;
        throw res.status(error.statusCode).json({ error: error.message});
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw res.status(error.statusCode).json({ error: error.message});
    }

    res.json({status: "success"});
    next();
}