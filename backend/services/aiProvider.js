class AIProvider {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.nvidiaApiKey = process.env.NVIDIA_API_KEY;
    this.nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.nvidiaModel = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  get activeProvider() {
    return (process.env.AI_PROVIDER || 'nvidia').toLowerCase();
  }

  getProviderOrder() {
    const primary = this.activeProvider;
    const order = [primary];
    const all = ['nvidia', 'gemini', 'openai'];
    all.forEach(p => { if (p !== primary && this[`${p}ApiKey`]) order.push(p); });
    return order;
  }

  async call(messages, options = {}) {
    const { temperature = 0.2, maxTokens = 1024, responseFormat } = options;
    const providers = this.getProviderOrder();
    let lastError;

    for (const provider of providers) {
      try {
        switch (provider) {
          case 'gemini':
            return await this.callGemini(messages, { temperature, maxTokens, responseFormat });
          case 'openai':
            return await this.callOpenAI(messages, { temperature, maxTokens, responseFormat });
          case 'nvidia':
            return await this.callNVIDIA(messages, { temperature, maxTokens, responseFormat });
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AIProvider] ${provider} failed: ${err.message}`);
      }
    }
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  async callGemini(messages, options = {}) {
    const { temperature = 0.2, maxTokens = 1024, responseFormat } = options;
    if (!this.geminiApiKey) throw new Error('Gemini API key not configured');

    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    const contents = userMessages.map(m => ({ parts: [{ text: m.content }] }));

    const body = {
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens }
    };

    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    if (responseFormat === 'json_object') {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) throw new Error(`Gemini API error (${response.status})`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty response');
    return text;
  }

  async callOpenAI(messages, options = {}) {
    const { temperature = 0.2, maxTokens = 1024, responseFormat } = options;
    if (!this.openaiApiKey) throw new Error('OpenAI API key not configured');

    const body = {
      model: this.openaiModel,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI returned empty response');
    return text;
  }

  async callNVIDIA(messages, options = {}) {
    const { temperature = 0.2, maxTokens = 1024, responseFormat } = options;
    if (!this.nvidiaApiKey) throw new Error('NVIDIA API key not configured');

    const body = {
      model: this.nvidiaModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    if (responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${this.nvidiaBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.nvidiaApiKey}`
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  }

  extractJson(text) {
    const trimmed = text.trim();
    try { return JSON.parse(trimmed); } catch {}
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch {} }
    const braceStart = trimmed.indexOf('{');
    if (braceStart !== -1) { try { return JSON.parse(trimmed.slice(braceStart)); } catch {} }
    const bracketStart = trimmed.indexOf('[');
    if (bracketStart !== -1) { try { return JSON.parse(trimmed.slice(bracketStart)); } catch {} }
    throw new Error('Failed to parse JSON from AI response');
  }

  async callWithJson(messages, options = {}) {
    const text = await this.call(messages, { ...options, responseFormat: 'json_object' });
    return this.extractJson(text);
  }

  async tailorResume({ resumeText = '', jobDescription = '' }) {
    const prompt = `You are an expert ATS Resume Coach. Analyze the resume against the job description and return ONLY valid JSON with this exact schema:
{
  "summaryBefore": "Short 2-3 sentence summary of the original resume",
  "summaryAfter": "Tailored impact-driven professional summary optimized for the job",
  "atsScoreBefore": number (0-100),
  "atsScoreAfter": number (0-100),
  "addedKeywords": [string],
  "missingKeywords": [string],
  "bulletImprovements": [{ "before": "original bullet text", "after": "improved bullet with metrics" }],
  "suggestions": [string]
}

Resume:
${resumeText.slice(0, 3000)}

Job Description:
${jobDescription.slice(0, 3000)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are an ATS optimization expert. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  async generateCoverLetter({ resumeText = '', jobDescription = '', tone = 'Professional' }) {
    const prompt = `Write a compelling ${tone} cover letter based on the resume and job description below. 
The cover letter should be personalized, highlight relevant skills and experience from the resume that match the job requirements.
Format as plain text with proper paragraph breaks.

Job Description: ${jobDescription.slice(0, 2000)}
Resume Info: ${resumeText.slice(0, 2000)}`;

    return this.call([
      { role: 'system', content: `You are an expert cover letter writer. Write a ${tone} cover letter tailored to the specific job.` },
      { role: 'user', content: prompt }
    ], { temperature: 0.4, maxTokens: 2048 });
  }

  async generateRecruiterEmail({ candidateName = 'Candidate', jobTitle = 'Software Engineer', companyName = 'Company', emailType = 'invite' }) {
    const instruction = emailType === 'invite'
      ? `Write a professional interview invitation email to ${candidateName} for the ${jobTitle} role at ${companyName}. Include request for availability.`
      : emailType === 'rejection'
        ? `Write a respectful rejection email to ${candidateName} for the ${jobTitle} role at ${companyName}. Be empathetic and encouraging.`
        : `Write a professional email to ${candidateName} regarding the ${jobTitle} role at ${companyName}.`;

    return this.call([
      { role: 'system', content: 'You are an HR professional. Write clear, professional recruitment emails.' },
      { role: 'user', content: instruction }
    ], { temperature: 0.3, maxTokens: 1024 });
  }

  async auditGithubData({ username, repos = [], userProfile = {} }) {
    const reposSummary = repos.slice(0, 10).map(r =>
      `- ${r.name} (${r.language || 'N/A'}, ${r.stars || 0} stars, ${r.forks || 0} forks)`
    ).join('\n');

    const prompt = `Analyze this GitHub profile data for developer @${username} and return ONLY valid JSON:
{
  "codingScore": number (0-100),
  "strengths": [string],
  "suggestions": [string]
}

Profile: ${JSON.stringify(userProfile, null, 2)}
Repositories:
${reposSummary}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a code review expert analyzing GitHub profiles. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 2048 });
  }

  async analyzeInterviewFeedback({ candidateName = 'Candidate', transcript = '', answers = [] }) {
    const answersSummary = Array.isArray(answers) && answers.length > 0
      ? answers.map((a, i) => `Q${i + 1}: ${a.question || ''}\nA: ${a.answer || ''}`).join('\n\n')
      : transcript;

    const prompt = `Analyze this AI technical interview session for candidate ${candidateName} and return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "communicationScore": number (0-100),
  "grammarScore": number (0-100),
  "confidenceScore": number (0-100),
  "technicalScore": number (0-100),
  "strengths": [string],
  "suggestions": [string]
}

Interview Data:
${answersSummary}`;

    return this.callWithJson([
      { role: 'system', content: 'You are an interview coach analyzing candidate performance. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 2048 });
  }

  async analyzeResume({ resumeText = '', jobDescription = '' }) {
    const prompt = `Analyze the resume against the job description and return ONLY valid JSON:
{
  "atsScore": number (0-100),
  "matchPercent": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "interviewTips": [string],
  "missingSkills": [string],
  "improvements": [string]
}

Job Description:
${jobDescription.slice(0, 3000)}

Resume:
${resumeText.slice(0, 3000)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are an expert ATS screening system. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  async matchJob({ resumeText = '', jobDescription = '', jobTitle = '', candidateProfile = {} }) {
    const skills = (candidateProfile.skills || []).join(', ') || 'Not specified';
    const experience = candidateProfile.experienceYears || 0;

    const prompt = `Compare the candidate's resume and profile against the job description. Return ONLY valid JSON:
{
  "matchPercent": number (0-100),
  "matchedSkills": [string],
  "missingSkills": [string],
  "preparationSuggestions": [string]
}

Job Title: ${jobTitle}
Job Description:
${jobDescription.slice(0, 3000)}

Candidate Skills: ${skills}
Candidate Experience: ${experience} years
Resume:
${resumeText.slice(0, 3000)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a job matching AI. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  async generateInterviewQuestions({ jobDescription = '', resumeText = '', count = 5 }) {
    const prompt = `Generate ${count} relevant interview questions based on the candidate's resume and the job description. Return ONLY a JSON array of strings.

Job Description:
${jobDescription.slice(0, 2000)}

Resume:
${resumeText.slice(0, 2000)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a technical interviewer. Return ONLY a JSON array of question strings.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 2048 });
  }

  async generateCareerRoadmap({ skills = [], targetRole = '', resumeText = '' }) {
    const prompt = `Create a detailed career roadmap for a candidate targeting ${targetRole}. Return ONLY valid JSON:
{
  "targetRole": "${targetRole}",
  "summary": "string",
  "estimatedDuration": "string",
  "milestones": [
    {
      "title": "string",
      "duration": "string",
      "description": "string",
      "status": "pending",
      "skills": [string],
      "resources": [{ "title": "string" }],
      "projects": [{ "title": "string", "description": "string" }]
    }
  ]
}

Current Skills: ${skills.join(', ') || 'Not specified'}
${resumeText ? `Resume:\n${resumeText.slice(0, 2000)}` : ''}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a career development coach. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  async analyzeSkillGap({ resumeText = '', targetRole = '' }) {
    const prompt = `Analyze the skill gap between the candidate's resume and the requirements for ${targetRole}. Return ONLY valid JSON:
{
  "existingSkills": [string],
  "missingSkills": [string],
  "gapAnalysis": "string",
  "recommendations": [string],
  "learningResources": [{ "title": "string", "description": "string", "url": "string" }],
  "recommendedProjects": [{ "title": "string", "description": "string", "skills": [string] }],
  "certifications": [{ "name": "string", "provider": "string" }],
  "timeline": [{ "title": "string", "duration": "string", "description": "string", "status": "string" }]
}

Resume:
${resumeText.slice(0, 3000)}

Target Role: ${targetRole}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a skill gap analyst. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  async scoreAnswer({ question = '', answer = '', difficulty = 'medium' }) {
    const prompt = `Score this ${difficulty}-level interview answer. Return ONLY valid JSON:
{
  "score": number (0-10),
  "feedback": "string",
  "strengths": [string],
  "improvements": [string]
}

Question: ${question}
Answer: ${answer}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a technical interviewer scoring answers. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 1024 });
  }

  async generateOverallFeedback({ questions = [], targetRole = '' }) {
    const results = questions.map(q => ({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      score: q.score,
      maxScore: q.maxScore,
      feedback: q.feedback
    }));

    const prompt = `Review this completed interview for ${targetRole} and return ONLY valid JSON:
{
  "overallFeedback": "string",
  "topStrengths": [string],
  "areasToImprove": [string]
}

Results: ${JSON.stringify(results, null, 2)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are an interview coach. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 2048 });
  }

  async enhanceResumeContent({ text = '', action = 'rewrite' }) {
    const prompts = {
      grammar: 'Fix all grammar and spelling errors. Return only the corrected text.',
      rewrite: 'Rewrite to be more impactful and professional using strong action verbs. Return only the rewritten text.',
      ats: 'Rewrite to include more standard industry keywords for ATS optimization. Return only the optimized text.'
    };

    return this.call([
      { role: 'system', content: prompts[action] || prompts.rewrite },
      { role: 'user', content: text }
    ], { temperature: 0.4, maxTokens: 1024 });
  }

  async parseResumeToJson({ resumeText = '' }) {
    const prompt = `Extract structured information from this resume. Return ONLY valid JSON:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "github": "" },
  "summary": "",
  "experience": [{ "id": "uuid", "company": "", "position": "", "startDate": "", "endDate": "", "current": boolean, "description": "" }],
  "education": [{ "id": "uuid", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "current": boolean, "description": "" }],
  "skills": [{ "id": "uuid", "category": "", "items": "comma separated" }],
  "projects": [{ "id": "uuid", "title": "", "technologies": "comma separated", "url": "", "description": "" }]
}

Resume:
${resumeText.slice(0, 4000)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a resume parser. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.1, maxTokens: 4096 });
  }

  async generateJobDescription({ prompt: userPrompt = '', title = '' }) {
    const prompt = `Generate a complete job posting. Return ONLY valid JSON:
{
  "title": "${title || 'Software Engineer'}",
  "summary": "string",
  "responsibilities": [string],
  "requiredSkills": [string],
  "preferredSkills": [string],
  "qualifications": [string],
  "experience": "string",
  "salaryRange": { "min": number, "max": number },
  "jobType": "Full-time | Part-time | Contract",
  "location": "string",
  "benefits": [string],
  "keywords": [string]
}

Context: ${userPrompt}`;

    return this.callWithJson([
      { role: 'system', content: 'You are an expert job description writer. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, maxTokens: 4096 });
  }

  async summarizeResume({ resumeText = '', candidateName = '' }) {
    const prompt = `Summarize this resume for a recruiter. Return ONLY valid JSON:
{
  "candidateName": "${candidateName || 'Candidate'}",
  "summary": "string",
  "keySkills": [string],
  "yearsOfExperience": number,
  "topAchievements": [string],
  "education": [{ "degree": "string", "field": "string", "institution": "string" }],
  "suggestedRoles": [string]
}

Resume:
${resumeText.slice(0, 3000)}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a resume reviewer for recruiters. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 4096 });
  }

  async compareCandidates({ candidates = [] }) {
    const candidatesStr = candidates.map((c, idx) =>
      `[${idx}] ${c.name || 'Unknown'}: Skills: ${(c.skills || []).join(', ')}, Experience: ${c.experience || 'N/A'}, Education: ${c.education || 'N/A'}`
    ).join('\n');

    const prompt = `Compare these candidates and rank them. Return ONLY a JSON array:
[{ "name": "string", "overallScore": number 0-100, "skillMatch": number 0-100, "experienceScore": number 0-100, "educationScore": number 0-100, "strengths": [string], "weaknesses": [string], "recommendation": "string", "ranking": number }]

Candidates:
${candidatesStr}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a recruitment AI comparing candidates. Return ONLY a JSON array.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 4096 });
  }

  async rankApplicants({ applications = [], jobDescription = '' }) {
    const appsStr = applications.map((app, idx) =>
      `[${idx}] ${app.name || 'Unknown'}: ATS: ${app.atsScore || 'N/A'}, Skills: ${(app.skills || []).join(', ')}`
    ).join('\n');

    const prompt = `Rank these applicants against the job. Return ONLY a JSON array:
[{ "candidateName": "string", "rank": number, "matchScore": number 0-100, "skillFit": number 0-100, "experienceFit": number 0-100, "aiNotes": "string", "verdict": "Shortlist | Consider | Low Priority" }]

Job Description:
${jobDescription.slice(0, 2000)}

Applicants:
${appsStr}`;

    return this.callWithJson([
      { role: 'system', content: 'You are ranking applicants. Return ONLY a JSON array.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 4096 });
  }

  async suggestSalary({ title = '', description = '', requirements = [], location = '', experienceLevel = '' }) {
    const prompt = `Suggest a salary range for this role. Return ONLY valid JSON:
{
  "suggestedRange": { "min": number, "max": number, "currency": "USD", "period": "yearly" },
  "marketAverage": number,
  "percentile10": number,
  "percentile90": number,
  "factors": [string],
  "notes": "string"
}

Title: ${title}
Location: ${location}
Level: ${experienceLevel}
Requirements: ${requirements.join(', ')}`;

    return this.callWithJson([
      { role: 'system', content: 'You are a compensation analyst. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, maxTokens: 2048 });
  }

  async generateChatTitle({ message = '' }) {
    return this.call([
      { role: 'system', content: 'Generate a short title (max 6 words) for a conversation based on the first user message. Return only the title, no quotes.' },
      { role: 'user', content: message }
    ], { temperature: 0.3, maxTokens: 30 });
  }

  async generateChatStream({ messages = [], context = {} }) {
    const systemParts = ['You are an expert AI Career Assistant for a hiring platform.'];
    if (context?.type === 'resume' && context.resumeText) {
      systemParts.push(`\n\nThe user's resume:\n${context.resumeText}`);
    }
    if (context?.type === 'job' && context.jobDescription) {
      systemParts.push(`\n\nJob: ${context.jobTitle || 'N/A'}\n${context.jobDescription}`);
    }
    const systemMsg = { role: 'system', content: systemParts.join('\n') };

    const activeProvider = this.activeProvider;
    if (activeProvider === 'gemini' && this.geminiApiKey) {
      return this.geminiStream([systemMsg, ...messages]);
    }
    if (activeProvider === 'openai' && this.openaiApiKey) {
      return this.openaiStream([systemMsg, ...messages]);
    }
    return this.nvidiaStream([systemMsg, ...messages]);
  }

  async nvidiaStream(messages, callbacks, options = {}) {
    const { temperature = 0.7, maxTokens = 2048 } = options;
    const { onChunk, onDone, onError } = callbacks || {};

    const body = {
      model: this.nvidiaModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    let fullContent = '';

    try {
      const response = await fetch(`${this.nvidiaBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.nvidiaApiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`NVIDIA API error (${response.status})`);

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
          } catch {}
        }
      }

      if (onDone) onDone(fullContent);
      return fullContent;
    } catch (err) {
      clearTimeout(timeoutId);
      if (onError) onError(err);
      throw err;
    }
  }
}

module.exports = new AIProvider();