import { Router } from 'express';
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerUser);

router.post('/login', loginUser)

router.post('/logout', verifyJwt ,logoutUser)

router.post('/refresh-token', refreshAccessToken);

export default router;
