// Importing all Prerequsites from the packagemodules
const mongoose = require('mongoose');
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const config = require('config');
const fs = require('fs');

// Importing State
const state = require('./state');

mongoose.connect('mongodb://localhost/Movies', { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log(chalk.white.bgGreen.bold('Database is successfully connected!'));
}).catch(err => {
    console.log(chalk.white.bgRed.bold('Failed to connect with Database'));
    process.exit(1);
});

// Working with Admin Users

// Model Stracture of Admin section.
const Admin = mongoose.model('admin', {
    name: {
        type: String,
        required: function() {
            return true;
        },
        minlength: state.adminState.minlength_name,
        maxlength: state.adminState.maxlength_name,
        trim: true
    },
    profilePicture: {
        filename: {
            type: String,
            required: true,
            trim: true
        },
        fullPath: {
            type: String,
            required: true,
            trim: true
        }
    },
    description: {
        type: String,
        required: true,
        minlength: state.adminState.minlengthDescription,
        maxlength: state.adminState.maxlengthDescription,
        trim: true
    },
    login: {
        email: {
            type: String,
            required: true,
            minlength: state.adminState.minlengthEmail,
            maxlength: state.adminState.maxlengthEmail,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: state.adminState.minlengthPassword,
            maxlength: state.adminState.maxlengthPassword,
            trim: true
        }
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});

// Get all the admins account.
function getAdminAccount() {
    return new Promise(async (resolve, reject) => {
        Admin.find().select({ _id: 1, name: 1, description: 1, profilePicture: 1 }).then(arr => resolve({ status: true, data: arr })).catch(err => reject({ status: false, message: "Failed to retrive admins account" }));
    });
}

// CUSTOM FUNCTION FOR DELETING DATA FROM THE DATABASE IF THE USER IS ALREADY STORED.
function deleted_picture(obj) {
    return new Promise((resolve, reject) => {
        if ( obj.fullPath === 'public/users/user-default.png' ) {
            resolve();
        } else if ( obj.fullPath === 'public/users/default-poster.jpg' ) {
            resolve();
        } else {
            fs.unlink(obj.fullPath, function(err) {
                if ( err ) {
                    reject();
                } else {
                    resolve();
                }
            });    
        }
    });
}

// Add function for adding data to the admin
function added_admin( name, profilePicture, description, email, password ) {
    return new Promise(async (resolve, reject) => {
        if ( (name !== undefined) || (description !== undefined) || (email !== undefined) || (password !== undefined) || (profilePicture !== undefined) ) {

            const admin = new Admin({ name: name, profilePicture: profilePicture, description: description, login: { email: email, password: password }, isAdmin: true });
            
            async function find(a) {
                return new Promise(async (resolve, reject) => {
                    await Admin.find().then(async arr => {
                        const result = arr.filter(obj => obj.login.email.toUpperCase() === a.login.email.trim().toUpperCase());
                        if ( result.length === 0 ) {
                            resolve({ status: true });
                        } else {
                            await deleted_picture(profilePicture).then(() => reject({ status: false, message: "User already exists" })).catch(() => reject({ status: false, message: "User already exists and failed to delete the picture" }));
                        } 
                    }).catch((er) => {
                        reject({ status: false, message: "Failed to find all admins" });
                    });
                });
            }

            function hash() {
                return new Promise(async (resolve, reject) => {
                    await find(admin).then(async () => {
                        await bcrypt.genSalt(11).then(async salt => {
                            await bcrypt.hash(admin.login.password, salt).then(pass => {
                                admin.login.password = pass;
                                admin.login.email = admin.login.email.toLowerCase();
                                resolve(admin);
                            }).catch(err => reject(err));
                        }).catch(err => reject({ status: false, message: 'Failed to generate salt' }));
                    }).catch(err => reject(err));
                });
            }

            await hash().then(async obj => await obj.save().then(obj => {
                const { _id, name, profilePicture, description, isAdmin } = obj;
                resolve({ status: true, data: { _id, name, profilePicture, description, isAdmin } });
            }).catch(() => reject({ status: false, message: "Failed to save in the Database" }))).catch(err => reject(err));
            
        } else reject({ status: false, message: "User must send all the prequsites data" });
    });
}

// Working With User Functions and Related Database.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: function() {
            return true;
        },
        minlength: state.UserState.minlength_name,
        maxlength: state.UserState.maxlength_name,
        trim: true
    },
    profilePicture: {
        filename: {
            type: String,
            required: true,
            trim: true
        },
        fullPath: {
            type: String,
            required: true,
            trim: true
        }
    },
    description: {
        type: String,
        required: true,
        minlength: state.UserState.minlengthDescription,
        maxlength: state.UserState.maxlengthDescription,
        trim: true
    },
    login: {
        email: {
            type: String,
            required: true,
            minlength: state.UserState.minlengthEmail,
            maxlength: state.UserState.maxlengthEmail,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: state.UserState.minlengthPassword,
            maxlength: state.UserState.maxlengthPassword,
            trim: true
        }
    },
    isUser: {
        type: Boolean,
        required: true
    }
});

