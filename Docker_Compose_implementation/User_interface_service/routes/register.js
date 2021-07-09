const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');

router.post('/register/auth', registerController.postRegister);

router.get('/register', registerController.getRegister);

module.exports = router;