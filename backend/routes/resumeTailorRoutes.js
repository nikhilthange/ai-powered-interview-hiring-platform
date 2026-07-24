const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const resumeTailorController = require('../controllers/resumeTailorController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(upload.single('resume'), resumeTailorController.tailorResume)
  .get(resumeTailorController.getMyTailoredResumes);

module.exports = router;
