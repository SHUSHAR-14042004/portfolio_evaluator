// server/controllers/profileController.js
const githubService = require('../services/githubService');
const scoringService = require('../services/scoringService');

const getProfileData = async (req, res) => {
  try {
    // Extract the username from the URL parameter
    const { username } = req.params;

    // Use Promise.all to fetch all three endpoints concurrently (much faster!)
    const [profile, repos, events] = await Promise.all([
      githubService.getUserProfile(username),
      githubService.getUserRepos(username),
      githubService.getUserEvents(username),
    ]);

    // Run the scoring algorithm
const scoreData = scoringService.generateScoreCard(profile, repos, events);

// Send the processed data back to the user
res.status(200).json({
  message: "Profile scored successfully",
  username: profile.login,
  avatarUrl: profile.avatar_url,
  scores: scoreData,
  // We will pull out top repos and language stats later!
});

  } catch (error) {
    console.error("Error fetching GitHub data:", error.message);
    // If GitHub throws an error (like a 404 for a wrong username), catch it here
    res.status(error.status || 500).json({ 
      error: "Could not fetch user profile. Please check the username." 
    });
  }
};

module.exports = {
  getProfileData,
};