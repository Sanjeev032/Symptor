const Recommendation = require('../models/Recommendation');

// Get all recommendations (for admin)
const getAllRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find({}).sort({ createdAt: -1 });
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create new recommendation
const createRecommendation = async (req, res) => {
    try {
        const newRecommendation = new Recommendation(req.body);
        const saved = await newRecommendation.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update recommendation
const updateRecommendation = async (req, res) => {
    try {
        const updated = await Recommendation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete recommendation
const deleteRecommendation = async (req, res) => {
    try {
        await Recommendation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recommendation deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation
};
