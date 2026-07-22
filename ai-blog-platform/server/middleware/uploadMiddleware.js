const multer = require('multer');

// Memory storage to hold files in buffer before uploading to Cloudinary
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

// Maximum file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * File filter — rejects any file that is not an allowed image type.
 * Provides a descriptive error message listing accepted formats.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
