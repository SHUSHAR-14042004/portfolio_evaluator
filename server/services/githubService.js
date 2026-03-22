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
const getUserProfile = async (username) => {
  const response = await octokit.rest.users.getByUsername({ username });
  return response.data;
};

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