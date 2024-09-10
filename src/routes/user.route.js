import { Router } from 'express';
import { changePassword, deleteUser, followUser, getCurrentUser, getFollower, getFollowerCount, getFollowings, loginUser, logoutUser, refreshAccessToken, registerUser, unfollowUser, updateAccountDetails, updateUserProfilePicture } from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import upload from '../config/multer.config.js';

const router = Router();

router.post('/register', upload.single('image'), registerUser)

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

router.get('/:id/followers', getFollower)

router.get('/:id/followings', getFollowings)

router.post('/profile/upload', verifyJwt, upload.single('image'), updateUserProfilePicture);

export default router;
