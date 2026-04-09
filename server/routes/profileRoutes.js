const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// 1. Compare Route (MUST be defined before the /:username route)
// Matches 'compareProfiles' exported from the controller
router.get('/compare', profileController.compareProfiles);

// 2. Single Profile Route 
// Matches 'getProfileData' exported from the controller
router.get('/:username', profileController.getProfileData);

module.exports = router;