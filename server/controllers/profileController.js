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

    // --- ADD THIS NEW LOGIC HERE ---
    // Extract top 4 repositories (ignoring forks, sorted by stars)
    const topRepos = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4)
      .map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
        description: repo.description || 'No description provided.',
        url: repo.html_url
      }));

    // Extract language statistics
    const languages = {};
    repos.forEach(repo => {
      if (repo.language && !repo.fork) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    // -------------------------------

    // 4. Save to Database (Update this block to include topRepos and languages)
    const newReport = await Report.create({
      username: lowerCaseUsername,
      avatarUrl: profile.avatar_url,
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      publicRepos: profile.public_repos,
      scores: scoreData,
      topRepos: topRepos,   // <-- Added
      languages: languages  // <-- Added
    });

    // 5. Send response
    res.status(200).json({ message: "New profile scored and cached", data: newReport });

  } catch (error) {
    console.error("Error:", error.message);
    // Send a clean 404 or 500 status with the specific error message
    const statusCode = error.message.includes("couldn't find") ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};


module.exports = {
  getProfileData,
};

