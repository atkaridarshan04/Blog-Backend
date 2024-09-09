import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";

const router = Router();

router.post('/create', verifyJwt, createPost)

export default router;