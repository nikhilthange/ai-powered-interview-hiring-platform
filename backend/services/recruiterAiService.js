const { callAI, callNvidia, extractJsonArray } = require('./aiService');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.generateJobDescription = async (prompt, title) => {
  const mockFn = async () => {
    await delay(1500);
    return {
      title: title || 'Senior Software Engineer',
      summary: 'We are seeking an experienced Software Engineer to join our fast-paced development team. You will lead technical initiatives, build scalable systems, and mentor junior developers.',
      responsibilities: [
        'Design and develop high-volume, low-latency applications for mission-critical systems',
        'Contribute in all phases of the development lifecycle',
        'Write well-designed, testable, efficient code',
        'Ensure designs are in compliance with specifications',
        'Prepare and produce releases of software components'
      ],
      requiredSkills: [
        'Proven software development experience',
        'Strong knowledge of modern JavaScript/TypeScript and frameworks (React, Node.js)',
        'Experience with SQL and NoSQL databases',
        'Solid understanding of scalable architecture'
      ],
      preferredSkills: [
        'Experience with cloud platforms (AWS, GCP)',
        'Familiarity with CI/CD and Docker',
        'Knowledge of microservices'
      ],
      qualifications: [
        'BS/MS degree in Computer Science, Engineering or a related subject'
      ],
      experience: '5+ years',
      salaryRange: { min: 120000, max: 180000 },
      jobType: 'Full-time',
      location: 'Remote',
      benefits: [
        'Competitive salary and equity',
        'Health, dental, and vision insurance',
        'Unlimited PTO',
        'Flexible working hours'
      ],
      keywords: ['Software Engineer', 'React', 'Node.js', 'Backend', 'Frontend', 'Full Stack']
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an expert HR and job description writer. Generate a comprehensive, professional job posting. Output purely valid JSON with schema: { "title": string, "summary": string, "responsibilities": [string], "requiredSkills": [string], "preferredSkills": [string], "qualifications": [string], "experience": string, "salaryRange": { "min": number, "max": number }, "jobType": "Full-time" | "Part-time" | "Contract" | "Remote", "location": string, "benefits": [string], "keywords": [string] }' },
      { role: 'user', content: `Generate a complete job posting based on this context. Job Title: ${title || 'Not specified'}. Hiring Needs/Prompt: ${prompt}` }
    ], { responseFormat: 'json_object', temperature: 0.3, maxTokens: 3000 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateJobDescription' });
};

exports.generateInterviewQuestions = async (title, description, requirements, experienceLevel) => {
  const mockFn = async () => {
    await delay(1200);
    return {
      technical: [
        'Explain the difference between REST and GraphQL APIs.',
        'How do you handle database indexing and query optimization?',
        'Describe your experience with CI/CD pipelines.',
        'How would you design a scalable microservices architecture?',
        'Explain caching strategies and when to use each.'
      ],
      behavioral: [
        'Tell me about a time you resolved a conflict in your team.',
        'Describe a project you led from inception to completion.',
        'How do you prioritize tasks when working on multiple deadlines?',
        'Give an example of a technical decision you made and its impact.'
      ],
      roleSpecific: [
        `What interests you about this ${title} role?`,
        'How do you stay current with industry trends?',
        'Describe your ideal work environment.'
      ]
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: `You are a technical hiring manager. Generate interview questions for a ${experienceLevel} level ${title} position. Output purely valid JSON with schema: { "technical": [string], "behavioral": [string], "roleSpecific": [string] }. Include 5 technical, 4 behavioral, and 3 role-specific questions.` },
      { role: 'user', content: `Job Title: ${title}\nDescription: ${description}\nRequirements: ${requirements.join(', ')}\nExperience Level: ${experienceLevel}` }
    ], { responseFormat: 'json_object', temperature: 0.3, maxTokens: 2048 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateInterviewQuestions' });
};

exports.summarizeResume = async (resumeText, candidateName) => {
  const mockFn = async () => {
    await delay(1000);
    return {
      candidateName: candidateName || 'Candidate',
      summary: 'Experienced software engineer with 5+ years in full-stack development. Proficient in React, Node.js, and cloud technologies.',
      keySkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      yearsOfExperience: 5,
      topAchievements: [
        'Led migration of legacy monolith to microservices, improving deployment frequency by 3x',
        'Built real-time analytics dashboard serving 10K+ concurrent users',
        'Reduced API response times by 60% through query optimization and caching'
      ],
      education: [{ degree: 'B.Tech', field: 'Computer Science', institution: 'Example University' }],
      suggestedRoles: ['Senior Full-Stack Developer', 'Technical Lead', 'Software Architect']
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an expert resume reviewer for recruiters. Analyze the resume and provide a concise summary. Output purely valid JSON with schema: { "candidateName": string, "summary": string, "keySkills": [string], "yearsOfExperience": number, "topAchievements": [string], "education": [{ "degree": string, "field": string, "institution": string }], "suggestedRoles": [string] }' },
      { role: 'user', content: `Resume Text:\n${resumeText}\n\nCandidate Name: ${candidateName || 'Not provided'}` }
    ], { responseFormat: 'json_object', temperature: 0.2, maxTokens: 2048 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'summarizeResume' });
};

exports.compareCandidates = async (candidates) => {
  const mockFn = async () => {
    await delay(2000);
    return candidates.map((c, idx) => ({
      name: c.name || `Candidate ${idx + 1}`,
      overallScore: 70 + Math.floor(Math.random() * 25),
      skillMatch: 65 + Math.floor(Math.random() * 30),
      experienceScore: 60 + Math.floor(Math.random() * 35),
      educationScore: 70 + Math.floor(Math.random() * 25),
      strengths: ['Strong technical background', 'Good communication skills'],
      weaknesses: ['Limited leadership experience'],
      recommendation: idx === 0 ? 'Strongly Recommended' : 'Recommended',
      ranking: idx + 1
    }));
  };

  const aiCall = async () => {
    const candidatesStr = candidates.map((c, idx) =>
      `[${idx}] Name: ${c.name || 'Unknown'}\nSkills: ${(c.skills || []).join(', ')}\nExperience: ${c.experience || ''}\nEducation: ${c.education || ''}\nResume: ${(c.resumeText || '').slice(0, 1500)}`
    ).join('\n\n---\n\n');

    const content = await callNvidia([
      { role: 'system', content: 'You are a recruitment AI comparing candidates for a role. Rank and compare them based on skills, experience, and education. Output purely valid JSON array with schema: [{ "name": string, "overallScore": number 0-100, "skillMatch": number 0-100, "experienceScore": number 0-100, "educationScore": number 0-100, "strengths": [string], "weaknesses": [string], "recommendation": string, "ranking": number }]. Return array in ranked order (best first).' },
      { role: 'user', content: `Compare the following candidates:\n\n${candidatesStr}` }
    ], { responseFormat: 'json_object', temperature: 0.2, maxTokens: 4096 });

    const parsed = JSON.parse(content);
    const arr = Array.isArray(parsed) ? parsed : (parsed.candidates || parsed.comparison || []);
    return arr.map((c, idx) => ({ ...c, ranking: idx + 1 }));
  };

  return callAI(mockFn, aiCall, { name: 'compareCandidates' });
};

exports.rankApplicants = async (applications, jobDescription) => {
  const mockFn = async () => {
    await delay(2000);
    return applications.map((app, idx) => ({
      candidateName: app.candidateId?.name || `Candidate ${idx + 1}`,
      rank: idx + 1,
      matchScore: 85 - idx * 5,
      skillFit: 80 - idx * 4,
      experienceFit: 75 - idx * 3,
      aiNotes: idx === 0 ? 'Strong match for all requirements' : 'Good potential but some skill gaps',
      verdict: idx < Math.ceil(applications.length / 3) ? 'Shortlist' : idx < Math.ceil(applications.length * 2 / 3) ? 'Consider' : 'Low Priority'
    }));
  };

  const aiCall = async () => {
    const appsStr = applications.map((app, idx) =>
      `[${idx}] Name: ${app.candidateId?.name || 'Unknown'}\nSkills: ${(app.candidateId?.skills || []).join(', ')}\nExperience: ${app.candidateId?.experience || ''}\nEducation: ${app.candidateId?.education || ''}\nATS Score: ${app.atsScore || 'N/A'}\nResume: ${(app.resumeText || '').slice(0, 1500)}`
    ).join('\n\n---\n\n');

    const content = await callNvidia([
      { role: 'system', content: 'You are an AI recruitment assistant ranking applicants for a job. Evaluate each applicant against the job description and assign ranks. Output purely valid JSON array with schema: [{ "candidateName": string, "rank": number, "matchScore": number 0-100, "skillFit": number 0-100, "experienceFit": number 0-100, "aiNotes": string, "verdict": "Shortlist" | "Consider" | "Low Priority" }]. Return array in ranked order.' },
      { role: 'user', content: `Job Description:\n${jobDescription}\n\nApplicants:\n${appsStr}` }
    ], { responseFormat: 'json_object', temperature: 0.2, maxTokens: 4096 });

    const parsed = JSON.parse(content);
    const arr = Array.isArray(parsed) ? parsed : (parsed.rankings || parsed.applicants || []);
    return arr.map((c, idx) => ({ ...c, rank: idx + 1 }));
  };

  return callAI(mockFn, aiCall, { name: 'rankApplicants' });
};

exports.suggestSalaryRange = async (title, description, requirements, location, experienceLevel) => {
  const mockFn = async () => {
    await delay(1000);
    const ranges = {
      Junior: { min: 40000, max: 70000, currency: 'USD', period: 'yearly' },
      Mid: { min: 70000, max: 120000, currency: 'USD', period: 'yearly' },
      Senior: { min: 120000, max: 200000, currency: 'USD', period: 'yearly' }
    };
    const base = ranges[experienceLevel] || ranges.Mid;
    return {
      suggestedRange: base,
      marketAverage: Math.round((base.min + base.max) / 2),
      percentile10: Math.round(base.min * 0.85),
      percentile90: Math.round(base.max * 1.1),
      factors: ['Industry demand for this role', 'Years of experience required', 'Geographic location adjustment', 'Company size and funding stage'],
      notes: 'Based on current market data for similar roles in the specified location.'
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are a compensation analyst. Suggest a competitive salary range for the role based on market data. Output purely valid JSON with schema: { "suggestedRange": { "min": number, "max": number, "currency": string, "period": string }, "marketAverage": number, "percentile10": number, "percentile90": number, "factors": [string], "notes": string }' },
      { role: 'user', content: `Title: ${title}\nDescription: ${description}\nRequirements: ${requirements.join(', ')}\nLocation: ${location}\nExperience Level: ${experienceLevel}` }
    ], { responseFormat: 'json_object', temperature: 0.2, maxTokens: 1024 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'suggestSalaryRange' });
};

exports.generateEmailInvitation = async (candidateName, jobTitle, companyName, customMessage) => {
  const mockFn = async () => {
    await delay(800);
    const subject = `Interview Invitation: ${jobTitle} at ${companyName}`;
    const body = `Dear ${candidateName},

We were impressed by your application for the ${jobTitle} position at ${companyName}. We would like to invite you for an interview to discuss your qualifications and the role in more detail.

${customMessage || 'Please let us know your availability for next week. We look forward to speaking with you!'}

Best regards,
The ${companyName} Recruitment Team`;
    return { subject, body, recipients: [candidateName] };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an HR professional drafting interview invitation emails. Write a professional, warm, and clear email inviting a candidate for an interview. Output purely valid JSON with schema: { "subject": string, "body": string, "recipients": [string] }' },
      { role: 'user', content: `Candidate Name: ${candidateName}\nJob Title: ${jobTitle}\nCompany Name: ${companyName}\nAdditional Context: ${customMessage || 'Standard interview invitation'}` }
    ], { responseFormat: 'json_object', temperature: 0.3, maxTokens: 1024 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateEmailInvitation' });
};

exports.generateRejectionEmail = async (candidateName, jobTitle, companyName, rejectionReason) => {
  const mockFn = async () => {
    await delay(800);
    const subject = `Update on your application for ${jobTitle} at ${companyName}`;
    const body = `Dear ${candidateName},

Thank you for your interest in the ${jobTitle} position at ${companyName} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

${rejectionReason || 'We appreciate your effort and wish you the best in your job search.'}

We encourage you to apply for future positions that match your skills.

Best regards,
The ${companyName} Recruitment Team`;
    return { subject, body, recipients: [candidateName] };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an HR professional drafting respectful rejection emails. Write a professional, empathetic, and clear rejection email. Output purely valid JSON with schema: { "subject": string, "body": string, "recipients": [string] }' },
      { role: 'user', content: `Candidate Name: ${candidateName}\nJob Title: ${jobTitle}\nCompany Name: ${companyName}\nRejection Reason: ${rejectionReason || 'Position filled with more suitable candidate'}` }
    ], { responseFormat: 'json_object', temperature: 0.3, maxTokens: 1024 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateRejectionEmail' });
};

exports.generateTechnicalAssignment = async (title, description, requirements, experienceLevel) => {
  const mockFn = async () => {
    await delay(1500);
    return {
      title: `${title} - Technical Assessment`,
      overview: `This assessment is designed to evaluate your skills for the ${title} position.`,
      duration: '3 hours',
      totalPoints: 100,
      passingCriteria: '70 points',
      sections: [
        {
          name: 'Coding Challenge',
          description: 'Implement a REST API with specified endpoints',
          points: 40,
          tasks: ['Set up a Node.js/Express server', 'Implement CRUD operations', 'Add authentication middleware', 'Write unit tests'],
          evaluationCriteria: ['Code quality and organization', 'API design principles', 'Error handling', 'Test coverage']
        },
        {
          name: 'System Design',
          description: 'Design a scalable architecture for a given scenario',
          points: 30,
          tasks: ['Draw architecture diagram', 'Explain component interactions', 'Discuss trade-offs', 'Address scaling concerns'],
          evaluationCriteria: ['Architectural decisions', 'Scalability considerations', 'Technology choices', 'Communication clarity']
        },
        {
          name: 'Problem Solving',
          description: 'Solve algorithmic problems related to the role',
          points: 30,
          tasks: ['Analyze problem requirements', 'Implement efficient solution', 'Optimize for edge cases', 'Explain time/space complexity'],
          evaluationCriteria: ['Problem-solving approach', 'Code efficiency', 'Edge case handling', 'Analytical thinking']
        }
      ],
      submissionGuidelines: 'Submit via GitHub repository. Include README with setup instructions.'
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: `You are a technical lead creating an assignment for a ${experienceLevel} level ${title} position. Design a comprehensive technical assignment. Output purely valid JSON with schema: { "title": string, "overview": string, "duration": string, "totalPoints": number, "passingCriteria": string, "sections": [{ "name": string, "description": string, "points": number, "tasks": [string], "evaluationCriteria": [string] }], "submissionGuidelines": string }` },
      { role: 'user', content: `Job Title: ${title}\nDescription: ${description}\nRequirements: ${requirements.join(', ')}\nExperience Level: ${experienceLevel}` }
    ], { responseFormat: 'json_object', temperature: 0.3, maxTokens: 3072 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateTechnicalAssignment' });
};
