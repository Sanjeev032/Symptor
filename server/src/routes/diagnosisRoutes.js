const express = require('express');
const router = express.Router();
const { diagnose, getSymptoms, getHistory } = require('../controllers/diagnosisController');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/symptoms', getSymptoms);
router.post('/', optionalAuth, diagnose);
router.get('/history', auth, getHistory);

module.exports = router;
