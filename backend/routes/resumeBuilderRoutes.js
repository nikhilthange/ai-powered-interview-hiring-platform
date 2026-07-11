const express = require('express');
const router = express.Router();
const {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  importResume,
  aiAssist
} = require('../controllers/resumeBuilderController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed!'), false);
    }
  }
});

// All routes require authentication
router.use(protect);

router.route('/')
  .post(createResume)
  .get(getResumes);

router.post('/import', upload.single('file'), importResume);
router.post('/ai-assist', aiAssist);

router.route('/:id')
  .get(getResume)
  .put(updateResume)
  .delete(deleteResume);

module.exports = router;
