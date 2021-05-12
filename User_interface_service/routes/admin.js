const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const isValidated = require('../middleware/isValidated');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/admin/createTable', isValidated && isLoggedIn, adminController.createTable);
router.post('/admin/editTable', isValidated && isLoggedIn, adminController.editTable);
router.get('/admin', isValidated && isLoggedIn, adminController.getAdmin)

module.exports = router;