const MockInterviewSession = require('../models/MockInterviewSession');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { extractText, cleanup } = require('../services/resumeService');
const {
  generateDifficultyQuestions,
  scoreAnswer,
  generateOverallFeedback,
} = require('../services/aiService');

exports.createSession = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a resume file (PDF or DOCX).', 400);
  }

  const { targetRole, difficulty } = req.body;
  if (!targetRole || targetRole.trim().length < 3) {
    cleanup(req.file?.path);
    throw new AppError('Please provide a target role (at least 3 characters).', 400);
  }
  const DIFFICULTY_MAP = { junior: 'easy', mid: 'medium', senior: 'hard', easy: 'easy', medium: 'medium', hard: 'hard' };
  const mappedDifficulty = DIFFICULTY_MAP[difficulty?.toLowerCase()];
  if (!mappedDifficulty) {
    cleanup(req.file?.path);
    throw new AppError('Difficulty must be one of: easy, medium, hard (or Junior, Mid, Senior).', 400);
  }

  let resumeText;
  try {
    resumeText = await extractText(req.file.path, req.file.originalname);
  } catch (err) {
    cleanup(req.file.path);
    throw err;
  }

  const session = await MockInterviewSession.create({
    userId: req.user._id,
    resumeText,
    resumeFileName: req.file.originalname,
    targetRole: targetRole.trim(),
    difficulty: mappedDifficulty,
    status: 'pending',
  });

  cleanup(req.file.path);

  res.status(201).json({
    status: 'success',
    data: { session },
  });
});

exports.generateQuestions = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    throw new AppError('Please provide sessionId.', 400);
  }

  const session = await MockInterviewSession.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found.', 404);
  }
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized access to this session.', 403);
  }
  if (session.status !== 'pending') {
    throw new AppError('Questions have already been generated for this session.', 400);
  }

  const questions = await generateDifficultyQuestions(
    session.resumeText,
    session.targetRole,
    session.difficulty
  );

  session.questions = questions.map((q) => ({
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
    maxScore: 10,
  }));
  session.maxTotalScore = session.questions.length * 10;
  session.status = 'in_progress';
  session.startedAt = new Date();
  await session.save();

  res.status(200).json({
    status: 'success',
    data: {
      sessionId: session._id,
      questions: session.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
      })),
      totalQuestions: session.questions.length,
    },
  });
});

exports.submitAnswer = asyncHandler(async (req, res) => {
  const { sessionId, questionId, answer } = req.body;
  if (!sessionId || !questionId || !answer || !answer.trim()) {
    throw new AppError('Please provide sessionId, questionId, and answer.', 400);
  }

  const session = await MockInterviewSession.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found.', 404);
  }
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized access to this session.', 403);
  }
  if (session.status !== 'in_progress') {
    throw new AppError('Session is not in progress.', 400);
  }

  const question = session.questions.id(questionId);
  if (!question) {
    throw new AppError('Question not found in this session.', 404);
  }
  if (question.answer) {
    throw new AppError('This question has already been answered.', 400);
  }

  const scored = await scoreAnswer(question.question, answer.trim(), question.difficulty);

  question.answer = answer.trim();
  question.score = scored.score;
  question.feedback = scored.feedback;
  question.strengths = scored.strengths || [];
  question.improvements = scored.improvements || [];
  question.answeredAt = new Date();

  session.totalScore = session.questions.reduce(
    (sum, q) => sum + (q.score || 0),
    0
  );

  await session.save();

  res.status(200).json({
    status: 'success',
    data: {
      score: scored.score,
      maxScore: scored.maxScore,
      feedback: scored.feedback,
      strengths: scored.strengths,
      improvements: scored.improvements,
      totalScore: session.totalScore,
      maxTotalScore: session.maxTotalScore,
    },
  });
});

exports.completeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    throw new AppError('Please provide sessionId.', 400);
  }

  const session = await MockInterviewSession.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found.', 404);
  }
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized access to this session.', 403);
  }
  if (session.status !== 'in_progress') {
    throw new AppError('Session is not in progress.', 400);
  }

  const unanswered = session.questions.filter((q) => !q.answer);
  if (unanswered.length > 0) {
    throw new AppError(`Please answer all questions before completing. ${unanswered.length} question(s) remaining.`, 400);
  }

  session.overallScore = session.maxTotalScore > 0
    ? Math.round((session.totalScore / session.maxTotalScore) * 100)
    : 0;

  const feedback = await generateOverallFeedback(session.questions, session.targetRole);

  session.feedback = feedback.overallFeedback;
  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();

  const percentage = Math.round((session.totalScore / session.maxTotalScore) * 100);
  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : 'D';

  res.status(200).json({
    status: 'success',
    data: {
      sessionId: session._id,
      overallScore: session.overallScore,
      totalScore: session.totalScore,
      maxTotalScore: session.maxTotalScore,
      percentage,
      grade,
      overallFeedback: feedback.overallFeedback,
      topStrengths: feedback.topStrengths,
      areasToImprove: feedback.areasToImprove,
      completedAt: session.completedAt,
    },
  });
});

exports.getSession = asyncHandler(async (req, res) => {
  const session = await MockInterviewSession.findById(req.params.id);
  if (!session) {
    throw new AppError('Session not found.', 404);
  }
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized access to this session.', 403);
  }

  res.status(200).json({
    status: 'success',
    data: { session },
  });
});

exports.getMySessions = asyncHandler(async (req, res) => {
  const sessions = await MockInterviewSession.find({ userId: req.user._id })
    .select('targetRole difficulty status overallScore totalScore maxTotalScore createdAt completedAt')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    data: { sessions },
  });
});
