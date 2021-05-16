const express = require('express');
const router = express.Router();


const tournamentController = require('../controllers/tournament');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

// ? Add official validation function?
router.get('/official/:gameType', isValidated && isLoggedIn, tournamentController.createTournament);
router.get('/tournament/:tournID', isValidated && isLoggedIn, tournamentController.tournamentLobby);
router.post('/tournament/players', isValidated && isLoggedIn, tournamentController.getPlayers);


module.exports = router;