// Importing all prerequisite modules we needed.
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const config = require("config");

// Importing the state variables
const state = require('./../database/state');

// Middleware function imported
const isLogout = require("./../middlewares/isLogout");
const isLogin = require("./../middlewares/isLogin");
const { upload } = require("./multerConfig");

// Importing all the required function for working with the database
const { AddedUser } = require("./../database/index");
const { getAllUsers } = require("./../database/index");

// Get all the users
router.get('/', isLogin, async (req, res) => {
    await getAllUsers().then(arr => res.send(arr)).catch(() => res.status(404).send({ status: false, message: 'No User Data Found!' }));
});

// Added User to the database
router.post('/', [isLogout, upload.single('profilePicture')], async (req, res) => {
    const { name, description, email, password } = req.body;

    // Working with image
    const pictureValue = (req.file) ? { filename: req.file.filename, fullPath: req.file.path } : { filename: "user-default.png", fullPath: "public/users/user-default.png" };

    // Data Validation using Joi
    const schema = Joi.object({
        name: Joi.string().min(state.UserState.minlength_name).max(state.UserState.maxlength_name).required(),
        profilePicture: Joi.object(),
        description: Joi.string().min(state.UserState.minlengthDescription).max(state.UserState.maxlengthDescription).required(),
        email: Joi.string().email().min(state.UserState.minlengthEmail).max(state.UserState.maxlengthEmail).required(),
        password: Joi.string().min(state.UserState.minlengthPassword).max(state.UserState.maxlengthPassword)
    });

    await schema.validateAsync({
        name,
        description,
        profilePicture: pictureValue,
        email,
        password
    }).then(async value => {
        await AddedUser( value.name, value.profilePicture, value.description, value.email, value.password).then(obj => {
            const token = jwt.sign(obj.data, config.get('jsonWebTokenCodePath'));

            res.header('x-auth-token', token).send(obj);
        }).catch(err => res.status(404).send(err));
    }).catch(err => {
        res.status(500).send({ status: false, message: err.details[0].message });
    });
});



module.exports = router;