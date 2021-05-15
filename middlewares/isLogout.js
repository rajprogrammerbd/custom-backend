const config = require('config');
const jwt = require("jsonwebtoken");

/*
module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if ( !token ) {
        next();
        return;
    }

    try {
        jwt.verify(token, config.get('jsonWebTokenCodePath'));
        next();
    } catch (err) {
        res.status(500).send({ status: false, message: 'User already logged in' });
    }
}
*/

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    
    if ( !token ) {
        next();
        return;
    }

    try {
        jwt.verify(token, config.get('jsonWebTokenCodePath'));
        res.status(500).send({ status: false, message: 'User already logged in' });
    } catch (err) {
        res.status(500).send({ status: false, message: 'User already logged in' });
    }
}