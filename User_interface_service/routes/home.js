const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home');
const isValidated = require('../middleware/isValidated');

router.get('/home', isValidated , homeController.getHome);

router.get('/home/practice', isValidated, homeController.getPractice);

module.exports = router;