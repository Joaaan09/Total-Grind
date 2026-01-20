const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'powerlift-pro-secret-key-change-in-production';

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided, authorization denied' });
        }

        const token = authHeader.split(' ')[1];

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Obtener usuario del token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Autenticación opcional - no falla si no hay token, solo establece req.user si está presente
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            if (user) req.user = user;
        }

        next();
    } catch (error) {
        // Token inválido, continuar sin usuario
        next();
    }
};

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };
