const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UP = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(path.join(__dirname, '..', '..', UP))) fs.mkdirSync(path.join(__dirname, '..', '..', UP));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', UP)),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

module.exports = upload;
