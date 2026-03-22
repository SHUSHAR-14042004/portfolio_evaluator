// server/controllers/profileController.js
const githubService = require('../services/githubService');

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

    // For today, we are just returning the raw, un-scored data to prove it works.
    res.status(200).json({
      message: "Data fetched successfully",
      profile,
      repoCount: repos.length,
      eventCount: events.length
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