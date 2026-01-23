const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        // If token is invalid, just proceed as guest
        next();
    }
};

module.exports = optionalAuth;
