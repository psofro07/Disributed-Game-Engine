const express = require('express');
const router = express.Router();

const verify = require('../util/verifyToken');

router.get('/home', verify, (req, res, next) => {
    res.json({
        title: 'homepage',
        data: 'h mana sou'  
    })
})

module.exports = router;