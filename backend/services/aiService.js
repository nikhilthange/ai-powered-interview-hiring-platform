const Application = require('../models/Application');
const { createAndSend } = require('../utils/notificationHelper');

const AI_SERVICE_NAME = 'aiService';

/**
 * Circuit breaker state: tracks consecutive failures to auto-fallback to mock mode.
 */
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

let openai = null;
let openaiInitError = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 2
    });
    console.log(`[${AI_SERVICE_NAME}] OpenAI client initialized successfully.`);
  } catch (err) {
    openaiInitError = err;
    console.warn(`[${AI_SERVICE_NAME}] OpenAI SDK import failed: ${err.message}. Running in mock mode.`);
  }
} else {
  console.warn(`[${AI_SERVICE_NAME}] No OPENAI_API_KEY found. Running in mock mode.`);
}

/**
 * MOCK AI DELAY HELPER
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps OpenAI API calls with circuit breaker and error handling.
 * If the circuit is open or the API call fails, falls back to mock data.
 */
async function callOpenAI(mockFn, openaiCall, options = {}) {
  const callerName = options.name || 'openai_call';

  if (!openai || circuitBreaker.isOpen) {
    if (circuitBreaker.isOpen) {
      console.warn(`[${AI_SERVICE_NAME}] Circuit breaker OPEN for "${callerName}". Using mock data.`);
    }
    if (typeof mockFn === 'function') {
      return mockFn();
    }
    return mockFn;
  }

  try {
        const result = await openaiCall();
        circuitBreaker.reset();
        return result;
      } catch (err) {
    console.error(`[${AI_SERVICE_NAME}] OpenAI API call "${callerName}" FAILED:`, err.message);
    if (err.stack) console.error(`[${AI_SERVICE_NAME}] Stack:`, err.stack.split('\n').slice(0, 4).join('\n'));

    circuitBreaker.trip();

    if (typeof mockFn === 'function') {
      console.warn(`[${AI_SERVICE_NAME}] Falling back to mock data for "${callerName}".`);
      return mockFn();
    }
    throw err;
  }
}

/**
 * 1. RESUME ATS ANALYZER SERVICE (background / fire-and-forget safe)
 */
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

    const openaiCall = async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert ATS screening system. Compare the resume against the job description and output structured evaluation parameters.' },
          { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'ats_result',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                atsScore: { type: 'integer' },
                matchPercent: { type: 'integer' },
                strengths: { type: 'array', items: { type: 'string' } },
                weaknesses: { type: 'array', items: { type: 'string' } },
                interviewTips: { type: 'array', items: { type: 'string' } }
              },
              required: ['atsScore', 'matchPercent', 'strengths', 'weaknesses', 'interviewTips'],
              additionalProperties: false
            }
          }
        }
      });
      return JSON.parse(response.choices[0].message.content);
    };

    const result = await callOpenAI(mockFn, openaiCall, { name: 'analyzeResumeBackground' });

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

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert ATS screening system. Compare the resume against the job description and output structured evaluation.' },
        { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ats_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              atsScore: { type: 'integer' },
              matchPercent: { type: 'integer' },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              interviewTips: { type: 'array', items: { type: 'string' } }
            },
            required: ['atsScore', 'matchPercent', 'strengths', 'weaknesses', 'interviewTips'],
            additionalProperties: false
          }
        }
      }
    });
    const result = JSON.parse(response.choices[0].message.content);
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

  return callOpenAI(mockFn, openaiCall, { name: 'analyzeResumeInteractive' });
};

/**
 * 2. MOCK INTERVIEW QUESTION GENERATOR
 */
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

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an HR technical interviewer. Generate exactly 5 relevant interview questions based on the candidate resume and job description. Output as a JSON array of strings.' },
        { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'interview_questions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              questions: { type: 'array', items: { type: 'string' } }
            },
            required: ['questions'],
            additionalProperties: false
          }
        }
      }
    });
    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed.questions;
  };

  return callOpenAI(mockFn, openaiCall, { name: 'generateMockInterviewQuestions' });
};

