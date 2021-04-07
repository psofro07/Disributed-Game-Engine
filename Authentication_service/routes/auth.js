const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth');

router.post('/auth', authController.postLogin);

module.exports = router;