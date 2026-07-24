const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const companyReviewController = require('../controllers/companyReviewController');

const router = express.Router();

router
  .route('/:companyId')
  .get(companyReviewController.getCompanyReviews);

router.use(protect);
router
  .route('/')
  .post(companyReviewController.createReview);

module.exports = router;