/**
 * 3. CAREER ROADMAP GENERATOR
 */
exports.generateCareerRoadmap = async (skills, targetRole) => {
  const mockFn = async () => {
    await delay(1200);
    return {
      role: targetRole,
      estimatedMonths: 6,
      phases: [
        { title: 'Foundation Building', duration: 'Months 1-2', skillsToLearn: ['TypeScript', 'Advanced Node.js streams'], recommendedResources: ['TypeScript Documentation', 'Node.js Design Patterns book'] },
        { title: 'Enterprise Architecture', duration: 'Months 3-4', skillsToLearn: ['Docker containerization', 'Redis Caching & Pub/Sub'], recommendedResources: ['Docker Mastery course', 'Redis University tutorials'] },
        { title: 'System Deployment', duration: 'Months 5-6', skillsToLearn: ['Nginx config', 'CI/CD workflows', 'VPS monitoring'], recommendedResources: ['Nginx fundamentals', 'GitHub Actions workflow docs'] }
      ]
    };
  };

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a career development coach. Create a phased career roadmap for the candidate to reach their target role starting from their current skills. Output as a structured JSON.' },
        { role: 'user', content: `Current Skills: ${skills.join(', ')}\nTarget Role: ${targetRole}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'career_roadmap',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              estimatedMonths: { type: 'integer' },
              phases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    duration: { type: 'string' },
                    skillsToLearn: { type: 'array', items: { type: 'string' } },
                    recommendedResources: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['title', 'duration', 'skillsToLearn', 'recommendedResources'],
                  additionalProperties: false
                }
              }
            },
            required: ['role', 'estimatedMonths', 'phases'],
            additionalProperties: false
          }
        }
      }
    });
    return JSON.parse(response.choices[0].message.content);
  };

  return callOpenAI(mockFn, openaiCall, { name: 'generateCareerRoadmap' });
};

/**
 * 5. RESUME FILE UPLOAD ANALYZER (with expanded output)
 */
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

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert ATS screening and career advisory system. Analyze the resume against the job description and provide comprehensive structured feedback.' },
        { role: 'user', content: `Job Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'resume_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              atsScore: { type: 'integer' },
              matchPercent: { type: 'integer' },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              interviewTips: { type: 'array', items: { type: 'string' } },
              missingSkills: { type: 'array', items: { type: 'string' } },
              improvements: { type: 'array', items: { type: 'string' } },
              suggestedProjects: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title', 'description'], additionalProperties: false } },
              suggestedCertifications: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, provider: { type: 'string' } }, required: ['name', 'provider'], additionalProperties: false } }
            },
            required: ['atsScore', 'matchPercent', 'strengths', 'weaknesses', 'interviewTips', 'missingSkills', 'improvements', 'suggestedProjects', 'suggestedCertifications'],
            additionalProperties: false
          }
        }
      }
    });
    const result = JSON.parse(response.choices[0].message.content);
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

  return callOpenAI(mockFn, openaiCall, { name: 'analyzeResumeFromFile' });
};

/**
 * 6. SKILL GAP ANALYZER
 */
