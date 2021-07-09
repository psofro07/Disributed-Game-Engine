const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login');

router.post('/login/auth', loginController.postLogin);

router.get('/login', loginController.getLogin);

module.exports = router;