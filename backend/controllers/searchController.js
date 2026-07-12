const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const Profile = require('../models/Profile');
const catchAsync = require('../utils/catchAsync');

exports.globalSearch = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(200).json({
      status: 'success',
      data: {
        jobs: [],
        companies: [],
        users: [],
        skills: []
      }
    });
  }

  const queryRegex = new RegExp(q, 'i');
  
  // Prepare parallel queries
  // 1. Search Jobs (title, location)
  const jobsPromise = Job.find({
    status: 'active',
    $or: [
      { title: queryRegex },
      { location: queryRegex }
    ]
  })
    .select('title location jobType companyId recruiterId')
    .populate('companyId', 'name logo')
    .populate('recruiterId', 'email')
    .limit(5)
    .lean();

  // 2. Search Companies (name, industry)
  const companiesPromise = Company.find({
    $or: [
      { name: queryRegex },
      { industry: queryRegex }
    ]
  })
    .select('name industry logo location')
    .limit(5)
    .lean();

  // 3. Search Users (Recruiters or Candidates based on requester role, per requirements)
  // Only Recruiter or Admin can search Candidates
  const roleFilter = {};
  if (req.user.role === 'candidate') {
    roleFilter.role = 'recruiter';
  }
  
  const usersPromise = User.find({
    ...roleFilter,
    $or: [
      { name: queryRegex },
      { email: queryRegex }
    ]
  })
    .select('name email role avatarUrl')
    .limit(5)
    .lean();

  // 4. Search Skills
  // We can search the distinct skills in profiles and jobs
  const profileSkillsPromise = Profile.distinct('skills', { skills: queryRegex });
  const jobSkillsPromise = Job.distinct('skillsRequired', { skillsRequired: queryRegex });

  // Execute all promises in parallel
  const [jobs, companies, users, profileSkills, jobSkills] = await Promise.all([
    jobsPromise,
    companiesPromise,
    usersPromise,
    profileSkillsPromise,
    jobSkillsPromise
  ]);

  // Combine and deduplicate skills, then limit to 5
  const combinedSkills = [...new Set([...profileSkills, ...jobSkills])];
  const skills = combinedSkills
    .filter(skill => queryRegex.test(skill))
    .slice(0, 5)
    .map(skill => ({ name: skill }));

  res.status(200).json({
    status: 'success',
    data: {
      jobs,
      companies,
      users,
      skills
    }
  });
});
