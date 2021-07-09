const express = require('express');
const router = express.Router();


const leaderboardController = require('../controllers/leaderboards');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

// ? Add official validation function?
router.get('/leaderboards/:type', isValidated && isLoggedIn, leaderboardController.leaderboards);

router.get('/getLeaderboards/:type', isValidated && isLoggedIn, leaderboardController.getLeaderboards);

module.exports = router;