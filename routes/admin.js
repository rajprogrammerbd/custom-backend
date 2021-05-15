// Importing all the prequisite files.
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require("jsonwebtoken");
const config = require("config");

// Importing Middlewears
const authAdmin = require("./../middlewares/authAdmin");
const loginUsers = require("./../middlewares/isLogin");
const { upload } = require("./multerConfig");

// Importing the State
const state = require("./../database/state");

// Importing files for working with database.
// Importing admin related functions.
const { added_admin, getAdminAccount, delete_admin, delete_user } = require('../database/index');

// Get all the admins account.
router.get('/', [loginUsers, authAdmin], async (req, res) => {
    await getAdminAccount().then(arr => res.send(arr)).catch(() => res.status(400).send({ status: false, message: 'Bad Request' }));
});

// Add new admin account.
router.post('/register', [loginUsers, authAdmin, upload.single('profilePicture')], async (req, res) => {
    const { name, description, email, password } = req.body;

    // Working with image
    const pictureValue = (req.file) ? { filename: req.file.filename, fullPath: req.file.path } : { filename: "user-default.png", fullPath: "public/users/user-default.png" }

    // Data Validation using Joi
    const schema = Joi.object({
        name: Joi.string().min(state.adminState.minlength_name).max(state.adminState.maxlength_name).required(),
        profilePicture: Joi.object(),
        description: Joi.string().min(state.adminState.minlengthDescription).max(state.adminState.maxlengthDescription).required(),
        email: Joi.string().email().min(state.adminState.minlengthEmail).max(state.adminState.maxlengthEmail).required(),
        password: Joi.string().min(state.adminState.minlengthPassword).max(state.adminState.maxlengthPassword).required()
    });

    await schema.validateAsync({
        name,
        description,
        profilePicture: pictureValue,
        email, 
        password
    }).then(async value => {
        await added_admin( value.name, value.profilePicture, value.description, value.email, value.password).then(obj => {
            const token = jwt.sign(obj.data, config.get('jsonWebTokenCodePath'));

            res.header('x-auth-token', token).send(obj);
        }).catch(err => res.status(404).send(err));
    }).catch(err => {
        res.status(500).send({ status: false, message: err.details[0].message });
    });
});

// Delete an admin
router.delete('/deleteAdmin', [loginUsers, authAdmin], async (req, res) => {
    const { email } = req.body;

    const schema = Joi.object({
        email: Joi.string().email().min(state.adminState.minlengthEmail).max(state.adminState.maxlengthEmail).required()
    });

    await schema.validateAsync({ email }).then(async obj => {
        await delete_admin( obj.email ).then(ans => {
            res.send(ans);
        }).catch(err => {
            res.status(500).send(err);
        });
    }).catch(err => {
        res.status(500).send({ status: false, message: err.details[0].message });
    });
});

// Delete a user
router.delete('/deleteUser', [loginUsers, authAdmin], async (req, res) => {
    const { email } = req.body;

    const schema = Joi.object({
        email: Joi.string().email().min(state.adminState.minlengthEmail).max(state.adminState.maxlengthEmail).required()
    });

    await schema.validateAsync({ email }).then(async obj => {
        await delete_user( obj.email ).then(ans => {
            res.send(ans);
        }).catch(err => {
            res.status(500).send(err);
        });
    }).catch(err => {
        res.status(500).send({ status: false, message: err.details[0].message });
    });
});

module.exports = router;