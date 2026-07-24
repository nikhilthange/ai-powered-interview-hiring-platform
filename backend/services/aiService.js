const Application = require('../models/Application');
const AiConfig = require('../models/AiConfig');
const aiProvider = require('./aiProvider');
const { createAndSend } = require('../utils/notificationHelper');

const AI_SERVICE_NAME = 'aiService';

let currentProvider = process.env.MOCK_AI === 'true' ? 'mock' : process.env.AI_PROVIDER || 'nvidia';
let providerLoaded = false;

async function loadProvider() {
  try {
    const config = await AiConfig.getConfig();
    if (process.env.MOCK_AI === 'true') {
      currentProvider = 'mock';
    } else if (process.env.AI_PROVIDER) {
      currentProvider = process.env.AI_PROVIDER;
    } else {
      currentProvider = config.provider || 'nvidia';
    }
    if (process.env.MOCK_AI === 'true' || process.env.AI_PROVIDER) {
      await AiConfig.findOneAndUpdate({}, { provider: currentProvider }, { upsert: true });
    }
  } catch {
    currentProvider = process.env.MOCK_AI === 'true' ? 'mock' : process.env.AI_PROVIDER || 'nvidia';
  }
  providerLoaded = true;
  const hasAnyKey = !!(process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  console.log(`[${AI_SERVICE_NAME}] Provider: ${currentProvider}, hasApiKey: ${hasAnyKey}`);
}

function getProvider() {
  return currentProvider;
}

async function setProvider(provider) {
  currentProvider = provider;
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

exports.getProvider = getProvider;
exports.setProvider = setProvider;
exports.recordMetrics = recordMetrics;

exports.callNvidia = async (messages, options = {}) => {
  return aiProvider.call(messages, options);
};

exports.callNvidiaStream = async (messages, callbacks, options = {}) => {
  return aiProvider.nvidiaStream(messages, callbacks, options);
};

exports.extractJsonArray = (text) => {
  const parsed = aiProvider.extractJson(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const values = Object.values(parsed);
    const arr = values.find(v => Array.isArray(v));
    if (arr) return arr;
  }
  return null;
};

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

  return aiProvider.nvidiaStream(aiMessages, callbacks, options);
};

exports.generateChatTitle = async (message) => {
  const result = await aiProvider.generateChatTitle({ message });
  return result.replace(/["'']/g, '').trim() || 'New conversation';
};

exports.analyzeJobMatchBatch = async (candidateData, jobs) => {
  const skillsStr = (candidateData.skills || []).join(', ') || 'Not specified';
  const expStr = `${candidateData.experienceYears || 0} years`;
  const eduStr = (candidateData.education || []).map(e =>
    `${e.degree || ''} in ${e.field || ''} from ${e.institution || ''} (${e.startYear || ''}-${e.endYear || ''})`
  ).filter(Boolean).join('; ') || 'Not specified';
  const resumeStr = candidateData.resumeText ? candidateData.resumeText.slice(0, 3000) : 'No resume provided';

  const jobsText = jobs.map((job, idx) =>
    `[${idx}] Title: ${job.title}\nDescription: ${(job.description || '').slice(0, 500)}\nRequirements: ${(job.requirements || []).join(', ')}\nLevel: ${job.experienceLevel || 'Any'}\nType: ${job.jobType || 'Any'}`
  ).join('\n\n');

  const content = await aiProvider.call([
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
  ], { temperature: 0.3, maxTokens: 4096, responseFormat: 'json_object' });

  let parsed = aiProvider.extractJson(content);

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

exports.analyzeResumeBackground = async (applicationId, resumeText, jobDescription) => {
  const start = Date.now();
  try {
    const result = await aiProvider.analyzeResume({ resumeText, jobDescription });
    await recordMetrics({ duration: Date.now() - start });

    const app = await Application.findByIdAndUpdate(applicationId, {
      atsScore: result.atsScore,
      matchPercent: result.matchPercent,
      aiAnalysis: {
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        interviewTips: result.interviewTips || []
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
    await recordMetrics({ duration: Date.now() - start, error: error.message });
    console.error(`[aiService] AnalyzeResumeBackground error for Application ${applicationId}:`, error);
  }
};

exports.analyzeResumeInteractive = async (resumeText, jobDescription) => {
  const result = await aiProvider.analyzeResume({ resumeText, jobDescription });
  return {
    atsScore: result.atsScore,
    matchPercent: result.matchPercent,
    aiAnalysis: {
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      interviewTips: result.interviewTips || []
    }
  };
};

exports.generateMockInterviewQuestions = async (jobDescription, resumeText) => {
  const result = await aiProvider.generateInterviewQuestions({ jobDescription, resumeText });
  if (Array.isArray(result)) return result;
  if (result.questions) return result.questions;
  throw new Error('Unexpected response format for interview questions');
};

exports.generateCareerRoadmap = async (skills, targetRole) => {
  return aiProvider.generateCareerRoadmap({ skills, targetRole });
};

exports.generateCareerRoadmapFromResume = async (resumeText, targetRole) => {
  const fallbackRoadmap = {
    targetRole,
    summary: `A structured career roadmap to become a ${targetRole}.`,
    estimatedDuration: '6 months',
    milestones: [
      { title: 'Foundation Building', duration: 'Months 1-2', description: 'Master core concepts.', status: 'pending', skills: ['Core Languages', 'Basic Frameworks'], resources: [{ title: 'Official Documentation' }] },
      { title: 'Advanced Concepts', duration: 'Months 3-4', description: 'Learn advanced architectures and tooling.', status: 'pending', skills: ['Architecture Patterns', 'Testing'], resources: [{ title: 'Advanced Tutorials' }] },
      { title: 'Portfolio & Interview Prep', duration: 'Months 5-6', description: 'Build projects and prepare for interviews.', status: 'pending', skills: ['System Design', 'Interview Prep'], resources: [{ title: 'System Design Primer' }] }
    ]
  };

  try {
    const result = await aiProvider.generateCareerRoadmap({ resumeText, targetRole });
    if (!result.milestones || !Array.isArray(result.milestones) || result.milestones.length === 0) {
      return fallbackRoadmap;
    }
    return result;
  } catch (err) {
    console.error('[aiService] Failed to generate roadmap:', err.message);
    return fallbackRoadmap;
  }
};

exports.analyzeResumeFromFile = async (resumeText, jobDescription) => {
  const result = await aiProvider.analyzeResume({ resumeText, jobDescription });
  return {
    atsScore: result.atsScore,
    matchPercent: result.matchPercent,
    aiAnalysis: {
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      interviewTips: result.interviewTips || []
    },
    missingSkills: result.missingSkills || [],
    improvements: result.improvements || [],
    suggestedProjects: result.suggestedProjects || [],
    suggestedCertifications: result.suggestedCertifications || []
  };
};

exports.analyzeSkillGap = async (resumeText, targetRole) => {
  return aiProvider.analyzeSkillGap({ resumeText, targetRole });
};

exports.analyzeSkillGapFromFile = async (resumeText, targetRole) => {
  return aiProvider.analyzeSkillGap({ resumeText, targetRole });
};

exports.analyzeInterviewFeedback = async (qaPairs) => {
  const result = await aiProvider.analyzeInterviewFeedback({ answers: qaPairs });
  const overall = result.overallScore || 0;
  const comm = result.communicationScore || 0;
  const grammar = result.grammarScore || 0;
  const confidence = result.confidenceScore || 0;
  const technical = result.technicalScore || 0;
  const strengths = result.strengths || [];
  const suggestions = result.suggestions || [];

  return {
    overallScore: overall,
    communicationScore: comm,
    grammarScore: grammar,
    confidenceScore: confidence,
    technicalScore: technical,
    strengths,
    suggestions,
    summary: `Overall: ${overall}/100 | Communication: ${comm}/100 | Grammar: ${grammar}/100 | Confidence: ${confidence}/100 | Technical: ${technical}/100`
  };
};

exports.generateDifficultyQuestions = async (resumeText, targetRole, difficulty) => {
  const result = await aiProvider.generateInterviewQuestions({ resumeText, jobDescription: `Target Role: ${targetRole}, Difficulty: ${difficulty}` });
  const questions = Array.isArray(result) ? result : (result.questions || []);
  const categories = ['Technical Skills', 'System Design', 'Problem Solving', 'Domain Knowledge', 'Behavioral'];

  return questions.map((q, i) => ({
    question: typeof q === 'string' ? q : q.question,
    category: q.category || categories[i % categories.length],
    difficulty
  }));
};

exports.scoreAnswer = async (question, answer, difficulty) => {
  const maxScore = 10;
  const result = await aiProvider.scoreAnswer({ question, answer, difficulty });
  return {
    score: Math.min(result.score, maxScore),
    maxScore,
    feedback: result.feedback,
    strengths: result.strengths || [],
    improvements: result.improvements || [],
  };
};

exports.generateOverallFeedback = async (questions, targetRole) => {
  return aiProvider.generateOverallFeedback({ questions, targetRole });
};

exports.parseResumeToJson = async (resumeText) => {
  return aiProvider.parseResumeToJson({ resumeText });
};

exports.enhanceResumeContent = async (text, action) => {
  return aiProvider.enhanceResumeContent({ text, action });
};

exports.generateCompletion = async (messages) => {
  return aiProvider.call(messages, { temperature: 0.7, maxTokens: 2048 });
};