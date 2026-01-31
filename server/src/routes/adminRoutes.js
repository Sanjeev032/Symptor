const express = require('express');
const router = express.Router();
const { createDisease, getAllDiseases, updateDisease, deleteDisease } = require('../controllers/adminController');
const { importDiseaseData, importExerciseData } = require('../controllers/externalDataController');
const auth = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

router.post('/diseases', auth, adminCheck, createDisease);
router.get('/diseases', auth, adminCheck, getAllDiseases);
router.put('/diseases/:id', auth, adminCheck, updateDisease);
router.delete('/diseases/:id', auth, adminCheck, deleteDisease);

// Import Endpoints
router.post('/import/disease', auth, adminCheck, importDiseaseData);
router.post('/import/exercise', auth, adminCheck, importExerciseData);

module.exports = router;
