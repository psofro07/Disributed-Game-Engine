const User = require('../models/user');
const express = require('express');


exports.getUser = async (req, res, next) => {

    //const username = req.query.username;
    const username = req.params.username;

    await User.findOne({where: { username: username } })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this username could not be found.');
                error.statusCode = 401;
                throw error;
            }
            
            res.send(user);
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
        });

    
    
}