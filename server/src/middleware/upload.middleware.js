const path = require('path');
const multer = require('multer');
const env = require('../config/env');

const storage = multer.diskStorage({
  destination: path.resolve(process.cwd(), env.uploadDir),
  filename: (_req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${suffix}-${file.originalname.replace(/\s+/g, '-')}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
