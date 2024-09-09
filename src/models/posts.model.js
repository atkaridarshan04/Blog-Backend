import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";
import { v4 as uuidv4 } from 'uuid';
import User from "./user.model.js";

const generatePostId = () => {
    return `post_${uuidv4()}`; 
};
const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.STRING,
        defaultValue: generatePostId,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ownerId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Users', 
            key: 'id'
        }
    }
}, {
    timestamps: true,
});

// Define associations
Post.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Increment likes
Post.prototype.incrementLikes = async function () {
    this.likes += 1;
    await this.save();
};

// Decrement likes
Post.prototype.decrementLikes = async function () {
    if (this.likes > 0) {
        this.likes -= 1;
        await this.save();
    }
};

Post.prototype.getLikesCount = function () {
    return this.likes;
};

export default Post;
