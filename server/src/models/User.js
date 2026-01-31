const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // New Auth Fields
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    mobile: {
        type: String,
        unique: true,
        sparse: true // Allows null/unique values
    },
    otp: String,
    otpExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