const User = mongoose.model('user', userSchema);


function getAllUsers() {
    return new Promise(async (resolve, reject) => {
        await User.find().select({ _id: 1, name: 1, profilePicture: 1, description: 1, isUser: 1 }).then(obj => resolve(obj)).catch(err => reject(err));
    });
}

function AddedUser( name, profilePicture, description, email, password ) {
    return new Promise(async (resolve, reject) => {
        if ( (name !== undefined) || (description !== undefined) || (email !== undefined) || (password !== undefined) || (profilePicture !== undefined) ) {

            const user = new User({ name: name, profilePicture: profilePicture, description: description, login: { email: email, password: password }, isUser: true });


            async function find(a) {
                return new Promise(async (resolve, reject) => {
                    await User.find().then(async arr => {
                        const result = arr.filter(obj => obj.login.email.toUpperCase() === a.login.email.trim().toUpperCase());
                        if ( result.length === 0 ) {
                            resolve({ status: true });
                        } else {
                            await deleted_picture(profilePicture).then(() => reject({ status: false, message: "User already exists" })).catch(() => reject({ status: false, message: "User already exists and failed to delete the picture" }));
                        } 
                    }).catch((er) => {
                        reject({ status: false, message: "Failed to find all admins" });
                    });
                });
            }

            function hash() {
                return new Promise(async (resolve, reject) => {
                    await find(user).then(async () => {
                        await bcrypt.genSalt(11).then(async salt => {
                            await bcrypt.hash(user.login.password, salt).then(pass => {
                                user.login.password = pass;
                                user.login.email = user.login.email.toLowerCase();
                                resolve(user);
                            }).catch(err => reject(err));
                        }).catch(() => reject({ status: false, message: 'Failed to generate salt' }));
                    }).catch(err => reject(err));
                });
            }

            await hash().then(async obj => await obj.save().then(obj => {
                const { _id, name, profilePicture, description, isUser } = obj;
                resolve({ status: true, data: { _id, name, profilePicture, description, isUser } });
            }).catch(() => reject({ status: false, message: "Failed to save in the Database" }))).catch(err => reject(err));

        } else reject({ status: false, message: "User must send all the prequsites data" });
    });
}


// Added Movies to the user profile.

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: state.movies.minlength_name,
        maxlength: state.movies.maxlength_name
    },
    rate: {
        type: Number,
        required: true,
        minlength: state.movies.minlength_rate,
        maxlength: state.movies.maxlength_rate
    },
    thumbnail: {
        filename: {
            type: String,
            trim: true,
            required: true
        },
        fullPath: {
            type: String,
            trim: true,
            required: true
        }
    },
    experience: {
        type: String,
        trim: true,
        required: true,
        minlength: state.movies.minlength_experience,
        maxlength: state.movies.maxlength_experience
    },
    year: {
        type: Number,
        trim: true,
        required: true
    },
    userAccount: {
        type: mongoose.Schema.Types.ObjectId
    }
});

const Movies = mongoose.model('Movies', movieSchema);

