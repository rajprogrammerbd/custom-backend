// Import all the necessary files.
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { loginAdmin, loginUser } = require("./../database/index");

// Nesseary Middleware functions
const isLogout = require("./../middlewares/isLogout");

// Importing State default setting object.
const state = require("./../database/state");

// Logining User Data
router.post('/', isLogout, async (req, res) => {
    const { email, password, isAdmin, isUser } = req.body;

    if ( (email === undefined) || (password === undefined) ) {
        res.status(500).send({ status: false, message: 'Invalid login request' });
    } else {
        const loginSchema = Joi.object({
            email: Joi.string().min(state.adminState.minlengthEmail).max(state.adminState.maxlengthEmail).email().required(),
            password: Joi.string().min(state.adminState.minlengthPassword).max(state.adminState.maxlengthPassword).required(),
        });

        if ( isAdmin === true && isUser === undefined ) {
            try {
                const result = await loginSchema.validateAsync({ email, password });

                await loginAdmin(result.email, result.password).then(obj => {
                    const { token, data } = obj;
                    res.header('x-auth-token', token).send(data);
                }).catch(err => res.status(500).send(err));

            } catch (err) {
                res.status(500).send({ status: false, message: err.details[0].message });
            }
        } else if ( isAdmin === undefined && isUser === true ) {
            try {
                const result = await loginSchema.validateAsync({ email, password });

                await loginUser(result.email, result.password).then(obj => {
                    const { token, data } = obj;
                    res.header('x-auth-token', token).send(data);
                }).catch(err => res.send(err));

            } catch (err) {
                res.status(500).send({ status: false, message: err.details[0].message });
            }
        } else {
            res.status(500).send({ status: false, message: 'Bad Requested' });
        }
    }
});


module.exports = router;