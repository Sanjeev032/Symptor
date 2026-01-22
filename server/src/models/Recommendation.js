const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Yoga', 'Exercise', 'Stretch'],
        required: true
    },
    symptoms: [{
        type: String,
        trim: true
    }], // e.g. ['back pain', 'stress']
    duration: {
        type: String, // e.g. "5-10 mins"
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true // Now required for image-based Recs
    },
    imageSource: {
        type: String,
        required: true
    },
    imageLicense: {
        type: String, // e.g. "CC0", "Unsplash License"
        required: true
    },
    instructions: [{
        type: String
    }], // Optional now
    safetyTips: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
