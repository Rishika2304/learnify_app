/*backemd/routes/uploadRoutes.js*/
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /mp4|mkv|avi|webm|quicktime|x-m4v/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Mimetype check is sometimes wonky with videos, so we relax it a bit if ext matches
  if (extname || file.mimetype.startsWith('video/')) {
    return cb(null, true);
  } else {
    cb('Error: Videos Only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No video file uploaded' });
  }
  // Return the path like /uploads/video-123.mp4
  const normalizedPath = req.file.path.replace(/\\/g, '/');
  res.send({ url: `/${normalizedPath}` });
});

module.exports = router;
