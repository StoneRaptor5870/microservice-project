const jwt = require('jsonwebtoken');

// Middleware for authenticating JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token not provided' });

    jwt.verify(token, process.env.JSONSECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is invalid' });
        req.user = user; // Attaching user info to request
        next();
    });
};

function authorizeRole(requiredRole) {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Forbidden: You don't have permission" });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRole };