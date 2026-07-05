const Application = require('../models/Application');
const { createAndSend } = require('../utils/notificationHelper');

const AI_SERVICE_NAME = 'aiService';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const MODEL = 'meta/llama-3.3-70b-instruct';

const circuitBreaker = {
  failures: 0,
  maxFailures: 3,
  isOpen: false,
  lastFailureTime: 0,
  cooldownMs: 60000,
  trip() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.maxFailures) {
      this.isOpen = true;
      console.error(`[${AI_SERVICE_NAME}] Circuit breaker OPEN after ${this.failures} failures. Falling back to mock mode for ${this.cooldownMs}ms.`);
      setTimeout(() => {
        this.isOpen = false;
        this.failures = 0;
        console.log(`[${AI_SERVICE_NAME}] Circuit breaker RESET. Attempting real API calls again.`);
      }, this.cooldownMs);
    }
  },
  reset() {
    this.failures = 0;
    this.isOpen = false;
  }
};

let nvidiaApiKey = null;
if (process.env.NVIDIA_API_KEY) {
  nvidiaApiKey = process.env.NVIDIA_API_KEY;
  console.log(`[${AI_SERVICE_NAME}] NVIDIA NIM client initialized successfully.`);
} else {
  console.warn(`[${AI_SERVICE_NAME}] No NVIDIA_API_KEY found. Running in mock mode.`);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callNvidia(messages, options = {}) {
  const { temperature = 0.2, maxTokens = 1024, responseFormat } = options;

  const body = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false
  };

  if (responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${nvidiaApiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(mockFn, aiCall, options = {}) {
  const callerName = options.name || 'nvidia_call';

  if (!nvidiaApiKey || circuitBreaker.isOpen) {
    if (circuitBreaker.isOpen) {
      console.warn(`[${AI_SERVICE_NAME}] Circuit breaker OPEN for "${callerName}". Using mock data.`);
    }
    if (typeof mockFn === 'function') {
      return mockFn();
    }
    return mockFn;
  }

  try {
    const result = await aiCall();
    circuitBreaker.reset();
    return result;
  } catch (err) {
    console.error(`[${AI_SERVICE_NAME}] NVIDIA API call "${callerName}" FAILED:`, err.message);
    if (err.stack) console.error(`[${AI_SERVICE_NAME}] Stack:`, err.stack.split('\n').slice(0, 4).join('\n'));

    circuitBreaker.trip();

    if (typeof mockFn === 'function') {
      console.warn(`[${AI_SERVICE_NAME}] Falling back to mock data for "${callerName}".`);
      return mockFn();
    }
    throw err;
  }
}

exports.analyzeResumeBackground = async (applicationId, resumeText, jobDescription) => {
  try {
    const mockFn = async () => {
      await delay(1500);
      return {
        atsScore: 78,
        matchPercent: 82,
        strengths: ['Demonstrates strong Node.js and RESTful API experience', 'Good usage of security middleware integrations like Helmet and Rate Limiters', 'Clean modular folder structure'],
        weaknesses: ['Lacks explicit Cloud provider credentials (AWS/GCP)', 'No unit testing setup mentioned in the experience section'],
        interviewTips: ['Be prepared to answer questions on Socket.io horizontal scaling', 'Review database index configurations and caching strategies']
      };
    };

    const aiCall = async () => {
      const content = await callNvidia([
        { role: 'system', content: 'You are an expert ATS screening system. Compare the resume against the job description and output purely valid JSON matching this schema: { "atsScore": integer 0-100, "matchPercent": integer 0-100, "strengths": [string], "weaknesses": [string], "interviewTips": [string] }' },
        { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
      ], { responseFormat: 'json_object' });
      return JSON.parse(content);
    };

    const result = await callAI(mockFn, aiCall, { name: 'analyzeResumeBackground' });

    const app = await Application.findByIdAndUpdate(applicationId, {
      atsScore: result.atsScore,
      matchPercent: result.matchPercent,
      aiAnalysis: {
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        interviewTips: result.interviewTips
      }
    }, { new: true });

    if (app) {
      await createAndSend({
        recipientId: app.candidateId,
        type: 'application_update',
        title: 'Resume Analysis Completed',
        message: `Your resume analysis for the job application is ready. ATS Score: ${result.atsScore}/100.`
      });
    }

    console.log(`[aiService] AnalyzeResumeBackground completed for Application ${applicationId}`);
  } catch (error) {
    console.error(`[aiService] AnalyzeResumeBackground error for Application ${applicationId}:`, error);
  }
};

exports.analyzeResumeInteractive = async (resumeText, jobDescription) => {
  const mockFn = async () => {
    await delay(1500);
    return {
      atsScore: 78,
      matchPercent: 82,
      aiAnalysis: {
        strengths: ['Strong Node.js and RESTful API experience', 'Good security middleware implementation', 'Clean modular architecture'],
        weaknesses: ['No cloud provider credentials (AWS/GCP)', 'No unit testing setup mentioned'],
        interviewTips: ['Review Socket.io horizontal scaling', 'Study database indexing strategies']
      }
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an expert ATS screening system. Compare the resume against the job description and output purely valid JSON matching this schema: { "atsScore": integer 0-100, "matchPercent": integer 0-100, "strengths": [string], "weaknesses": [string], "interviewTips": [string] }' },
      { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
    ], { responseFormat: 'json_object' });
    const result = JSON.parse(content);
    return {
      atsScore: result.atsScore,
      matchPercent: result.matchPercent,
      aiAnalysis: {
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        interviewTips: result.interviewTips
      }
    };
  };

  return callAI(mockFn, aiCall, { name: 'analyzeResumeInteractive' });
};

exports.generateMockInterviewQuestions = async (jobDescription, resumeText) => {
  const mockFn = async () => {
    await delay(1000);
    return [
      'Can you explain your experience building scalable REST APIs in Express.js?',
      'How do you secure your MongoDB database against NoSQL injection queries?',
      'Describe a scenario where you implemented Refresh Tokens and cookie security.',
      'How do you manage cross-server socket broadcasts in Socket.io?',
      'What is your approach to handling operational errors inside Express middleware?'
    ];
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an HR technical interviewer. Generate exactly 5 relevant interview questions based on the candidate resume and job description. Output purely valid JSON: { "questions": [string] }' },
      { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
    ], { responseFormat: 'json_object' });
    const parsed = JSON.parse(content);
    return parsed.questions;
  };

  return callAI(mockFn, aiCall, { name: 'generateMockInterviewQuestions' });
};

exports.generateCareerRoadmap = async (skills, targetRole) => {
  const mockFn = async () => {
    await delay(1200);
    return {
      targetRole,
      summary: `A structured ${6}-month career roadmap to become a ${targetRole}.`,
      estimatedDuration: `${6} months`,
      milestones: [
        { title: 'Foundation Building', duration: 'Months 1-2', description: 'Build strong foundations in core technologies.', status: 'pending', skills: ['TypeScript', 'Advanced Node.js streams'], resources: [{ title: 'TypeScript Documentation' }, { title: 'Node.js Design Patterns book' }] },
        { title: 'Enterprise Architecture', duration: 'Months 3-4', description: 'Learn enterprise-grade architecture patterns and tools.', status: 'pending', skills: ['Docker containerization', 'Redis Caching & Pub/Sub'], resources: [{ title: 'Docker Mastery course' }, { title: 'Redis University tutorials' }] },
        { title: 'System Deployment', duration: 'Months 5-6', description: 'Master production deployment and monitoring.', status: 'pending', skills: ['Nginx config', 'CI/CD workflows', 'VPS monitoring'], resources: [{ title: 'Nginx fundamentals' }, { title: 'GitHub Actions workflow docs' }] }
      ]
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are a career development coach. Create a phased career roadmap for the candidate to reach their target role starting from their current skills. Output purely valid JSON with schema: { "targetRole": string, "summary": string, "estimatedDuration": string, "milestones": [{ "title": string, "duration": string, "description": string, "status": string, "skills": [string], "resources": [{ "title": string }], "projects": [{ "title": string, "description": string }] }] }' },
      { role: 'user', content: `Current Skills: ${skills.join(', ')}\nTarget Role: ${targetRole}` }
    ], { responseFormat: 'json_object' });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateCareerRoadmap' });
};

exports.analyzeResumeFromFile = async (resumeText, jobDescription) => {
  const mockFn = async () => {
    await delay(2000);
    return {
      atsScore: 81,
      matchPercent: 76,
      aiAnalysis: {
        strengths: ['Strong full-stack development experience', 'Good understanding of RESTful APIs and database design', 'Clean code structure and modular architecture'],
        weaknesses: ['Limited cloud infrastructure experience', 'No containerization or orchestration knowledge shown'],
        interviewTips: ['Prepare to discuss scalability patterns for web applications', 'Review database indexing and query optimization strategies']
      },
      missingSkills: ['TypeScript', 'Docker', 'AWS/GCP Cloud', 'CI/CD Pipelines', 'Redis'],
      improvements: ['Add a projects section showcasing deployed applications', 'Quantify achievements with metrics (e.g., "Reduced latency by 40%")', 'Include a skills summary section with proficiency levels', 'Add links to GitHub profile and live project demos', 'Customize resume summary for each job application'],
      suggestedProjects: [
        { title: 'Full-Stack Dashboard with Real-time Analytics', description: 'Build a real-time dashboard using WebSockets, Redis pub/sub, and React with charting libraries.' },
        { title: 'Microservices API Gateway', description: 'Design an API gateway with rate limiting, authentication, and service routing using Node.js and Docker.' },
        { title: 'Cloud-Native CI/CD Pipeline', description: 'Set up a complete CI/CD pipeline with GitHub Actions, Docker, and AWS/GCP deployment.' },
        { title: 'Serverless Data Processing Pipeline', description: 'Build a serverless function-based data pipeline using AWS Lambda or Google Cloud Functions.' }
      ],
      suggestedCertifications: [
        { name: 'AWS Certified Developer – Associate', provider: 'Amazon Web Services' },
        { name: 'Google Cloud Professional Cloud Developer', provider: 'Google Cloud' },
        { name: 'Docker Certified Associate', provider: 'Docker Inc.' },
        { name: 'MongoDB Certified Developer', provider: 'MongoDB University' },
        { name: 'Node.js Application Developer', provider: 'OpenJS Foundation' }
      ]
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are an expert ATS screening and career advisory system. Analyze the resume against the job description and provide comprehensive structured feedback. Output purely valid JSON with schema: { "atsScore": integer 0-100, "matchPercent": integer 0-100, "strengths": [string], "weaknesses": [string], "interviewTips": [string], "missingSkills": [string], "improvements": [string], "suggestedProjects": [{ "title": string, "description": string }], "suggestedCertifications": [{ "name": string, "provider": string }] }' },
      { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
    ], { responseFormat: 'json_object' });
    const result = JSON.parse(content);
    return {
      atsScore: result.atsScore,
      matchPercent: result.matchPercent,
      aiAnalysis: { strengths: result.strengths, weaknesses: result.weaknesses, interviewTips: result.interviewTips },
      missingSkills: result.missingSkills,
      improvements: result.improvements,
      suggestedProjects: result.suggestedProjects,
      suggestedCertifications: result.suggestedCertifications
    };
  };

  return callAI(mockFn, aiCall, { name: 'analyzeResumeFromFile' });
};

exports.analyzeSkillGap = async (resumeText, targetRole) => {
  const mockFn = async () => {
    await delay(1200);
    return {
      existingSkills: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
      missingSkills: ['TypeScript', 'Docker', 'Redis', 'AWS', 'CI/CD'],
      gapAnalysis: 'Core backend skills present. Missing DevOps and cloud deployment skills required for the target role.',
      recommendations: ['Learn TypeScript — essential for modern Node.js enterprise codebases', 'Get hands-on with Docker and container orchestration', 'Study Redis for caching and pub/sub patterns', 'Obtain at least one cloud certification (AWS/GCP/Azure)', 'Set up a CI/CD pipeline using GitHub Actions']
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are a skill gap analyst. Compare the candidate resume against the target role requirements. Output purely valid JSON with schema: { "existingSkills": [string], "missingSkills": [string], "gapAnalysis": string, "recommendations": [string] }' },
      { role: 'user', content: `Resume Text:\n${resumeText}\n\nTarget Role: ${targetRole}` }
    ], { responseFormat: 'json_object' });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'analyzeSkillGap' });
};

exports.analyzeSkillGapFromFile = async (resumeText, targetRole) => {
  const mockFn = async () => {
    await delay(2000);
    return {
      existingSkills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
      missingSkills: ['TypeScript', 'Docker', 'Redis', 'AWS', 'CI/CD'],
      gapAnalysis: 'Core backend skills present. Missing DevOps and cloud deployment skills required for the target role.',
      recommendations: ['Learn TypeScript', 'Get hands-on with Docker', 'Study Redis', 'Obtain cloud certification', 'Set up CI/CD pipeline'],
      learningResources: [
        { title: 'Docker Deep Dive', description: 'Comprehensive course on Docker fundamentals and best practices.', url: '#' },
        { title: 'Kubernetes in Action', description: 'Hands-on guide to container orchestration with K8s.', url: '#' },
        { title: 'AWS Certified Solutions Architect', description: 'Official AWS certification training material.', url: '#' },
        { title: 'CI/CD Pipeline Design', description: 'Learn to build robust CI/CD pipelines.', url: '#' },
      ],
      recommendedProjects: [
        { title: 'Microservices Dashboard', description: 'Build a dashboard app with Docker, K8s, and a React frontend.', skills: ['Docker', 'Kubernetes', 'React'] },
        { title: 'Infrastructure as Code Demo', description: 'Provision cloud resources using Terraform or CloudFormation.', skills: ['Terraform', 'AWS'] },
      ],
      certifications: [
        { name: 'AWS Certified Solutions Architect', provider: 'Amazon Web Services' },
        { name: 'Certified Kubernetes Administrator', provider: 'CNCF' },
      ],
      timeline: [
        { title: 'Foundations', duration: 'Month 1', description: 'Core language and tool fundamentals: TypeScript basics, Docker fundamentals.', status: 'pending' },
        { title: 'Intermediate', duration: 'Months 2-3', description: 'Cloud and infrastructure skills: AWS EC2/S3/Lambda, Redis caching.', status: 'pending' },
        { title: 'Advanced', duration: 'Months 4-6', description: 'Production-ready systems: Kubernetes basics, Microservices patterns.', status: 'pending' },
      ]
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are a skill gap analyst and career coach. Analyze the resume against the target role, identify skill gaps, provide actionable recommendations, and create a structured learning roadmap. Output purely valid JSON with schema: { "existingSkills": [string], "missingSkills": [string], "gapAnalysis": string, "recommendations": [string], "learningResources": [{ "title": string, "description": string, "url": string }], "recommendedProjects": [{ "title": string, "description": string, "skills": [string] }], "certifications": [{ "name": string, "provider": string }], "timeline": [{ "title": string, "duration": string, "description": string, "status": string }] }' },
      { role: 'user', content: `Resume Text:\n${resumeText}\n\nTarget Role: ${targetRole}` }
    ], { responseFormat: 'json_object' });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'analyzeSkillGapFromFile' });
};

