const config = require('config');
const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if ( !token ) {
        return res.status(400).send({ status: false, message: 'Authentication failed!' });
    }

    try {
        const result = jwt.verify(token, config.get('jsonWebTokenCodePath'));
        req.loginInfo = result;
        
        next();
    } catch (err) {
        res.status(400).send('Access Denied!');
    }
}