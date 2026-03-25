// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import your routes
const profileRoutes = require('./routes/profileRoutes');

// 1. Initialize the Express application FIRST
const app = express();

// 2. Connect to the database
connectDB();

// 3. Apply Middleware (CORS and JSON parser)
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 4. Define Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount the profile routes under the '/api' prefix
app.use('/api', profileRoutes);

// 5. Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});