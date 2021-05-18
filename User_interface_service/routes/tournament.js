const express = require('express');
const router = express.Router();


const tournamentController = require('../controllers/tournament');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

// ? Add official validation function?
router.get('/official/:gameType', isValidated && isLoggedIn, tournamentController.createTournament);

router.get('/tournamentList', isValidated && isLoggedIn, tournamentController.tournamentList);

router.post('/tournament/players', isValidated && isLoggedIn, tournamentController.getPlayers);

router.get('/joinTournament', isValidated && isLoggedIn, tournamentController.joinTournament);

module.exports = router;