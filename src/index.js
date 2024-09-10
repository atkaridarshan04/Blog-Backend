import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.js';
import initDB from './db/init.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware for handling CORS, JSON, and static files
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Establish MySQL connection and sync all models
(async () => {
  await connectDB();
  await initDB();

  // Basic route for testing
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // User and Post routes
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
