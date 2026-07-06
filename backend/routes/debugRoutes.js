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

  const pdfParseModule = require('pdf-parse');
  const buffer = fs.readFileSync(req.file.path);
  let text = '';

  if (pdfParseModule.PDFParse) {
    const { VerbosityLevel } = pdfParseModule;
    const parser = new pdfParseModule.PDFParse({ data: buffer, verbosity: VerbosityLevel?.ERRORS ?? 0 });
    await parser.load();
    const textResult = await parser.getText();
    text = textResult?.text || '';
  } else {
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);
    text = data.text || '';
  }

  if (req.file.path) {
    fs.unlink(req.file.path, () => {});
  }

  res.status(200).json({
    status: 'success',
    data: {
      textLength: text.length,
      textPreview: text.slice(0, 200),
    },
  });
}));

module.exports = router;
