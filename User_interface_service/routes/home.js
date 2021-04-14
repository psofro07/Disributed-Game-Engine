const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home');
const isValidated = require('../middleware/isValidated');

router.get('/home', isValidated , homeController.getHome);

module.exports = router;