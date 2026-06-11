const express = require('express');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const uploadImage = require('../middleware/uploadImageMiddleware');
const {
  validateBody,
  createOrUpdateProfileSchema,
  generateRoadmapSchema
} = require('../validators/profileValidator');

const router = express.Router();

router.use(protect);

router.get('/', profileController.getProfile);
router.get('/:userId', profileController.getProfile);
router.put('/', validateBody(createOrUpdateProfileSchema), profileController.createOrUpdateProfile);
router.post('/avatar', uploadImage.single('avatar'), profileController.uploadAvatar);
router.post('/resume', upload.single('resume'), profileController.uploadResume);
router.post('/roadmap', validateBody(generateRoadmapSchema), profileController.generateRoadmap);

module.exports = router;
