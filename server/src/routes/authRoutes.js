const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
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
