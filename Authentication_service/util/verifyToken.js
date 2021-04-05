const jwt = require('jsonwebtoken');

function token_ver(req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(400).send('Access Denied');

    try{
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next();
    } catch(err){
        res.status(400).send('Invalid Token');
        console.log(err)
    }
}

module.exports = token_ver;