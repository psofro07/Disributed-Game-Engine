const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/home', isValidated && isLoggedIn , homeController.getHome);

router.get('/home/practice/chess', isValidated && isLoggedIn, homeController.getPractice);

module.exports = router;