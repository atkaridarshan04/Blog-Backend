import { Router } from 'express';
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerUser)

router.post('/login', loginUser)

router.post('/logout', verifyJwt ,logoutUser)

router.post('/refresh-token', refreshAccessToken)

router.post('/change-password', verifyJwt,changePassword)

router.get('/get-user', verifyJwt,getCurrentUser)

router.post('/update-details', verifyJwt, updateAccountDetails)

export default router;
