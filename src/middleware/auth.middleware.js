import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const verifyJwt = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized request' });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the token
        const user = await User.findByPk(decodedToken.id, { attributes: { exclude: ['password', 'refreshToken'] } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid Access Token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message || 'Invalid access token' });
    }
};

export { verifyJwt };
