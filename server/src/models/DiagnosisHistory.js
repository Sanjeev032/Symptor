const mongoose = require('mongoose');

const DiagnosisHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: [{
        type: String,
        required: true
    }],
    diagnosis: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true
    },
    affectedSystems: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('DiagnosisHistory', DiagnosisHistorySchema);
