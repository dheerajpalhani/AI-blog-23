const express = require('express');
const router = express.Router();
const { processAiTask } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protected route for AI tasks streaming
router.post('/process', protect, processAiTask);

module.exports = router;
