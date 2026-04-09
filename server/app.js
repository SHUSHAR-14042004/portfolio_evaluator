// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Import your routes
const profileRoutes = require('./routes/profileRoutes');

// 1. Initialize the Express application FIRST
const app = express();

// 2. Connect to the database
connectDB();

// 3. Apply Middleware (CORS and JSON parser)
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 4. API ROUTES (MUST BE DEFINED FIRST!)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount the profile routes under the '/api' prefix
app.use('/api/profile', profileRoutes);


// ----------------------------------------------------
// 5. PRODUCTION SETUP (MUST BE DEFINED LAST!)
// ----------------------------------------------------
// Serve the React frontend's static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// The Catch-All Route: safely catches EVERYTHING in Express 5+ 
// without triggering the strict path-to-regexp errors!
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});


// ----------------------------------------------------
// 6. START THE SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});