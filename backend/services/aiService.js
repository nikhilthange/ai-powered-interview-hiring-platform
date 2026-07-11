const Application = require('../models/Application');
const AiConfig = require('../models/AiConfig');
const { createAndSend } = require('../utils/notificationHelper');

const AI_SERVICE_NAME = 'aiService';
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

const circuitBreaker = {
  failures: 0,
  maxFailures: 3,
  isOpen: false,
  cooldownMs: 60000,
  trip() {
    this.failures++;
    if (this.failures >= this.maxFailures) {
      this.isOpen = true;
      console.error(`[${AI_SERVICE_NAME}] Circuit breaker OPEN after ${this.failures} failures. Using mock for ${this.cooldownMs}ms.`);
      setTimeout(() => {
        this.isOpen = false;
        this.failures = 0;
        console.log(`[${AI_SERVICE_NAME}] Circuit breaker RESET.`);
      }, this.cooldownMs);
    }
  },
  reset() {
    this.failures = 0;
    this.isOpen = false;
  }
};

let currentProvider = process.env.MOCK_AI === 'true' ? 'mock' : 'nvidia';
let providerLoaded = false;

async function loadProvider() {
  try {
    const config = await AiConfig.getConfig();
    if (process.env.MOCK_AI === 'true') {
      currentProvider = 'mock';
    } else if (process.env.MOCK_AI === 'false') {
      currentProvider = 'nvidia';
    } else {
      currentProvider = config.provider;
    }
    // Sync DB when env explicitly overrides provider
    if (process.env.MOCK_AI === 'true' || process.env.MOCK_AI === 'false') {
      await AiConfig.findOneAndUpdate({}, { provider: currentProvider }, { upsert: true });
    }
  } catch {
    currentProvider = process.env.MOCK_AI === 'true' ? 'mock' : 'nvidia';
  }
  providerLoaded = true;

  console.log(`[${AI_SERVICE_NAME}] Provider loaded. MOCK_AI=${process.env.MOCK_AI}, NODE_ENV=${process.env.NODE_ENV}, currentProvider=${currentProvider}, circuitBreakerOpen=${circuitBreaker.isOpen}, NVIDIA_API_KEY=${!!process.env.NVIDIA_API_KEY}`);
}

function getProvider() {
  return currentProvider;
}

async function setProvider(provider) {
  currentProvider = provider;
  circuitBreaker.reset();
  await AiConfig.findOneAndUpdate({}, { provider }, { upsert: true });
}

async function recordMetrics({ duration, error }) {
  const update = { $inc: { totalRequests: 1 }, $set: { lastApiCall: new Date() } };
  if (error) {
    update.$inc.totalErrors = 1;
    update.$set.lastError = String(error).slice(0, 500);
  }
  if (duration !== undefined) {
    const config = await AiConfig.getConfig();
    const prevAvg = config.averageResponseTime || 0;
    const prevCount = config.totalRequests || 0;
    const newAvg = prevCount > 0
      ? Math.round((prevAvg * prevCount + duration) / (prevCount + 1))
      : duration;
    update.$set.averageResponseTime = newAvg;
  }
  await AiConfig.findOneAndUpdate({}, update, { upsert: true });
}

