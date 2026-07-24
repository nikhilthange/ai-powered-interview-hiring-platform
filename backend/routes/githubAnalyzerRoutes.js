const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const githubAnalyzerController = require('../controllers/githubAnalyzerController');

const router = express.Router();

router.use(protect);

router.post('/analyze', githubAnalyzerController.analyzeGithubUser);

module.exports = router;
