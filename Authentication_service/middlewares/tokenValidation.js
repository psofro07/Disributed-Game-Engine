const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return res.status(error.statusCode).json({ error: error.message});
    }

    //token is sent as 'Bearer token'
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        const error = new Error('Invalid token.');
        error.statusCode = 500;
        return res.status(error.statusCode).json({ error: error.message});
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        return res.status(error.statusCode).json({ error: error.message});
    }

    req.userId = decodedToken.userId;
    next();
};
  