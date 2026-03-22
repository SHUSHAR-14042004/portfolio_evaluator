// server/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Define the GET route for fetching a profile [cite: 106]
// The ':username' acts as a dynamic variable
router.get('/profile/:username', profileController.getProfileData);

module.exports = router;