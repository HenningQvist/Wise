const multer = require('multer');
const path = require('path');

// Se till att uppladdningsmappen finns
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/documents'));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
