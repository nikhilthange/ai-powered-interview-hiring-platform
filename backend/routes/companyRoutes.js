const express = require('express');
const companyController = require('../controllers/companyController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// Protected routes (must be logged in)
router.use(protect);

// Recruiter routes
router.post('/', restrictTo('recruiter'), companyController.uploadCompanyImages, companyController.createOrUpdateCompany);
router.get('/my/company', restrictTo('recruiter'), companyController.getMyCompany);

// Candidate routes
router.post('/:id/follow', restrictTo('candidate'), companyController.followCompany);
router.post('/:id/unfollow', restrictTo('candidate'), companyController.unfollowCompany);

module.exports = router;
