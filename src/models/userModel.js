import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from bcryptjs

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
}, {
    timestamps: true,  
});

const salt = 10
User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, salt)
})

User.beforeUpdate(async (user) => {
    if(user.changed('password')){
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    }
})

User.prototype.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export default User;
