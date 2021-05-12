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


exports.deleteUser = (req, res, next) => {

    const username = req.params.username

    User.findOne({where: { username: username } })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this username could not be found.');
                error.statusCode = 401;
                throw error;
            }
            
            return user.username;
        })
        .then(async (username) => {
            await User.destroy({where: {username: username}});

            res.status(200).json({ message: "User deleted successfully"});
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
        });
}


exports.updateUser = (req, res, next) => {

    const username = req.params.username
    const email = req.body.email;
    const role = req.body.role;

    User.findOne({where: { username: username } })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this username could not be found.');
                error.statusCode = 401;
                throw error;
            }
            
            return user.username;
        })
        .then(async (username) => {
            await User.update({email: email, role: role} , {where: {username: username}});
            
            res.status(200).json({ message: "User updated successfully"});
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
        });

}