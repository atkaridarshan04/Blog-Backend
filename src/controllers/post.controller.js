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