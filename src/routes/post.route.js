import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createPost, deletePost, getPost, updatePost } from "../controllers/post.controller.js";

const router = Router();

router.post('/create', verifyJwt, createPost)

router.put('/update/:id', verifyJwt, updatePost)

router.delete('/delete/:id', verifyJwt, deletePost)

router.get('/get/:id', verifyJwt, getPost)

export default router;