loadProvider();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function extractJsonArray(text) {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const values = Object.values(parsed);
      const arr = values.find(v => Array.isArray(v));
      if (arr) return arr;
    }
  } catch {}
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        const values = Object.values(parsed);
        const arr = values.find(v => Array.isArray(v));
        if (arr) return arr;
      }
    } catch {}
  }
  const bracketStart = trimmed.indexOf('[');
  if (bracketStart !== -1) {
    try {
      const parsed = JSON.parse(trimmed.slice(bracketStart));
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return null;
}

async function callNvidia(messages, options = {}) {
  const { temperature = 0.2, maxTokens = 1024, responseFormat } = options;

  const body = {
    model: NVIDIA_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false
  };

  if (responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' };
  }

  const apiKey = process.env.NVIDIA_API_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response;
  try {
    response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('NVIDIA API request timed out after 30s');
    }
    throw err;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(mockFn, aiCall, options = {}) {
  const callerName = options.name || 'ai_call';

  if (!providerLoaded) {
    await loadProvider();
  }

  const mockBranch = currentProvider === 'mock' || !process.env.NVIDIA_API_KEY || circuitBreaker.isOpen;
  console.log(`[${AI_SERVICE_NAME}] callAI "${callerName}": { MOCK_AI: "${process.env.MOCK_AI}", NODE_ENV: "${process.env.NODE_ENV}", currentProvider: "${currentProvider}", circuitBreakerOpen: ${circuitBreaker.isOpen}, hasApiKey: ${!!process.env.NVIDIA_API_KEY}, enteringMockBranch: ${mockBranch} }`);

  if (mockBranch) {
    if (circuitBreaker.isOpen) {
      console.warn(`[${AI_SERVICE_NAME}] Circuit breaker OPEN for "${callerName}". Using mock data.`);
    }
    if (currentProvider === 'mock') {
      console.log(`[${AI_SERVICE_NAME}] Mock mode: "${callerName}"`);
    }
    const result = typeof mockFn === 'function' ? await mockFn() : mockFn;
    await recordMetrics({});
    return result;
  }

  const start = Date.now();
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await aiCall();
      circuitBreaker.reset();
      await recordMetrics({ duration: Date.now() - start });
      return result;
    } catch (err) {
      lastError = err.message;
      console.error(`[${AI_SERVICE_NAME}] NVIDIA call "${callerName}" attempt ${attempt}/3: ${err.message}`);

      if (attempt < 3) {
        await delay(1000 * attempt);
      }
    }
  }

  circuitBreaker.trip();
  const fallbackReason = `All 3 retries failed for "${callerName}". Reason: ${lastError}`;
  console.warn(`[${AI_SERVICE_NAME}] ${fallbackReason}. Falling back to mock.`);

  await recordMetrics({ duration: Date.now() - start, error: fallbackReason });

  if (typeof mockFn === 'function') {
    return mockFn();
  }
  return mockFn;
}

exports.getProvider = getProvider;
exports.setProvider = setProvider;
exports.recordMetrics = recordMetrics;

async function callNvidiaStream(messages, callbacks, options = {}) {
  const { temperature = 0.7, maxTokens = 2048 } = options;
  const { onChunk, onDone, onError } = callbacks;

  const body = {
    model: NVIDIA_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true
  };

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    const err = new Error('NVIDIA API key not configured');
    if (onError) onError(err);
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  let fullContent = '';

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            if (onChunk) onChunk(content);
          }
        } catch {
        }
      }
    }

    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              if (onChunk) onChunk(content);
            }
          } catch {
          }
        }
      }
    }

    if (onDone) onDone(fullContent);
    return fullContent;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const error = new Error('NVIDIA API request timed out after 60s');
      if (onError) onError(error);
      throw error;
    }
    if (onError) onError(err);
    throw err;
  }
}

function buildSystemPrompt(context) {
  const parts = ['You are an expert AI Career Assistant for a hiring platform. You help users with career-related queries including resume review, job analysis, interview preparation, salary negotiation, and career advice. Provide detailed, helpful, and professional responses. Use markdown formatting where appropriate.'];

  if (context?.type === 'resume' && context.resumeText) {
    parts.push(`\n\nThe user has uploaded a resume. Here is the resume content:\n\n${context.resumeText}\n\nUse this resume to answer questions about the user's skills, experience, and qualifications. When referring to the resume, be specific about their experience.`);
  }

  if (context?.type === 'job' && context.jobDescription) {
    parts.push(`\n\nThe user is viewing a job posting. Here are the job details:\n\nTitle: ${context.jobTitle || 'N/A'}\n\nDescription:\n${context.jobDescription}\n\nAnswer questions about this job, how it matches their profile, what skills are needed, and how to prepare for it.`);
  }

  if (context?.type === 'recruiter') {
    parts.push('\n\nThe user is a recruiter. Provide recruiter-focused assistance including generating job descriptions, creating interview questions, summarizing candidates, and comparing applicants. Focus on helping them find and evaluate talent effectively.');
  }

  if (context?.type === 'admin') {
    parts.push('\n\nThe user is a platform administrator. Provide analytics and insights about user growth, job statistics, AI usage summaries, and platform metrics. Help them understand platform health and trends.');
  }

  return parts.join('\n');
}

exports.generateChatStream = async (messages, context, callbacks, options = {}) => {
  const systemPrompt = buildSystemPrompt(context);
  const aiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  if (process.env.MOCK_AI === 'true' || currentProvider === 'mock' || !process.env.NVIDIA_API_KEY || circuitBreaker.isOpen) {
    console.log('[aiService] Using mock for chat stream');
    const mockResponse = 'This is a mock AI response. In production, this would be a real response from NVIDIA NIM. The AI Career Assistant is ready to help you with career advice, resume reviews, interview preparation, and more. **Key features include:**\n\n- Resume analysis and ATS scoring\n- Job description analysis\n- Interview question generation\n- Career roadmap creation\n- Salary negotiation tips\n\n*Please configure a valid NVIDIA API key to get real AI responses.*';
    const chunkSize = 5;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= mockResponse.length) {
        clearInterval(interval);
        if (callbacks.onDone) callbacks.onDone(mockResponse);
        return;
      }
      const chunk = mockResponse.slice(idx, idx + chunkSize);
      idx += chunkSize;
      if (callbacks.onChunk) callbacks.onChunk(chunk);
    }, 30);
    return mockResponse;
  }

  return callNvidiaStream(aiMessages, callbacks, options);
};

