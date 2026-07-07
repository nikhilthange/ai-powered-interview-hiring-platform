const express = require('express');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const uploadImage = require('../middleware/uploadImageMiddleware');
const AppError = require('../utils/appError');
const {
  validateBody,
  createOrUpdateProfileSchema,
  generateRoadmapSchema
} = require('../validators/profileValidator');

const router = express.Router();

router.use(protect);

function normalizeFormData(req, res, next) {
  if (!req.file && !req.headers['content-type']?.includes('multipart')) {
    return next();
  }
  console.log('=== normalizeFormData ===');
  console.log('Raw req.body:', JSON.stringify(req.body, null, 2));
  console.log('Raw req.file:', req.file ? { filename: req.file.filename } : 'none');
  if (req.body.experienceYears !== undefined) {
    req.body.experienceYears = Number(req.body.experienceYears);
  }
  ['education', 'projects', 'company'].forEach((field) => {
    if (typeof req.body[field] === 'string') {
      try { req.body[field] = JSON.parse(req.body[field]); } catch (e) {
        console.log(`Failed to parse ${field}:`, e.message);
      }
    }
  });
  console.log('Normalized req.body:', JSON.stringify(req.body, null, 2));
  next();
}

router.get('/', profileController.getProfile);
router.get('/:userId', profileController.getProfile);
router.put('/', uploadImage.single('avatar'), normalizeFormData, validateBody(createOrUpdateProfileSchema), profileController.createOrUpdateProfile);
router.post('/avatar', uploadImage.single('avatar'), profileController.uploadAvatar);
router.post('/resume', upload.single('resume'), profileController.uploadResume);
router.post('/roadmap', validateBody(generateRoadmapSchema), profileController.generateRoadmap);

module.exports = router;
