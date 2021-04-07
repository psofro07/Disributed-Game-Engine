const {body} = require('express-validator');
const User = require('../models/user');

//unused
module.exports = (req, res, next) => {
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, {req}) => {
            return User.findOne({where: {email: value} }).then(user => {
                if (user) return Promise.reject('Email already exists!');
            });
        })
        .normalizeEmail(),
    body('username')
        .custom((value, {req}) => {
            return User.findOne({where: {username: value} }).then(user => {
                if (user) return Promise.reject('Username already exists!');
            });
        }),
    body('password')
        .isLength({min: 4}),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            res.status(error.statusCode).json(error.data);
        }
    }
    next();
}