import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";
import User from "./user.model.js";
import Post from "./post.model.js";

const generateCommentId = () => {
    return `comment_${uuidv4()}`;
};

const Comment = sequelize.define("Comment", {
    id: {
        type: DataTypes.STRING,
        defaultValue: generateCommentId,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Users",
            key: 'id'
        }
    },
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Posts",
            key: 'id'
        }
    }
}, {
    timestamps: true
})

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

export default Comment