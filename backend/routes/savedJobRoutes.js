const express = require('express');
const savedJobController = require('../controllers/savedJobController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', savedJobController.getSavedJobs);
router.post('/:jobId', savedJobController.saveJob);
router.delete('/:jobId', savedJobController.unsaveJob);
router.get('/:jobId/check', savedJobController.isJobSaved);

module.exports = router;
