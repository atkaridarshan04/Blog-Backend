import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.js'; 

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Establish MySQL connection
connectDB();

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
