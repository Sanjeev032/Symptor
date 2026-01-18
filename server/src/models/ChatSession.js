const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        sender: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    context: {
        // IDs of diseases that match the current symptoms
        potentialDiseases: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Disease'
        }],
        // Symptoms the user has confirmed
        confirmedSymptoms: [{
            type: String
        }],
        // The last question asked by the bot (to handle the answer)
        lastQuestionType: {
            type: String, // 'symptom_check', 'general', 'greeting'
            default: 'general'
        },
        // The symptom the bot just asked about (if lastQuestionType is 'symptom_check')
        pendingSymptom: {
            type: String
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
