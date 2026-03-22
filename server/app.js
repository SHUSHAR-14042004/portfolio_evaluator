// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import your new routes
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check endpoint [cite: 106]
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount the profile routes under the '/api' prefix
app.use('/api', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});