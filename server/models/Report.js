// server/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  avatarUrl: String,
  name: String,
  bio: String,
  followers: Number,
  publicRepos: Number,
  scores: {
    activity: Number,
    codeQuality: Number,
    diversity: Number,
    community: Number,
    hiringReady: Number,
    overall: Number
  },
  // We will populate these arrays later when building the UI
  topRepos: [{
    name: String,
    stars: Number,
    forks: Number,
    language: String,
    description: String,
    url: String
  }],
  languages: mongoose.Schema.Types.Mixed,
  // TTL Index: Automatically deletes the document 24 hours after creation
  createdAt: { type: Date, default: Date.now, expires: 86400 } 
});

module.exports = mongoose.model('Report', ReportSchema);