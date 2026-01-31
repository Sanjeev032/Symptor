const express = require('express');
const router = express.Router();
const {
    getAllRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation
} = require('../controllers/recommendationController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware'); // Assuming you have an admin check

// Public read (optional, or protected)
router.get('/', auth, getAllRecommendations);

// Admin only write
router.post('/', auth, admin, createRecommendation);
router.post('/import', auth, admin, require('../controllers/recommendationController').importWellnessData); // Admin Import
router.put('/:id', auth, admin, updateRecommendation);
router.delete('/:id', auth, admin, deleteRecommendation);

// Public/User read
router.post('/search', auth, require('../controllers/recommendationController').getRecommendationsForSymptoms); // Filtered search

module.exports = router;