exports.analyzeSkillGap = async (resumeText, targetRole) => {
  const mockFn = async () => {
    await delay(1200);
    return {
      currentSkills: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
      missingSkills: ['TypeScript', 'Docker', 'Redis', 'AWS', 'CI/CD'],
      gapAnalysis: 'Core backend skills present. Missing DevOps and cloud deployment skills required for the target role.',
      recommendations: ['Learn TypeScript — essential for modern Node.js enterprise codebases', 'Get hands-on with Docker and container orchestration', 'Study Redis for caching and pub/sub patterns', 'Obtain at least one cloud certification (AWS/GCP/Azure)', 'Set up a CI/CD pipeline using GitHub Actions']
    };
  };

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a skill gap analyst. Compare the candidate resume against the target role requirements. Output a structured JSON with current skills, missing skills, gap analysis, and recommendations.' },
        { role: 'user', content: `Resume Text:\n${resumeText}\n\nTarget Role: ${targetRole}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'skill_gap_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              currentSkills: { type: 'array', items: { type: 'string' } },
              missingSkills: { type: 'array', items: { type: 'string' } },
              gapAnalysis: { type: 'string' },
              recommendations: { type: 'array', items: { type: 'string' } }
            },
            required: ['currentSkills', 'missingSkills', 'gapAnalysis', 'recommendations'],
            additionalProperties: false
          }
        }
      }
    });
    return JSON.parse(response.choices[0].message.content);
  };

  return callOpenAI(mockFn, openaiCall, { name: 'analyzeSkillGap' });
};

/**
 * 7. SKILL GAP UPLOAD ANALYZER (with learning roadmap)
 */
exports.analyzeSkillGapFromFile = async (resumeText, targetRole) => {
  const mockFn = async () => {
    await delay(2000);
    return {
      currentSkills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
      missingSkills: ['TypeScript', 'Docker', 'Redis', 'AWS', 'CI/CD'],
      gapAnalysis: 'Core backend skills present. Missing DevOps and cloud deployment skills required for the target role.',
      recommendations: ['Learn TypeScript', 'Get hands-on with Docker', 'Study Redis', 'Obtain cloud certification', 'Set up CI/CD pipeline'],
      learningRoadmap: {
        overview: 'Structured 6-month learning plan to close the skill gaps.',
        phases: [
          { title: 'Foundations', duration: 'Month 1', focus: 'Core language and tool fundamentals', skillsToLearn: ['TypeScript basics', 'Docker fundamentals'], resources: [{ name: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' }], milestones: ['Convert a Node.js project to TypeScript'] },
          { title: 'Intermediate', duration: 'Months 2-3', focus: 'Cloud and infrastructure skills', skillsToLearn: ['AWS EC2/S3/Lambda', 'Redis caching'], resources: [{ name: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' }], milestones: ['Deploy a Node.js app on AWS EC2'] },
          { title: 'Advanced', duration: 'Months 4-6', focus: 'Production-ready systems', skillsToLearn: ['Kubernetes basics', 'Microservices patterns'], resources: [{ name: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/' }], milestones: ['Deploy a multi-service app on Kubernetes'] }
        ]
      }
    };
  };

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a skill gap analyst and career coach. Analyze the resume against the target role, identify skill gaps, provide actionable recommendations, and create a structured learning roadmap.' },
        { role: 'user', content: `Resume Text:\n${resumeText}\n\nTarget Role: ${targetRole}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'skill_gap_with_roadmap',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              currentSkills: { type: 'array', items: { type: 'string' } },
              missingSkills: { type: 'array', items: { type: 'string' } },
              gapAnalysis: { type: 'string' },
              recommendations: { type: 'array', items: { type: 'string' } },
              learningRoadmap: {
                type: 'object',
                properties: {
                  overview: { type: 'string' },
                  phases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        duration: { type: 'string' },
                        focus: { type: 'string' },
                        skillsToLearn: { type: 'array', items: { type: 'string' } },
                        resources: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string' } }, required: ['name', 'url'], additionalProperties: false } },
                        milestones: { type: 'array', items: { type: 'string' } }
                      },
                      required: ['title', 'duration', 'focus', 'skillsToLearn', 'resources', 'milestones'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['overview', 'phases'],
                additionalProperties: false
              }
            },
            required: ['currentSkills', 'missingSkills', 'gapAnalysis', 'recommendations', 'learningRoadmap'],
            additionalProperties: false
          }
        }
      }
    });
    return JSON.parse(response.choices[0].message.content);
  };

  return callOpenAI(mockFn, openaiCall, { name: 'analyzeSkillGapFromFile' });
};

/**
 * 4. MOCK INTERVIEW FEEDBACK ANALYZER
 */
exports.analyzeInterviewFeedback = async (qaPairs) => {
  const mockFn = async () => {
    await delay(1000);
    return `Candidate answered all questions with basic competency. Good understanding of core architecture. Overall Rating: 7.5/10.`;
  };

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a technical interviewer evaluating answers to mock interview questions. Output a detailed qualitative evaluation summary.' },
        { role: 'user', content: `Q&A Pairs:\n${JSON.stringify(qaPairs, null, 2)}` }
      ]
    });
    return response.choices[0].message.content;
  };

  return callOpenAI(mockFn, openaiCall, { name: 'analyzeInterviewFeedback' });
};

