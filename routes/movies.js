// Importing all the important module for this application
const express = require("express");
const router = express.Router();
const Joi = require("joi");
var ObjectId = require('mongoose').Types.ObjectId;

// Importing Middlewares function.
const isLogin = require("./../middlewares/isLogin");
const { upload } = require("./multerConfig");

// Importing Function from the database module.
const { added_movies, findingAllMovies, finding_movies } = require("./../database/index");

// Importing state
const state = require("./../database/state");

// This route is responsible for retriving the all the data about posts of movies from the database.
router.get('/', isLogin, async (req, res) => {
    await findingAllMovies().then(arr => res.send(arr)).catch(err => res.status(500).send({ status: false, message: err.message }));
});

// This route uses for getting all the data for a specific user.
router.post('/findById', isLogin, async (req, res) => {
    const { id } = req.body;
    if ( id !== undefined ) {
        if ( ObjectId.isValid(id) ) {
            await finding_movies(id).then(arr => res.send(arr)).catch(err => res.status(500).send({ status: false, message: err.message }));
        } else res.status(500).status({ status: false, message: "User must send an valid if" });
    } else res.status(500).send({ status: false, message: "User must send an id" });
});

router.post('/findMyMovies', isLogin, async (req, res) => {
    const { _id } = req.loginInfo;
    if ( _id !== undefined ) {
        if ( ObjectId.isValid(_id) ) {
            await finding_movies(_id).then(arr => res.send(arr)).catch(err => res.status(500).send({ status: false, message: err.message }));
        } else res.status(500).status({ status: false, message: "User must send an valid if" });
    } else res.status(500).send({ status: false, message: "User must send an id" });
});


// This route will be use for adding data to the database.
router.post('/', [isLogin, upload.single('thumbnail')], async (req, res) => {
    const { name, rate, experience, date } = req.body;

    // Working with image
    const pictureValue = (req.file) ? { filename: req.file.filename, fullPath: req.file.path } : { filename: "default-poster.jpg", fullPath: "public/users/default-poster.jpg" }

    // Data Validation using Joi
    const schema = Joi.object({
        name: Joi.string().min(state.movies.minlength_name).max(state.movies.maxlength_name).required(),
        thumbnail: Joi.object().required(),
        rate: Joi.number().min(state.movies.minlength_rate).max(state.movies.maxlength_rate).required(),
        experience: Joi.string().min(state.movies.minlength_experience).max(state.movies.maxlength_experience).required(),
        date: Joi.number().required()
    });

    await schema.validateAsync({
        name,
        thumbnail: pictureValue,
        rate,
        experience,
        date
    }).then(async obj => {
        // Start working from here...
        await added_movies(req.loginInfo, obj.name, obj.thumbnail, obj.rate, obj.experience, obj.date).then(obj => res.send(obj)).catch(err => res.status(500).send(err));
    }).catch(err => {
        res.status(500).send({ status: false, message: err.details[0].message });
    });
});

module.exports = router;