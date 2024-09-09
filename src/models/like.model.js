import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";
import User from "./user.model.js";
import Post from "./post.model.js";

const Like = sequelize.define('Like', {
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
});

// Associations
User.belongsToMany(Post, { through: Like, foreignKey: 'userId' });
Post.belongsToMany(User, { through: Like, foreignKey: 'postId' });

export default Like;