exports.analyzeInterviewFeedback = async (qaPairs) => {
  const mockFn = async () => {
    await delay(1000);
    return `Candidate answered all questions with basic competency. Good understanding of core architecture. Overall Rating: 7.5/10.`;
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: 'You are a technical interviewer evaluating answers to mock interview questions. Output a detailed qualitative evaluation summary.' },
      { role: 'user', content: `Q&A Pairs:\n${JSON.stringify(qaPairs, null, 2)}` }
    ]);
    return content;
  };

  return callAI(mockFn, aiCall, { name: 'analyzeInterviewFeedback' });
};

exports.generateDifficultyQuestions = async (resumeText, targetRole, difficulty) => {
  const difficultyDescriptions = {
    easy: 'Focus on fundamental concepts, definitions, and basic problem-solving.',
    medium: 'Focus on applied knowledge, system design trade-offs, and moderately complex problem-solving.',
    hard: 'Focus on advanced architecture, performance optimization, distributed systems, and complex problem-solving.',
  };

  const categories = ['Technical Skills', 'System Design', 'Problem Solving', 'Domain Knowledge', 'Behavioral'];

  const mockFn = async () => {
    await delay(1500);
    const mockPool = {
      easy: [
        { question: 'What is REST and how does it differ from GraphQL?', category: 'Technical Skills' },
        { question: 'Explain the difference between SQL and NoSQL databases.', category: 'Technical Skills' },
        { question: 'Describe your approach to debugging a production issue.', category: 'Problem Solving' },
        { question: 'How do you ensure code quality in your projects?', category: 'Technical Skills' },
        { question: 'Tell me about a time you worked in a team to solve a difficult problem.', category: 'Behavioral' },
      ],
      medium: [
        { question: 'Design a URL shortening service like TinyURL. What are the key considerations?', category: 'System Design' },
        { question: 'How would you handle rate limiting in a distributed API system?', category: 'System Design' },
        { question: 'Explain how you would optimize a slow database query serving millions of users.', category: 'Technical Skills' },
        { question: 'Describe your experience with CI/CD pipelines and how you handle deployment failures.', category: 'Problem Solving' },
        { question: 'Walk me through the architecture of a real-time chat application.', category: 'System Design' },
      ],
      hard: [
        { question: 'Design a globally distributed data replication strategy for a multi-region application.', category: 'System Design' },
        { question: 'How would you architect a system to handle 10 million concurrent WebSocket connections?', category: 'System Design' },
        { question: 'Explain strategies for achieving eventual consistency in a microservices architecture.', category: 'Technical Skills' },
        { question: 'Describe a scenario where you had to make a significant technical trade-off and how you approached it.', category: 'Problem Solving' },
        { question: 'How would you design a real-time fraud detection system with sub-100ms latency?', category: 'System Design' },
      ],
    };
    return mockPool[difficulty] || mockPool.medium;
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: `You are a technical interviewer conducting a ${difficulty} level interview for the role of ${targetRole}. ${difficultyDescriptions[difficulty] || difficultyDescriptions.medium}\n\nGenerate 5 interview questions tailored to the candidate's resume. Each question must include a category from: ${categories.join(', ')}.\nOutput purely valid JSON: { "questions": [{ "question": string, "category": string }] }\n\nMake questions specific to the candidate's experience and the target role.` },
      { role: 'user', content: `Candidate Resume:\n${resumeText}\n\nTarget Role: ${targetRole}\nDifficulty Level: ${difficulty}` }
    ], { responseFormat: 'json_object' });
    const parsed = JSON.parse(content);
    return parsed.questions.map((q) => ({ question: q.question, category: q.category, difficulty }));
  };

  return callAI(mockFn, aiCall, { name: 'generateDifficultyQuestions' });
};

