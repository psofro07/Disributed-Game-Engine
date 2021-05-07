const express = require('express');
const router = express.Router();

const gameController = require('../controllers/game');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/game/chess', isValidated && isLoggedIn , gameController.chess);

module.exports = router;