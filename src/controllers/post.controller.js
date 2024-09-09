import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
    const { title, content } = req.body
    const ownerId = req.user.id

    try {
        if (!title || !content) {
            return res.status(400).json({ message: "Please provide title and content of post" })
        }

        const post = await Post.create({
            title,
            content,
            ownerId
        })

        return res.status(201).json({ message: "Post created successfully!", post });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const ownerId = req.user.id;

        const post = await Post.findByPk(postId)
        if (!post) {
            res.status(404).json({ message: "Post not found" })
        }

        if (ownerId !== post.ownerId) {
            res.status(401).json({ message: "Unauthorized request" })
        }

        const { title, content } = req.body
        if (title) post.title = title
        if (content) post.content = content

        await post.save();

        return res.status(200).json({ message: "Post updated successfully", post })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const ownerId = req.user.id;

        const post = await Post.findByPk(postId)
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        if (ownerId !== post.ownerId) {
            res.status(401).json({ message: "Unauthorized request" })
        }

        await post.destroy();

        return res.status(200).json({ message: "Post deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const getPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findByPk(postId)
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const { ownerId, ...postWithoutOwnerId } = post.toJSON();

        return res.status(200).json({ message: "Post fetched successfully", post: postWithoutOwnerId })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const likePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const existingLike = await Like.findOne({ where: { userId, postId } });
        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this post" });
        }

        await Like.create({ userId, postId });

        await post.incrementLikes()

        return res.status(200).json({ message: "Post liked successfully", likes: post.likes });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const dislikePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const existingLike = await Like.findOne({ where: { userId, postId } });
        if (!existingLike) {
            return res.status(400).json({ message: "You have not liked this post yet" });
        }

        await existingLike.destroy();

        await post.decrementLikes();

        return res.status(200).json({ message: "Post disliked successfully", likes: post.likes });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getLikesCount = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId)

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await post.getLikesCount()
        return res.status(200).json({ message: "Post fetched successfully", likes: post.likes });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const getAllPostsByUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId)
        if (!user) return res.status(404).json({ message: "User not found" });

        const posts = await Post.findAll({ where: { ownerId: userId } });
        if (posts.length === 0) return res.status(404).json({ message: "No posts found" });

        return res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        if (posts.length === 0) return res.status(404).json({ message: "No posts found" });

        return res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const comment = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;

    try {
        const post = await Post.findByPk(postId)
        if (!post) return res.status(404).json({ message: "Post not found" });

        const { content } = req.body
        if (!content) return res.status(400).json({ message: "Comment content is required" })

        const comment = await Comment.create({
            content,
            userId,
            postId
        })

        return res.status(201).json({ message: "Comment created successfully!", comment });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}