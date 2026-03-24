// server/controllers/profileController.js
const githubService = require('../services/githubService');
const scoringService = require('../services/scoringService');
const Report = require('../models/Report');

const getProfileData = async (req, res) => {
  try {
    const { username } = req.params;
    const lowerCaseUsername = username.toLowerCase();

    // 1. Check if a cached report exists
    const cachedReport = await Report.findOne({ username: lowerCaseUsername });
    if (cachedReport) {
      console.log("Serving from Cache!");
      return res.status(200).json({ message: "Cached profile found", data: cachedReport });
    }

    // 2. If not in cache, fetch from GitHub
    console.log("Fetching fresh data from GitHub...");
    const [profile, repos, events] = await Promise.all([
      githubService.getUserProfile(username),
      githubService.getUserRepos(username),
      githubService.getUserEvents(username),
    ]);

    // 3. Score the data
    const scoreData = scoringService.generateScoreCard(profile, repos, events);

    // 4. Save to Database
    const newReport = await Report.create({
      username: lowerCaseUsername,
      avatarUrl: profile.avatar_url,
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      publicRepos: profile.public_repos,
      scores: scoreData
    });

    // 5. Send response
    res.status(200).json({ message: "New profile scored and cached", data: newReport });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(error.status || 500).json({ error: "Could not process profile." });
  }
};

module.exports = {
  getProfileData,
};