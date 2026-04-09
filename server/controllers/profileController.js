// server/controllers/profileController.js
const githubService = require('../services/githubService');
const scoringService = require('../services/scoringService');
const Report = require('../models/Report');

// ==========================================
// HELPER FUNCTION: Fetches and scores a single user
// ==========================================
const fetchAndScoreProfile = async (username) => {
  const lowerCaseUsername = username.toLowerCase();
  
  // 1. Check if a cached report exists
  const cachedReport = await Report.findOne({ username: lowerCaseUsername });
  if (cachedReport) {
    console.log(`Serving ${username} from Cache!`);
    return cachedReport;
  }

  // 2. If not in cache, fetch from GitHub
  console.log(`Fetching fresh data for ${username} from GitHub...`);
  const [profile, repos, events] = await Promise.all([
    githubService.getUserProfile(username),
    githubService.getUserRepos(username),
    githubService.getUserEvents(username),
  ]);

  // 3. Score the data
  const scoreData = scoringService.generateScoreCard(profile, repos, events);

  // Extract top repositories (ignoring forks, sorted by stars)
  const topRepos = repos
    .filter(repo => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6) // Kept to 6 to match the PDF spec
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

  // 4. Save or Update the Database (Upsert)
  const newReport = await Report.findOneAndUpdate(
    { username: lowerCaseUsername },
    {
      username: lowerCaseUsername,
      avatarUrl: profile.avatar_url,
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      publicRepos: profile.public_repos,
      scores: scoreData,
      topRepos: topRepos,
      languages: languages
    },
    { new: true, upsert: true }
  );

  return newReport;
};

// ==========================================
// ROUTE 1: Get Single Profile
// ==========================================
const getProfileData = async (req, res) => {
  try {
    const { username } = req.params;
    const report = await fetchAndScoreProfile(username);
    res.status(200).json({ message: "Profile fetched successfully", data: report });
  } catch (error) {
    console.error("Error:", error.message);
    const statusCode = error.message.includes("couldn't find") ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

// ==========================================
// ROUTE 2: Compare Two Profiles
// ==========================================
const compareProfiles = async (req, res) => {
  try {
    const { u1, u2 } = req.query; // Extracts u1 and u2 from the URL

    if (!u1 || !u2) {
      return res.status(400).json({ error: 'Please provide both u1 and u2 usernames' });
    }

    // Fetch both profiles simultaneously for speed using our helper!
    const [profile1, profile2] = await Promise.all([
      fetchAndScoreProfile(u1), 
      fetchAndScoreProfile(u2)
    ]);

    res.status(200).json({ user1: profile1, user2: profile2 });
  } catch (error) {
    console.error("Compare Error:", error.message);
    res.status(500).json({ error: 'Failed to compare profiles. Check usernames.' });
  }
};

// Export both functions so your routes file can use them
module.exports = {
  getProfileData,
  compareProfiles
};