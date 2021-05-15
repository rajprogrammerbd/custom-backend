// Importing all the required files for this module
const multer = require('multer');

// Creating a strage about multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/movies_thumbnails');
    },
    filename: function (req, file, cb) {
        // const fileName = file.originalname.slice(0, file.originalname.lastIndexOf("."));
        const extension = file.originalname.slice(file.originalname.lastIndexOf("."), file.originalname.length);
        // const name = new Date().toISOString() + '.' + '.' + fileName + extension;
        cb(null, file.fieldname + '-' + (`${new Date().getFullYear()}.${new Date().getDate()}.${new Date().getHours()}.${new Date().getMinutes()}.${new Date().getSeconds()}`) + (Math.random() * 1E9) + extension);
    }
});


// More configuration of multer
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if ( (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

module.exports.upload = upload;