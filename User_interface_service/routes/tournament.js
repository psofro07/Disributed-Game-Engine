const express = require('express');
const router = express.Router();


const tournamentController = require('../controllers/tournament');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

// ? Add official validation function?
router.get('/official/:gameType', isValidated && isLoggedIn, tournamentController.createTournament);

router.get('/tournamentList', isValidated && isLoggedIn, tournamentController.tournamentList);

//router.post('/tournament/players', isValidated && isLoggedIn, tournamentController.getPlayers);

router.post('/joinTournament', isValidated && isLoggedIn, tournamentController.joinTournament);

router.post('/leaveTournament', isValidated && isLoggedIn, tournamentController.leaveTournament);

router.post('/getTournamentList', isValidated && isLoggedIn, tournamentController.getTournamentList);

router.get('/refreshTournamentList', isValidated && isLoggedIn, tournamentController.refreshTournamentList);

router.post('/deleteTournament', isValidated && isLoggedIn, tournamentController.deleteTournament);

router.get('/tournamentMatchmake/:tournID', isValidated && isLoggedIn, tournamentController.tournamentMatchmake);

router.get('/continueTournament', isValidated && isLoggedIn, tournamentController.continueTournament);

module.exports = router;