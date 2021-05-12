const express = require('express');
const router = express.Router();

const User = require('../models/user');
//const authController = require('../controllers/auth');
const adminController = require('../controllers/admin');
//const {body} = require('express-validator');

router.get('/user', adminController.getUsers)

router.delete('/user/:username', adminController.deleteUser);

router.put('/user/:username', adminController.updateUser);

module.exports = router;