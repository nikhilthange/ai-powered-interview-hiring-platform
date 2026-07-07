const WEIGHTS = {
  fullName: 5,
  email: 5,
  phone: 5,
  avatarUrl: 5,
  headline: 10,
  bio: 10,
  skills: 15,
  experienceYears: 10,
  education: 10,
  resumeUrl: 10,
  portfolio: 5,
  github: 5,
  linkedin: 5,
};

const FIELD_LABELS = {
  fullName: 'Name',
  email: 'Email',
  phone: 'Phone',
  avatarUrl: 'Profile Photo',
  headline: 'Headline',
  bio: 'Bio',
  skills: 'Skills',
  experienceYears: 'Experience',
  education: 'Education',
  resumeUrl: 'Resume',
  portfolio: 'Portfolio',
  github: 'GitHub',
  linkedin: 'LinkedIn',
};

function isFieldComplete(field, profile, user) {
  switch (field) {
    case 'email':
      return Boolean(user?.email);
    case 'skills':
      return Array.isArray(profile.skills) && profile.skills.length > 0;
    case 'experienceYears':
      return typeof profile.experienceYears === 'number' && profile.experienceYears > 0;
    case 'education':
      return Array.isArray(profile.education) && profile.education.length > 0;
    default:
      return Boolean(profile[field]);
  }
}

function calculateProfileCompletion(profile, user = {}) {
  if (!profile) {
    return { completionPercentage: 0, completedFields: [], missingFields: [] };
  }
  const completedFields = [];
  const missingFields = [];
  let total = 0;

  for (const [field, weight] of Object.entries(WEIGHTS)) {
    if (isFieldComplete(field, profile, user)) {
      total += weight;
      completedFields.push(FIELD_LABELS[field]);
    } else {
      missingFields.push(FIELD_LABELS[field]);
    }
  }

  return {
    completionPercentage: total,
    completedFields,
    missingFields,
  };
}

module.exports = { calculateProfileCompletion, WEIGHTS, FIELD_LABELS };
