const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const coverLetterController = require('../controllers/coverLetterController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(upload.single('resume'), coverLetterController.generateCoverLetter)
  .get(coverLetterController.getMyCoverLetters);

module.exports = router;
