import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.js'; 
import initDB from './db/init.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Establish MySQL connection
connectDB();

// Sync all models
initDB();

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
