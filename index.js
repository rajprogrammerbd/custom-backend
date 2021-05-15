// Importing all Prerequsites from the packagemodules
const chalk = require('chalk');
const express = require('express');
const cors = require('cors');
const config = require('config');

// Importing all the routes.
const router = require('./routes/admin');
const login = require('./routes/login');
const user = require('./routes/user');
const movies = require('./routes/movies');

if ( !config.get('jsonWebTokenCodePath') ) {
    console.error("FATAL ERROR: jsonWebTokenCodePath isn't define");
    process.exit(1);
}

// Creating an app with express
const app = express();

// Using Middlewares
app.use(express.json());
app.use(cors());
app.use('/public', express.static('./public'));


// Using the routes
app.use('/admin', router);
app.use('/login', login);
app.use('/user', user);
app.use('/movies', movies);

// Last Rendering 404 page if none of routes matches with the user requested route.
app.get('*', function(req, res){
    res.status(404).send('Message From 404');
});

app.post('*', function(req, res){
    res.status(404).send('Message From 404');
});

app.put('*', function(req, res){
    res.status(404).send('Message From 404');
});

app.delete('*', function(req, res){
    res.status(404).send('Message From 404');
});


// Application is listening on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(chalk.white.bgBlue.bold(`Application is currently listening on port ${PORT}`)));