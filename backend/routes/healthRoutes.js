const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/health', healthController.getHealth);
router.get('/live', healthController.getLive);
router.get('/ready', healthController.getReady);
router.get('/metrics', healthController.getMetrics);

module.exports = router;
