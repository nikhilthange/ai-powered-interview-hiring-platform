const aiProvider = require('./aiProvider');

exports.generateJobDescription = async (prompt, title) => {
  return aiProvider.generateJobDescription({ prompt, title });
};

exports.generateInterviewQuestions = async (title, description, requirements, experienceLevel) => {
  const prompt = `Job Title: ${title}\nDescription: ${description}\nRequirements: ${requirements.join(', ')}\nExperience Level: ${experienceLevel}`;
  const result = await aiProvider.generateInterviewQuestions({ jobDescription: prompt });
  const questions = Array.isArray(result) ? result : (result.questions || []);
  return {
    technical: questions.filter((_, i) => i < 5),
    behavioral: questions.filter((_, i) => i >= 5 && i < 9),
    roleSpecific: questions.filter((_, i) => i >= 9)
  };
};

exports.summarizeResume = async (resumeText, candidateName) => {
  return aiProvider.summarizeResume({ resumeText, candidateName });
};

exports.compareCandidates = async (candidates) => {
  const result = await aiProvider.compareCandidates({ candidates });
  return Array.isArray(result) ? result.map((c, idx) => ({ ...c, ranking: idx + 1 })) : [];
};

exports.rankApplicants = async (applications, jobDescription) => {
  const apps = applications.map(a => ({
    name: a.candidateId?.name || 'Unknown',
    skills: a.candidateId?.skills || [],
    atsScore: a.atsScore,
    resumeText: a.resumeText || ''
  }));
  const result = await aiProvider.rankApplicants({ applications: apps, jobDescription });
  return Array.isArray(result) ? result.map((c, idx) => ({ ...c, rank: idx + 1 })) : [];
};

exports.suggestSalaryRange = async (title, description, requirements, location, experienceLevel) => {
  return aiProvider.suggestSalary({ title, description, requirements, location, experienceLevel });
};

exports.generateEmailInvitation = async (candidateName, jobTitle, companyName, customMessage) => {
  const result = await aiProvider.generateRecruiterEmail({
    candidateName, jobTitle, companyName, emailType: 'invite'
  });
  return {
    subject: `Interview Invitation: ${jobTitle} at ${companyName}`,
    body: typeof result === 'string' ? result : (result.body || result),
    recipients: [candidateName]
  };
};

exports.generateRejectionEmail = async (candidateName, jobTitle, companyName, rejectionReason) => {
  const result = await aiProvider.generateRecruiterEmail({
    candidateName, jobTitle, companyName, emailType: 'rejection'
  });
  return {
    subject: `Update on your application for ${jobTitle} at ${companyName}`,
    body: typeof result === 'string' ? result : (result.body || result),
    recipients: [candidateName]
  };
};

exports.generateTechnicalAssignment = async (title, description, requirements, experienceLevel) => {
  const prompt = `Create a technical assignment for a ${experienceLevel} ${title} position. Requirements: ${requirements.join(', ')}. Description: ${description}`;
  const result = await aiProvider.generateJobDescription({ prompt, title });
  return {
    title: `${title} - Technical Assessment`,
    overview: `This assessment evaluates skills for the ${title} position.`,
    duration: '3 hours',
    totalPoints: 100,
    passingCriteria: '70 points',
    sections: [
      {
        name: 'Coding Challenge',
        description: 'Implement a REST API with specified endpoints',
        points: 40,
        tasks: result.responsibilities?.slice(0, 4) || ['Implement CRUD operations', 'Add authentication', 'Write tests'],
        evaluationCriteria: ['Code quality', 'API design', 'Error handling', 'Test coverage']
      },
      {
        name: 'System Design',
        description: 'Design scalable architecture',
        points: 30,
        tasks: ['Draw architecture diagram', 'Explain component interactions', 'Discuss trade-offs'],
        evaluationCriteria: ['Architecture decisions', 'Scalability', 'Technology choices']
      },
      {
        name: 'Problem Solving',
        description: 'Solve algorithmic problems',
        points: 30,
        tasks: ['Analyze requirements', 'Implement solution', 'Optimize for edge cases'],
        evaluationCriteria: ['Problem-solving approach', 'Code efficiency', 'Edge case handling']
      }
    ],
    submissionGuidelines: 'Submit via GitHub repository. Include README with setup instructions.'
  };
};