// This function will be use to added movies to the database
function added_movies(loginObject, name, thumbnail, rate, experience, year) {
    return new Promise(async (resolve, reject) => {
        let f;

        if ( loginObject.isAdmin === true && loginObject.isUser === undefined ) {
            f = Admin.find({ _id: loginObject._id });
        } else if ( loginObject.isAdmin === undefined && loginObject.isUser === true ) {
            f = User.find({ _id: loginObject._id });
        }
    
        await f.then(async arr => {
            /// Start Coding from here...
            if ( arr.length === 1 ) {
                if ( (name !== undefined) && (thumbnail !== undefined) && (rate !== undefined) && (experience !== undefined) && (year !== undefined) ) {
                
                    Movies.find({ userAccount: arr[0]._id, name: name.toLowerCase() }).then(async arr1 => {
                        if ( arr1.length === 1 ) {
                            await deleted_picture(thumbnail).then(() => reject({ status: false, message: "Movie Data exists" })).catch(() => reject({ status: false, message: "User already exists and failed to delete the picture" }));
                        } else {
                            movie.save().then(async obj => {
                                resolve({ status: true, data: obj });
                            }).catch(err => reject({ status: false, message: err.message }));
                        }
                    }).catch(err => reject({ status: false, message: err.message }));

                    const movie = new Movies({ name: name.toLowerCase(), thumbnail, rate, experience, year, userAccount: loginObject._id });

                } else reject({ status: false, message: "User must fill all the details" });
            } else reject({ status: false, message: "User isn't valid" });

        }).catch(() => reject({ status: false, message: "User isn't valid" }));
    });
}



// LAST STEP
// Added Function for loging user to the application
function loginAdmin( email, password ) {

    return new Promise(async (resolve, reject) => {
        if ( ( email === undefined ) || ( password === undefined ) ) {
            reject({ status: false, message: 'Invalid login request' });
        } else {
            await Admin.find({ 'login.email': email.toLowerCase() }).then(async arr => {
                if ( arr.length === 1) {
                    await bcrypt.compare(password, arr[0].login.password).then(async ans => {
                        if ( (arr[0].login.email === email.toLowerCase()) && ans ) {
                            try {
                                const token = await jwt.sign({ _id: arr[0]._id, name: arr[0].name, profilePicture: arr[0].profilePicture, description: arr[0].description, isAdmin: arr[0].isAdmin }, config.get('jsonWebTokenCodePath'));
                                resolve({ token, data: { _id: arr[0]._id, name: arr[0].name, profilePicture: arr[0].profilePicture, description: arr[0].description, isAdmin: arr[0].isAdmin } });
                            } catch (e) {
                                reject({ status: false, message: "Failed to generate jsonwebtoken" });
                            }

                        } else {
                            reject({ status: false, message: "Invalid Email & Password" });
                        }
                    }).catch(() => reject({ status: false, message: 'Server Error' }));
                    
                } else reject({ status: false, message: "Invalid Email & Password" });
            }).catch(err => reject(err));
        }
    });
}

function loginUser( email, password ) {

    return new Promise(async (resolve, reject) => {
        if ( ( email === undefined ) || ( password === undefined ) ) {
            reject({ status: false, message: 'Invalid login request' });
        } else {
            await User.find({ 'login.email': email.toLowerCase() }).then(async arr => {
                if ( arr.length === 1) {
                    await bcrypt.compare(password, arr[0].login.password).then(async ans => {
                        if ( (arr[0].login.email === email.toLowerCase()) && ans ) {
                            try {
                                const token = await jwt.sign({ _id: arr[0]._id, name: arr[0].name, profilePicture: arr[0].profilePicture, description: arr[0].description, isUser: arr[0].isUser }, config.get('jsonWebTokenCodePath'));
                                resolve({ token, data: { _id: arr[0]._id, name: arr[0].name, profilePicture: arr[0].profilePicture, description: arr[0].description, isUser: arr[0].isUser } });
                            } catch (e) {
                                reject({ status: false, message: "Failed to generate jsonwebtoken" });
                            }

                        } else {
                            reject({ status: false, message: "Invalid Email & Password" });
                        }
                    }).catch(() => reject({ status: false, message: 'Server Error' }));
                    
                } else reject({ status: false, message: "Invalid Email & Password" });
            }).catch(err => reject(err));
        }
    });
}