/**
 * 8. MOCK INTERVIEW — GENERATE QUESTIONS WITH DIFFICULTY
 */
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

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a technical interviewer conducting a ${difficulty} level interview for the role of ${targetRole}. ${difficultyDescriptions[difficulty] || difficultyDescriptions.medium}\n\nGenerate 5 interview questions tailored to the candidate's resume. Each question must include a category from: ${categories.join(', ')}.\nOutput as a JSON object with a "questions" array where each item has "question" (string) and "category" (string).\n\nMake questions specific to the candidate's experience and the target role.` },
        { role: 'user', content: `Candidate Resume:\n${resumeText}\n\nTarget Role: ${targetRole}\nDifficulty Level: ${difficulty}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'interview_questions_scored',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { question: { type: 'string' }, category: { type: 'string' } },
                  required: ['question', 'category'],
                  additionalProperties: false
                }
              }
            },
            required: ['questions'],
            additionalProperties: false
          }
        }
      }
    });
    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed.questions.map((q) => ({ question: q.question, category: q.category, difficulty }));
  };

  return callOpenAI(mockFn, openaiCall, { name: 'generateDifficultyQuestions' });
};

/**
 * 9. MOCK INTERVIEW — SCORE A SINGLE ANSWER
 */
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

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a technical interviewer scoring a ${difficulty} level interview answer. Evaluate the answer based on:\n1. Correctness and accuracy (0-3 points)\n2. Depth and completeness (0-3 points)\n3. Communication and clarity (0-2 points)\n4. Practical application examples (0-2 points)\nTotal: 0-${maxScore} points\n\nProvide a JSON object with score (integer), feedback (string), strengths (array of strings), and improvements (array of strings).` },
        { role: 'user', content: `Question: ${question}\n\nCandidate Answer: ${answer}\n\nDifficulty: ${difficulty}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'answer_score',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              score: { type: 'integer' },
              feedback: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              improvements: { type: 'array', items: { type: 'string' } }
            },
            required: ['score', 'feedback', 'strengths', 'improvements'],
            additionalProperties: false
          }
        }
      }
    });
    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: Math.min(result.score, maxScore),
      maxScore,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
    };
  };

  return callOpenAI(mockFn, openaiCall, { name: 'scoreAnswer' });
};

/**
 * 10. MOCK INTERVIEW — GENERATE OVERALL FEEDBACK
 */
exports.generateOverallFeedback = async (questions, targetRole) => {
  const mockFn = async () => {
    await delay(1000);
    return {
      overallFeedback: 'Good performance overall. The candidate demonstrated solid technical knowledge but could improve on system design depth.',
      topStrengths: ['Strong foundational knowledge', 'Clear communication style', 'Good problem-solving approach'],
      areasToImprove: ['System design depth', 'Real-world examples', 'Handling edge cases'],
    };
  };

  const openaiCall = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are a technical interview coach. Review the completed interview for the role of ${targetRole} and provide constructive feedback.` },
        { role: 'user', content: `Interview Results:\n${JSON.stringify(questions.map(q => ({ question: q.question, category: q.category, difficulty: q.difficulty, answer: q.answer, score: q.score, maxScore: q.maxScore, feedback: q.feedback, strengths: q.strengths, improvements: q.improvements })), null, 2)}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'overall_feedback',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              overallFeedback: { type: 'string' },
              topStrengths: { type: 'array', items: { type: 'string' } },
              areasToImprove: { type: 'array', items: { type: 'string' } }
            },
            required: ['overallFeedback', 'topStrengths', 'areasToImprove'],
            additionalProperties: false
          }
        }
      }
    });
    return JSON.parse(response.choices[0].message.content);
  };

  return callOpenAI(mockFn, openaiCall, { name: 'generateOverallFeedback' });
};
