const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    symptoms: [{
        type: String, // e.g., "headache"
        required: true
    }],
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        required: true
    },
    affectedSystems: [{
        type: String, // e.g., "nervous"
        required: true
    }],
    affectedOrgans: [{
        type: String, // e.g., "brain"
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    treatment: [{
        type: String, // e.g., "Rest", "Painkillers"
        required: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Disease', DiseaseSchema);
