import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Follower from "./follower.model.js";

// Function to generate a custom string ID (UUID)
const generateUserId = () => {
    return `user_${uuidv4()}`;  // Using uuidv4 to generate unique ID
};

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        defaultValue: generateUserId,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue('username', value.toLowerCase().trim());  // Lowercase and trim before saving
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue('email', value.toLowerCase().trim());
        },
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 100],  // Password should be at least 8 characters
        },
    },
    profilePic: {
        type: DataTypes.STRING,
        defaultValue: "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg",
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    paranoid: true, // Enables soft delete functionality
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Associations
User.belongsToMany(User, {
    through: Follower,
    as: 'followers',
    foreignKey: 'followingId'
});

User.belongsToMany(User, {
    through: Follower,
    as: 'following',
    foreignKey: 'followerId'
});


User.prototype.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password)
}

User.prototype.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

User.prototype.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export default User;
