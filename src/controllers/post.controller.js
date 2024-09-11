import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Post from "../models/post.model.js";
import Tag from "../models/tag.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
    const { title, content, category, tags } = req.body
    const ownerId = req.user.id
    const imageUrl = req.file ? req.file.path : null;  // Cloudinary URL for the post image

    try {
        if (!title || !content || !category || !tags) {
            return res.status(400).json({ message: "Title, content, category and tags are required" })
        }

        const post = await Post.create({
            title,
            content,
            category,
            imageUrl,
            ownerId
        })

        const tagList = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

        const tagInstances = await Promise.all(tagList.map(async tagName => {
            // Find or create a tag with the given name
            const [tag] = await Tag.findOrCreate({
                where: { name: tagName }
            });
            return tag;
        }));

        // Associate tags with the post
        await post.setTags(tagInstances);

        return res.status(201).json({ message: "Post created successfully!", post, tags: tagInstances });
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
            return res.status(404).json({ message: "Post not found" })
        }

        if (ownerId !== post.ownerId) {
            return res.status(401).json({ message: "Unauthorized request: You cannot update this post" })
        }

        const { title, content, category } = req.body
        if (title) post.title = title
        if (content) post.content = content
        if (category) post.category = category

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
            return res.status(401).json({ message: "Unauthorized request: You cannot delete this post" })
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

        const post = await Post.findByPk(postId, {
            include: {
                model: Tag,
                as: 'tags',
                attributes: ['name']
            }
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const { ownerId, ...postWithoutOwnerId } = post.toJSON();

        return res.status(200).json({ message: "Post fetched successfully", post: postWithoutOwnerId });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
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

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const posts = await Post.findAll({
            where: { ownerId: userId },
            include: {
                model: Tag,
                as: 'tags',
                attributes: ['name']
            }
        });

        if (posts.length === 0) return res.status(404).json({ message: "No posts found" });

        return res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: Tag,
                as: 'tags',
                attributes: ['name']
            }
        });
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

export const getAllComments = async (req, res) => {
    const postId = req.params.id;

    try {
        const comments = await Comment.findAll({ where: { postId: postId } })
        if (comments.length == 0) return res.status(404).json({ message: "No comments found" });

        return res.status(200).json({ message: "Comments fetched successfully!", comments });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateComment = async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.id;

    try {
        const comment = await Comment.findByPk(commentId)
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (userId !== comment.userId) return res.status(403).json({ message: "Unauthorized: You cannot update this comment" })

        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Content is required to update the comment" });
        }

        comment.content = content;
        await comment.save();

        return res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteComment = async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.id;

    try {
        const comment = await Comment.findByPk(commentId)
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (userId !== comment.userId) return res.status(403).json({ message: "Unauthorized: You cannot delete this comment" })

        await comment.destroy();

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updatePostTags = async (req, res) => {
    try {
        const postId = req.params.id;
        const { tags } = req.body;

        const tagList = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

        const post = await Post.findByPk(postId, { include: 'tags' });
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Find or create tag instances
        const tagInstances = await Promise.all(tagList.map(async (tagName) => {
            let tag = await Tag.findOne({ where: { name: tagName } });
            if (!tag) {
                tag = await Tag.create({ name: tagName });
            }
            return tag;
        }));

        // Update post's tags
        await post.setTags(tagInstances);

        return res.status(200).json({ message: "Post tags updated successfully", post, tags: tagInstances });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deletePostTags = async (req, res) => {
    try {
        const postId = req.params.id;
        const { tags } = req.body;

        const tagList = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

        const post = await Post.findByPk(postId, { include: 'tags' });
        if (!post) return res.status(404).json({ message: "Post not found" });

        const tagInstances = await Promise.all(tagList.map(async (tagName) => {
            return await Tag.findOne({ where: { name: tagName } });
        }));

        // Remove tags from post
        await post.removeTags(tagInstances);

        return res.status(200).json({ message: "Post tags removed successfully", post });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getPostByTag = async (req, res) => {
    const tagName = req.params.tag;
    try {
        const tag = await Tag.findOne({ where: { name: tagName } });
        if (!tag) return res.status(404).json({ message: "Tag not found" });

        const posts = await Post.findAll({
            include: {
                model: Tag,
                as: 'tags',
                attributes: []  // No need to include tag attributes
            },
            where: {
                '$tags.name$': tagName
            }
        });

        if (posts.length === 0) return res.status(404).json({ message: "No posts found with this tag" });

        return res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getPostsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        const posts = await Post.findAll({
            where: {
                category
            }
        });

        if (posts.length === 0) {
            return res.status(404).json({ message: "No posts found in this category" });
        }

        return res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}
