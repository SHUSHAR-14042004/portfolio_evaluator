// server/services/githubService.js
const { Octokit } = require('@octokit/rest'); // [cite: 131]
require('dotenv').config();

console.log("Token check:", process.env.GITHUB_TOKEN ? "Token exists!" : "Token is missing!");
console.log("Token starts with:", process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.substring(0, 8) : "N/A");
// Initialize Octokit with your token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// 1. Fetch basic profile info (bio, followers, etc.)
// Example of how your githubService functions should handle errors
const getUserProfile = async (username) => {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  });

  if (!response.ok) {
    // If GitHub says 404, we throw a specific error
    if (response.status === 404) {
      throw new Error(`We couldn't find a GitHub user named "${username}".`);
    }
    // Handle rate limits or other errors
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return await response.json();
};

// Make sure getUserRepos and getUserEvents have similar !response.ok checks!
// 2. Fetch up to 100 repositories
const getUserRepos = async (username) => {
  const response = await octokit.rest.repos.listForUser({
    username,
    per_page: 100, // 
  });
  return response.data;
};

// 3. Fetch recent public events (for activity/streaks)
const getUserEvents = async (username) => {
  const response = await octokit.rest.activity.listPublicEventsForUser({
    username,
    per_page: 100,
  });
  return response.data;
};

// Export these functions so other files can use them
module.exports = {
  getUserProfile,
  getUserRepos,
  getUserEvents,
};