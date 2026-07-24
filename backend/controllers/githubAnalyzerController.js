const GithubAnalysis = require('../models/GithubAnalysis');
const aiProvider = require('../services/aiProvider');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

async function githubFetch(url, headers) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`GitHub API error (${response.status})`);
  return response.json();
}

exports.analyzeGithubUser = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    return next(new AppError('GitHub username is required', 400));
  }

  const cleanUser = username.replace('https://github.com/', '').replace('/', '').trim();

  let userProfile = {};
  let userRepos = [];

  const githubHeaders = { 'User-Agent': 'HireMate-AI-SaaS' };
  const ghToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT_TOKEN;
  if (ghToken) {
    githubHeaders.Authorization = `token ${ghToken}`;
  }

  try {
    userProfile = await githubFetch(`https://api.github.com/users/${cleanUser}`, githubHeaders);
    userRepos = await githubFetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=10`, githubHeaders);
  } catch (err) {
    console.warn(`GitHub API request for ${cleanUser} failed: ${err?.message}`);
  }

  let contributionsThisYear = 0;
  try {
    const events = await githubFetch(`https://api.github.com/users/${cleanUser}/events?per_page=100`, githubHeaders);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    contributionsThisYear = Array.isArray(events) ? events.filter(e => new Date(e.created_at) > oneYearAgo).length : 0;
  } catch (err) {
    console.warn(`[githubAnalyzer] Events fetch failed: ${err.message}`);
  }

  const reposList = userRepos.map(r => ({
    name: r.name,
    desc: r.description || 'Public GitHub Repository',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    language: r.language || null
  }));

  const aiAudit = await aiProvider.auditGithubData({
    username: cleanUser,
    repos: reposList,
    userProfile
  });

  const languageMap = {};
  reposList.forEach(r => {
    if (r.language) languageMap[r.language] = (languageMap[r.language] || 0) + 1;
  });
  const langTotal = Object.values(languageMap).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(languageMap).map(([name, count]) => ({
    name,
    value: Math.round((count / langTotal) * 100)
  }));

  const analysis = await GithubAnalysis.create({
    candidateId: req.user ? req.user._id : null,
    username: cleanUser,
    codingScore: aiAudit.codingScore || Math.min(100, contributionsThisYear + reposList.length),
    totalRepos: userProfile.public_repos || reposList.length,
    totalStars: reposList.reduce((acc, curr) => acc + curr.stars, 0),
    contributionsThisYear,
    languages,
    topProjects: reposList.slice(0, 3),
    strengths: aiAudit.strengths || [],
    suggestions: aiAudit.suggestions || []
  });

  res.status(200).json({
    status: 'success',
    data: analysis
  });
});