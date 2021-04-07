const express = require('express');
const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');
const {body} = require('express-validator');
const tokenValidation = require('../middlewares/tokenValidation');

router.post(
    '/register', 
    [
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
            .isLength({min: 4})
    ],
    authController.postRegister
);

router.post('/login', authController.postLogin);

router.get('/home', tokenValidation, (req, res, next) => {
    res.json({message: 'You in'})
})

module.exports = router;