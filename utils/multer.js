const AppError = require('./AppError');
const multer = require('multer');
const path = require('path');

// Multer Config

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      cb(new Error('File Format is not supported'), false);
      return;
    }
    cb(null, true);
  },
});
