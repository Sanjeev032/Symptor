const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // e.g. 'your-email@gmail.com'
        pass: process.env.SMTP_PASS  // e.g. 'app-specific-password'
    }
});

const sendVerificationEmail = async (email, token) => {
    // In production, use real URL. For now, localhost.
    const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;

    // Logic to mock if no credentials (so it works without breaking for user immediately)
    if (!process.env.SMTP_USER) {
        console.log(`[MOCK EMAIL] Verification Link for ${email}: ${url}`);
        return;
    }

    const mailOptions = {
        from: '"Symptor Auth" <noreply@symptor.ai>',
        to: email,
        subject: 'Verify your Symptor Account',
        html: `
            <h3>Welcome to Symptor!</h3>
            <p>Please click the link below to verify your email address:</p>
            <a href="${url}">${url}</a>
            <p>This link expires in 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    if (!process.env.SMTP_USER) {
        console.log(`[MOCK EMAIL] Reset Link for ${email}: ${url}`);
        return;
    }

    const mailOptions = {
        from: '"Symptor Auth" <noreply@symptor.ai>',
        to: email,
        subject: 'Reset Password Request',
        html: `
            <h3>Password Reset Request</h3>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${url}">${url}</a>
            <p>This link expires in 10 minutes.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
