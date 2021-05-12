const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/admin', isValidated && isLoggedIn, adminController.getUsers);

module.exports = router;