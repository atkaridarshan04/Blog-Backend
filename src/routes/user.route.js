import { Router } from 'express';
import { changePassword, deleteUser, followUser, getCurrentUser, getFollowerCount, loginUser, logoutUser, refreshAccessToken, registerUser, unfollowUser, updateAccountDetails } from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerUser)

router.post('/login', loginUser)

router.post('/logout', verifyJwt, logoutUser)

router.post('/refresh-token', refreshAccessToken)

router.put('/change-password', verifyJwt, changePassword)

router.get('/get-user', verifyJwt, getCurrentUser)

router.put('/update-details', verifyJwt, updateAccountDetails)

router.delete('/delete', verifyJwt, deleteUser)

router.post("/:id/follow", verifyJwt, followUser)

router.delete("/:id/unfollow", verifyJwt, unfollowUser)

router.get('/:id/total-followers', getFollowerCount)

export default router;
