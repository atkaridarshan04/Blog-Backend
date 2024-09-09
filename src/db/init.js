import { sequelize } from './connect.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';

// Function to initialize database models and sync them
const initDB = async () => {
    try {
        // Add any associations here if needed
        await sequelize.sync({ alter: false });  // true to sync all models at once
        // while using nodemon in dev env, run true for 1st start then keep it false
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    }
};

export default initDB;
