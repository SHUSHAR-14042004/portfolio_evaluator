// 1. Hiring Readiness (15%) [cite: 110]
const calculateHiringReady = (profile) => {
  let score = 0;
  if (profile.bio) score += 5;
  if (profile.blog) score += 5; // GitHub calls the website 'blog'
  if (profile.email) score += 5;
  // Note: True pinned repos require a GraphQL call, so we skip it for now or assume points if they have > 5 public repos.
  return Math.min(score, 15); 
};

// 2. Community Impact (20%) [cite: 110]
const calculateCommunity = (profile, repos) => {
  let score = 0;
  if (profile.followers > 50) score += 5;
  
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  // Log scale representation (simplified)
  score += Math.min(totalStars / 10, 10); 
  score += Math.min(totalForks / 5, 5);
  
  return Math.min(score, 20);
};

// 3. Project Diversity (20%) [cite: 110]
const calculateDiversity = (repos) => {
  let score = 0;
  const uniqueLanguages = new Set();
  
  repos.forEach(repo => {
    if (repo.language) uniqueLanguages.add(repo.language);
  });
  
  // 1pt per unique language (max 10) [cite: 110]
  score += Math.min(uniqueLanguages.size, 10);
  
  // You can add logic here later for topics/categories
  score += 10; // Baseline points for completion for now
  
  return Math.min(score, 20);
};

// 4. Code Quality (20%) [cite: 109]
const calculateCodeQuality = (repos) => {
  let score = 0;
  repos.forEach(repo => {
    if (repo.has_wiki || repo.has_pages) score += 2; // Proxy for docs/README
    if (repo.license) score += 1;
  });
  return Math.min(score, 20);
};

// 5. Activity Score (25%) [cite: 109]
const calculateActivity = (events) => {
  let score = 0;
  const pushEvents = events.filter(e => e.type === 'PushEvent');
  
  // 1 point per recent push event (max 20pts) [cite: 109]
  score += Math.min(pushEvents.length, 20);
  score += 5; // Baseline for streak consistency for now
  
  return Math.min(score, 25);
};

// Master Scoring Function
// Master Scoring Function
  const generateScoreCard = (profile, repos, events) => {
  const hiringReady = calculateHiringReady(profile);
  const community = calculateCommunity(profile, repos);
  const diversity = calculateDiversity(repos);
  const codeQuality = calculateCodeQuality(repos);
  const activity = calculateActivity(events);

  const overallScore = Math.round(hiringReady + community + diversity + codeQuality + activity);

  // FIXED: Variable names now match exactly what was calculated above!
  return {
    overall: overallScore,
    activity: activity,
    codeQuality: codeQuality,
    diversity: diversity,
    community: community,
    hiringReady: hiringReady
  };
};

module.exports = { generateScoreCard };