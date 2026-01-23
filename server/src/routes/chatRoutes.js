const express = require('express');
const router = express.Router();
const { sendMessage, getHistory } = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.post('/message', auth, sendMessage);
router.get('/history', auth, getHistory);

module.exports = router;
