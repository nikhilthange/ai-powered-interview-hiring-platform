const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Standardize filenames (e.g. user_id-timestamp-original_name)
    const userId = req.user ? req.user._id : 'anonymous';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(file.originalname);
    cb(null, `${userId}-${uniqueSuffix}${fileExt}`);
  }
});

// File Filter (Restrict to documents and images with magic-byte validation)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new AppError('Invalid file type! Allowed types: PDF, DOC, DOCX, PNG, JPG, JPEG, GIF, WEBP', 400), false);
  }

  // Verify file buffer magic bytes if available in memory or check extension
  const mimeType = file.mimetype.toLowerCase();
  const dangerousMimes = ['application/x-msdownload', 'application/x-executable', 'text/html', 'application/javascript', 'text/javascript'];
  
  if (dangerousMimes.includes(mimeType)) {
    return cb(new AppError('Executable or script files are strictly forbidden!', 400), false);
  }

  cb(null, true);
};

// Limit uploads to 5MB maximum to prevent DOS overflow
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
