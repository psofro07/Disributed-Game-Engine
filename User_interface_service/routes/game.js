const express = require('express');
const router = express.Router();

const gameController = require('../controllers/game');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/game/chess', isValidated && isLoggedIn , gameController.chess);

router.get('/game/tic-tac-toe', isValidated && isLoggedIn , gameController.ticTacToe);

router.post('/game/sendMove', isValidated && isLoggedIn, gameController.sendMove);

router.post('/game/receiveMove', isValidated && isLoggedIn, gameController.receiveMove);

router.post('/game/initializeGame', isValidated && isLoggedIn, gameController.initializeGame);

router.post('/game/endGame', isValidated && isLoggedIn, gameController.endGame);

module.exports = router;