exports.generateChatTitle = async (message) => {
  const mockTitle = (() => {
    const titles = [
      'Career Discussion',
      'Resume Review',
      'Job Search Advice',
      'Interview Preparation',
      'Skill Development',
      'Salary Negotiation Tips',
      'Career Planning'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  })();

  const aiCall = async () => {
    return callNvidia([
      { role: 'system', content: 'Generate a short, concise title (max 6 words) for a conversation based on the first user message. Return only the title, no quotes or punctuation.' },
      { role: 'user', content: message }
    ], { temperature: 0.3, maxTokens: 30 });
  };

  try {
    const title = await aiCall();
    return title.replace(/["'']/g, '').trim() || 'New conversation';
  } catch {
    return mockTitle;
  }
};

exports.analyzeJobMatchBatch = async (candidateData, jobs) => {
  const mockFn = async () => {
    await delay(800);
    return jobs.map((job, idx) => {
      const baseScore = 50 + Math.floor(Math.random() * 45);
      const userSkills = (candidateData.skills || []).map(s => s.toLowerCase());
      const jobText = [job.title, job.description, ...(job.requirements || [])].join(' ').toLowerCase();
      const matching = userSkills.filter(s => jobText.includes(s));
      const allJobSkills = [...new Set((job.requirements || []).map(r => r.toLowerCase()))];
      const missing = allJobSkills.filter(s => !userSkills.some(us => jobText.includes(us) || us.includes(s) || s.includes(us))).slice(0, 5);

      const expLevelMap = { 'Junior': 2, 'Mid': 5, 'Senior': 8 };
      const requiredExp = expLevelMap[job.experienceLevel] || 3;
      const userExp = candidateData.experienceYears || 0;
      const expScore = Math.min(10, Math.round((userExp / Math.max(requiredExp, 1)) * 10));

      const userEdu = (candidateData.education || []).length;
      const eduScore = userEdu > 0 ? 8 : 5;

      return {
        matchPercentage: baseScore,
        matchingSkills: matching.slice(0, 6),
        missingSkills: missing,
        experienceMatch: { score: expScore, feedback: expScore >= 7 ? 'Experience aligns well with role requirements' : expScore >= 4 ? 'Partially meets experience expectations' : 'Less experience than preferred for this role' },
        educationMatch: { score: eduScore, feedback: eduScore >= 7 ? 'Education background matches requirements' : 'Education requirements not fully met' },
        whyRecommended: matching.length > 3
          ? `Strong skill alignment with ${matching.slice(0, 4).join(', ')}`
          : `Relevant ${job.experienceLevel || 'professional'} opportunity in ${job.jobType || 'your field'}`
      };
    });
  };

  const aiCall = async () => {
    const skillsStr = (candidateData.skills || []).join(', ') || 'Not specified';
    const expStr = `${candidateData.experienceYears || 0} years`;
    const eduStr = (candidateData.education || []).map(e =>
      `${e.degree || ''} in ${e.field || ''} from ${e.institution || ''} (${e.startYear || ''}-${e.endYear || ''})`
    ).filter(Boolean).join('; ') || 'Not specified';
    const resumeStr = candidateData.resumeText ? candidateData.resumeText.slice(0, 3000) : 'No resume provided';

    const jobsText = jobs.map((job, idx) =>
      `[${idx}] Title: ${job.title}\nDescription: ${(job.description || '').slice(0, 500)}\nRequirements: ${(job.requirements || []).join(', ')}\nLevel: ${job.experienceLevel || 'Any'}\nType: ${job.jobType || 'Any'}`
    ).join('\n\n');

    const content = await callNvidia([
      {
        role: 'system',
        content: `You are an API. Return ONLY a valid JSON array. Do NOT include markdown, explanation, intro text, code fences, or notes.

Example:
[
  {
    "jobId":"123",
    "matchPercentage":91,
    "matchingSkills":["React","Node"],
    "missingSkills":["Docker"],
    "experienceMatch":{"score":8,"feedback":"Experience aligns well with role requirements"},
    "educationMatch":{"score":7,"feedback":"Education background matches requirements"},
    "whyRecommended":"Strong frontend experience with React and Node."
  }
]

Return NOTHING except this array.`
      },
      {
        role: 'user',
        content: `Candidate Profile:
Skills: ${skillsStr}
Experience: ${expStr}
Education: ${eduStr}
Resume Excerpt: ${resumeStr}

Jobs to evaluate (respond with array in same index order):
${jobsText}`
      }
    ], { temperature: 0.3, maxTokens: 4096 });

    let parsed = extractJsonArray(content);

    if (!Array.isArray(parsed)) {
      throw new Error('AI returned non-array response');
    }

    return parsed.map((result, idx) => ({
      matchPercentage: Math.min(100, Math.max(0, result.matchPercentage || 50)),
      matchingSkills: (result.matchingSkills || []).slice(0, 6),
      missingSkills: (result.missingSkills || []).slice(0, 5),
      experienceMatch: result.experienceMatch || { score: 5, feedback: 'Experience assessment unavailable' },
      educationMatch: result.educationMatch || { score: 5, feedback: 'Education assessment unavailable' },
      whyRecommended: result.whyRecommended || `Potential match for ${jobs[idx]?.title || 'this role'}`
    }));
  };

  return callAI(mockFn, aiCall, { name: 'analyzeJobMatchBatch' });
};

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
      summary: `A structured 6-month career roadmap to become a ${targetRole}.`,
      estimatedDuration: '6 months',
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
    return 'Candidate answered all questions with basic competency. Good understanding of core architecture. Overall Rating: 7.5/10.';
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

exports.parseResumeToJson = async (resumeText) => {
  const mockFn = async () => {
    await delay(1500);
    return {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        location: 'New York, NY'
      },
      summary: 'Experienced professional imported from parsed text.',
      experience: [{
        id: '1',
        company: 'Tech Corp',
        position: 'Software Engineer',
        startDate: 'Jan 2020',
        endDate: 'Present',
        current: true,
        description: 'Developed scalable web applications.'
      }],
      education: [{
        id: 'e1',
        institution: 'State University',
        degree: 'BS',
        field: 'Computer Science',
        startDate: '2015',
        endDate: '2019',
        description: 'Graduated with honors.'
      }],
      skills: [{
        id: 's1',
        category: 'Core',
        items: 'JavaScript, React, Node.js'
      }],
      projects: [],
      customSections: []
    };
  };

  const aiCall = async () => {
    const content = await callNvidia([
      { role: 'system', content: `You are an expert resume parser. Extract the structured information from the provided resume text and return it as a JSON object matching this schema:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "github": "" },
  "summary": "",
  "experience": [{ "id": "uuid-string", "company": "", "position": "", "startDate": "", "endDate": "", "current": boolean, "description": "" }],
  "education": [{ "id": "uuid-string", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "current": boolean, "description": "" }],
  "skills": [{ "id": "uuid-string", "category": "", "items": "comma separated string" }],
  "projects": [{ "id": "uuid-string", "title": "", "technologies": "comma separated", "url": "", "description": "" }]
}
For all IDs, generate a short random alphanumeric string. If any field is missing in the text, leave it empty.` },
      { role: 'user', content: `Resume Text:\n${resumeText}` }
    ], { responseFormat: 'json_object', maxTokens: 4096 });
    return JSON.parse(content);
  };

  return callAI(mockFn, aiCall, { name: 'parseResumeToJson' });
};

exports.enhanceResumeContent = async (text, action) => {
  const mockFn = async () => {
    await delay(1000);
    if (action === 'grammar') return `[Grammar Fixed]: ${text}`;
    if (action === 'rewrite') return `[Professionally Rewritten]: ${text}`;
    if (action === 'ats') return `[ATS Optimized]: ${text}`;
    return text;
  };

  const prompts = {
    grammar: 'You are an expert copy editor. Fix all grammar and spelling errors in the following text. Do not change the meaning or add new information. Return only the corrected text without quotes or explanations.',
    rewrite: 'You are an expert resume writer. Rewrite the following text to be more impactful, professional, and action-oriented. Use strong action verbs. Return only the rewritten text without quotes or explanations.',
    ats: 'You are an ATS optimization expert. Rewrite the following resume bullet point to include more standard industry keywords and metrics where implied, making it highly optimized for ATS parsers. Return only the optimized text without quotes or explanations.'
  };

  const aiCall = async () => {
    const systemPrompt = prompts[action] || prompts.rewrite;
    const content = await callNvidia([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ], { temperature: 0.4, maxTokens: 1024 });
    return content.replace(/^["']|["']$/g, '').trim();
  };

  return callAI(mockFn, aiCall, { name: 'enhanceResumeContent' });
};
