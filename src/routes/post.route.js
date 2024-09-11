import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { comment, createPost, deleteComment, deletePost, deletePostTags, dislikePost, getAllComments, getAllPosts, getAllPostsByUser, getLikesCount, getPost, likePost, updateComment, updatePost, updatePostTags } from "../controllers/post.controller.js";
import upload from "../config/multer.config.js";

const router = Router();

router.post('/create', verifyJwt, upload.single('image'), createPost)

router.put('/update/:id', verifyJwt, updatePost)

router.delete('/delete/:id', verifyJwt, deletePost)

router.get('/get/:id', verifyJwt, getPost)

router.post('/:id/like', verifyJwt, likePost)

router.post('/:id/dislike', verifyJwt, dislikePost)

router.get('/:id/likes', getLikesCount)

router.get('/:id/posts', getAllPostsByUser)

router.get('/all-posts', getAllPosts)

router.post('/:id/comment', verifyJwt, comment)

router.get('/:id/all-comments', getAllComments)

router.put("/comments/:id/", verifyJwt, updateComment)

router.delete("/comments/:id/", verifyJwt, deleteComment)

router.put('/:id/update-tags', updatePostTags)

router.delete('/:id/delete-tags', deletePostTags)

export default router;