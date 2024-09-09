import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createPost, deletePost, dislikePost, getAllPosts, getAllPostsByUser, getLikesCount, getPost, likePost, updatePost } from "../controllers/post.controller.js";

const router = Router();

router.post('/create', verifyJwt, createPost)

router.put('/update/:id', verifyJwt, updatePost)

router.delete('/delete/:id', verifyJwt, deletePost)

router.get('/get/:id', verifyJwt, getPost)

router.post('/:id/like', verifyJwt, likePost)

router.post('/:id/dislike', verifyJwt, dislikePost)

router.get('/:id/likes', getLikesCount)

router.get('/:id/posts', getAllPostsByUser)

router.get('/all-posts', getAllPosts)

export default router;