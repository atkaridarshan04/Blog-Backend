import { sequelize } from './connect.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
import Follower from '../models/follower.model.js';
import Tag from '../models/tag.model.js';   

// Function to initialize database models and sync them
const initDB = async () => {
    try {
        // Models should be loaded before syncing
        await sequelize.sync({ alter: false });  // Set to false in production
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    }
};

export default initDB;
