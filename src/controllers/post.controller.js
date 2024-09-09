import e from "express";
import Post from "../models/posts.model.js";

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

        res.status(201).json({ message: "Post created successfully!", post });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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

        if (!ownerId === post.ownerId) {
            res.status(401).json({ message: "Unauthorized request " })
        }

        const { title, content } = req.body
        if (title) post.title = title
        if (content) post.content = content

        await post.save();

        return res.status(200).json({ message: "Post updated successfully", post })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}