exports.scoreAnswer = async (question, answer, difficulty) => {
  const maxScore = 10;

  const mockFn = async () => {
    await delay(500);
    const mockScores = {
      easy: { score: 8, strengths: ['Clear explanation', 'Good foundational knowledge'], improvements: ['Provide more specific examples'] },
      medium: { score: 7, strengths: ['Shows practical experience'], improvements: ['Go deeper into trade-offs and alternatives'] },
      hard: { score: 6, strengths: ['Understands the core concept'], improvements: ['Discuss real-world scaling considerations', 'Address failure scenarios'] },
    };
    const mock = mockScores[difficulty] || mockScores.medium;
    return {
      score: mock.score,
      maxScore,
      feedback: `The answer demonstrates ${mock.strengths[0].toLowerCase()}. ${mock.improvements[0]}.`,
      strengths: mock.strengths,
      improvements: mock.improvements,
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: `You are a technical interviewer scoring a ${difficulty} level interview answer. Evaluate the answer based on:\n1. Correctness and accuracy (0-3 points)\n2. Depth and completeness (0-3 points)\n3. Communication and clarity (0-2 points)\n4. Practical application examples (0-2 points)\nTotal: 0-${maxScore} points\n\nOutput purely valid JSON: { "score": integer, "feedback": string, "strengths": [string], "improvements": [string] }` },
      { role: 'user', content: `Question: ${question}\n\nCandidate Answer: ${answer}\n\nDifficulty: ${difficulty}` }
    ], { responseFormat: 'json_object' });
    const result = JSON.parse(content);
    return {
      score: Math.min(result.score, maxScore),
      maxScore,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
    };
  };

  return callAI(mockFn, aiCall, { name: 'scoreAnswer' });
};

exports.generateOverallFeedback = async (questions, targetRole) => {
  const mockFn = async () => {
    await delay(1000);
    return {
      overallFeedback: 'Good performance overall. The candidate demonstrated solid technical knowledge but could improve on system design depth.',
      topStrengths: ['Strong foundational knowledge', 'Clear communication style', 'Good problem-solving approach'],
      areasToImprove: ['System design depth', 'Real-world examples', 'Handling edge cases'],
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: `You are a technical interview coach. Review the completed interview for the role of ${targetRole} and provide constructive feedback. Output purely valid JSON: { "overallFeedback": string, "topStrengths": [string], "areasToImprove": [string] }` },
      { role: 'user', content: `Interview Results:\n${JSON.stringify(questions.map(q => ({ question: q.question, category: q.category, difficulty: q.difficulty, answer: q.answer, score: q.score, maxScore: q.maxScore, feedback: q.feedback, strengths: q.strengths, improvements: q.improvements })), null, 2)}` }
    ], { responseFormat: 'json_object' });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'generateOverallFeedback' });
};
