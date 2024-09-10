import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; // To manage MySQL manually
import { DB_NAME } from '../constants.js';

// Load environment variables from .env
dotenv.config();

// Initialize Sequelize instance for local MySQL connection
const sequelize = new Sequelize(DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST || 'localhost', // Default to localhost if not specified
  dialect: 'mysql',  // Specifies MySQL as the database dialect
  logging : false, // Disable logging
});

// Check if the database exists and create it if necessary
const createDatabaseIfNotExists = async () => {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD
    });

    const [rows] = await connection.execute(`SHOW DATABASES LIKE '${DB_NAME}'`);

    if (rows.length === 0) {
      // Database does not exist, create it
      console.log(`Database '${DB_NAME}' not found. Creating...`);
      await connection.execute(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Database '${DB_NAME}' created successfully.`);
    } else {
      console.log(`Database '${DB_NAME}' already exists.`);
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking or creating the database:', error);
    process.exit(1); // Exit if the database creation fails
  }
};

// Connect to the database
const connectDB = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    console.log('MySQL connected successfully via Sequelize!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
