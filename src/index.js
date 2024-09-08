import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
