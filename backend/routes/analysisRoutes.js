const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { protect, verifiedOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(verifiedOnly);

router.post('/analyze-resume', analysisController.analyzeResume);
router.post('/analyze-resume-upload', upload.single('resume'), analysisController.analyzeResumeUpload);
router.post('/skill-gap', analysisController.skillGap);
router.post('/skill-gap-upload', upload.single('resume'), analysisController.skillGapUpload);
router.post('/match', analysisController.matchJob);

module.exports = router;
