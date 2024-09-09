import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createPost, updatePost } from "../controllers/post.controller.js";

const router = Router();

router.post('/create', verifyJwt, createPost)

router.put('/update/:id', verifyJwt, updatePost)

export default router;