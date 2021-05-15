// Required modules imported.
const jwt = require("jsonwebtoken");
const config = require("config");


// This middleware checks that if the user is authenticated or not.
module.exports = function ( req, res, next ) {
    const token = req.header('x-auth-token');

    if ( !token ) {
        return res.status(400).send({ status: false, message: "Authentication failed! User isn't admin" });
    }
    
    try {
        const result = jwt.verify(token, config.get('jsonWebTokenCodePath'));
        req.user = result;
        (req.user.isAdmin) ? next() : res.status(400).send({ status: false, message: "Authentication failed! User isn't admin" });
    } catch (err) {
        res.status(400).send('Access Denied!');
    }
}