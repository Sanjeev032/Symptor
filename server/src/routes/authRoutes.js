const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    sendOTP
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/send-otp', sendOTP);
router.get('/user', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