function findPostAndDelete(id) {
    return new Promise(async (resolve, reject) => {
        Movies.find({ userAccount: id }).then(async arr => {
            if ( arr.length === 1 ) {
                await Movies.deleteOne({ _id: arr[0]._id }).then(async () => {
                    await deleted_picture(arr[0].thumbnail).then(() => resolve({ status: true, message: "All Data is Deleted!" })).catch(() => reject({ status: false, message: "Failed to delete images" }));
                }).catch(() => reject({ status: false, message: 'Failed to delete data from posts' }));
            } else if ( arr.length > 1 ) {
                await Movies.deleteMany({ _id: arr[0]._id }).then(async () => {
                    await deleted_picture(arr[0].thumbnail).then(() => resolve({ status: true, message: "All Data is Deleted!" })).catch(() => reject({ status: false, message: "Failed to delete images" }));
                }).catch(() => reject({ status: false, message: 'Failed to delete data from posts' }));
            } else resolve({ status: true, message: "All Data is Deleted!" });
        }).catch(() => reject({ status: false, message: 'Failed to delete data from posts' }));
    })
}

// Delete an admin account
function delete_admin( email ) {
    return new Promise(async (resolve, reject) => {
        
        if ( email ) {
            await Admin.find({ 'login.email': email }).then(async objs => {
                if ( objs.length === 1 ) {
                    await deleted_picture(objs[0].profilePicture).then(async () => {

                        await User.deleteOne({ "login.email": email }).then(obj => {
                            // Start coding from here....
                            findPostAndDelete(objs[0]._id).then(obj => {
                                resolve({ status: true, message: "Data is successfully deleted" });
                            }).catch(err => {
                                reject(err);
                            });
                        }).catch(() => {
                            reject({ status: false, message: "User data not found!" });
                        });

                    }).catch(() => reject({ status: false, message: "Failed to delete the picture" }));
                } else reject({ status: false, message: "User data not found!" });

            }); 
        } else reject({ status: false, message: "User Must send all the imprerative data" });
    })
}


// Delete an user account
function delete_user( email ) {
    return new Promise(async (resolve, reject) => {
        
        if ( email ) {
            await User.find({ 'login.email': email }).then(async objs => {

                if ( objs.length === 1 ) {

                    await deleted_picture(objs[0].profilePicture).then(async () => {

                        await User.deleteOne({ "login.email": email }).then(obj => {
                            // Start coding from here....
                            findPostAndDelete(objs[0]._id).then(obj => {
                                resolve({ status: true, message: "Data is successfully deleted" });
                            }).catch(err => {
                                reject(err);
                            });
                        }).catch(() => {
                            reject({ status: false, message: "User data not found!" });
                        });

                    }).catch(() => reject({ status: false, message: "Failed to delete the picture" }));
                } else reject({ status: false, message: "User data not found!" });

            }); 
        } else reject({ status: false, message: "User Must send all the imprerative data" });
    })
}

// Finding Movies using users or admin id
function finding_movies(id) {
    return new Promise((resolve, reject) => {
        if ( id !== undefined ) {
            Movies.find({ userAccount: id }).then(arr => {
                if ( arr.length === 0 ) {
                    resolve({ status: true, data: arr, message: "No Movies Found" });
                } else {
                    resolve({ status: true, data: arr, message: "Movies Found" });
                }
            }).catch(err => reject({ status: false, message: err.message }));
        } else reject({ status: false, message: "User must send user id" });
    });
}

// Finding all Movies Data
function findingAllMovies() {
    return new Promise(async (resolve, reject) => {
        Movies.find().then(arr => {
            if ( arr.length === 0 ) {
                resolve({ status: true, data: arr, message: "No Movies Data Found" });
            } else {
                resolve({ status: true, data: arr, message: "All Movies Data" });
            }
        }).catch(err => reject({ status: false, message: err.message }));
    })
}


// Exporting all the necessary files.
module.exports.added_admin = added_admin;
module.exports.getAdminAccount = getAdminAccount;
module.exports.loginAdmin = loginAdmin;
module.exports.loginUser = loginUser;
module.exports.AddedUser = AddedUser;
module.exports.getAllUsers = getAllUsers;
module.exports.delete_admin = delete_admin;
module.exports.delete_user = delete_user;
module.exports.added_movies = added_movies;
module.exports.findingAllMovies = findingAllMovies;
module.exports.finding_movies = finding_movies;