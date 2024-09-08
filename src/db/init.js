import { sequelize } from './connect.js';
import User from '../models/userModel.js';

// Function to initialize database models and sync them
const initDB = async () => {
    try {
        // Add any associations here if needed
        await sequelize.sync({ alter: true });  // Sync all models at once
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    }
};

export default initDB;
