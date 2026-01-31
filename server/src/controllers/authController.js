const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

// Helper
const generateToken = (id, role) => {
    return jwt.sign({ userId: id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

const register = async (req, res) => {
    const { name, email, password, role, mobile } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Mobile check (if provided)
        if (mobile) {
            const mobileUser = await User.findOne({ mobile });
            if (mobileUser) return res.status(400).json({ message: 'Mobile number already used' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            mobile,
            isVerified: false,
            emailVerificationToken: verificationToken
        });

        await user.save();

        // Send Verification Email
        await sendVerificationEmail(email, verificationToken);

        res.json({
            message: 'Registration successful. Please check your email to verify your account.',
            verificationRequired: true
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, mobile, otp } = req.body;

        // Mobile OTP Login Flow
        if (mobile && otp) {
            return await verifyMobileOTP(req, res);
        }

        // Email Password Login Flow
        if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const token = generateToken(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });

    } catch (err) {
        console.error('Login Error details:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and save to DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

        await user.save();

        await sendResetPasswordEmail(user.email, resetToken);

        res.json({ message: 'Password reset link sent to email' });

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Mobile OTP --

const sendOTP = async (req, res) => {
    const { mobile } = req.body;
    try {
        const user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ message: 'Mobile number not registered' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        user.otp = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 mins
        await user.save();

        await sendSMS(mobile, `Your Login OTP is ${otp}`);

        res.json({ message: 'OTP sent to mobile' });

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const verifyMobileOTP = async (req, res) => {
    const { mobile, otp } = req.body;
    try {
        const user = await User.findOne({ mobile });
        if (!user) return res.status(400).json({ message: 'Invalid request' });

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        const token = generateToken(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP: verifyMobileOTP
};
