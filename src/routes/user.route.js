import { Router } from 'express';
import { changePassword, deleteUser, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerUser)

router.post('/login', loginUser)

router.post('/logout', verifyJwt ,logoutUser)

router.post('/refresh-token', refreshAccessToken)

router.put('/change-password', verifyJwt,changePassword)

router.get('/get-user', verifyJwt,getCurrentUser)

router.put('/update-details', verifyJwt, updateAccountDetails)

router.delete('/delete', verifyJwt, deleteUser)

export default router;
