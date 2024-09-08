import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { DB_NAME } from '../constants.js';

// Load environment variables from .env
dotenv.config();

// Initialize Sequelize instance for local MySQL connection
const sequelize = new Sequelize(DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST || 'localhost', // Default to localhost if not specified
  dialect: 'mysql',  // Specifies MySQL as the database dialect
  // logging : false, // Disable logging
});

// Connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully via Sequelize!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit if the connection fails
  }
};

export { sequelize, connectDB };
