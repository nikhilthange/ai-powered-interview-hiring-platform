const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post('/pdf', upload.single('pdf'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a PDF file.', 400);
  }

  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(req.file.path);
  const data = await pdfParse(buffer);

  if (req.file.path) {
    fs.unlink(req.file.path, () => {});
  }

  res.status(200).json({
    status: 'success',
    data: {
      pdfParseType: typeof pdfParse,
      textLength: data.text.length,
      textPreview: data.text.slice(0, 200),
    },
  });
}));

module.exports = router;
