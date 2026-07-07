const AIConversation = require('../models/aiConversation');
const AIMessage = require('../models/aiMessage');
const aiService = require('../services/aiService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

exports.createConversation = asyncHandler(async (req, res, next) => {
  const { title, context } = req.body;
  const conversation = await AIConversation.create({
    userId: req.user._id,
    title: title || 'New conversation',
    context: context || { type: 'general' }
  });

  res.status(201).json({
    status: 'success',
    data: { conversation }
  });
});

exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await AIConversation.find({ userId: req.user._id })
    .sort({ lastMessageAt: -1 })
    .select('-context.resumeText');

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: { conversations }
  });
});

exports.getConversation = asyncHandler(async (req, res, next) => {
  const conversation = await AIConversation.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { conversation }
  });
});

exports.updateConversation = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const conversation = await AIConversation.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { title },
    { new: true, runValidators: true }
  );

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { conversation }
  });
});

exports.deleteConversation = asyncHandler(async (req, res, next) => {
  const conversation = await AIConversation.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  await AIMessage.deleteMany({ conversationId: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.searchConversations = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return next(new AppError('Please provide a search query', 400));
  }

  const conversations = await AIConversation.find({
    userId: req.user._id,
    title: { $regex: q, $options: 'i' }
  })
    .sort({ lastMessageAt: -1 })
    .select('-context.resumeText');

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: { conversations }
  });
});

exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await AIConversation.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const messages = await AIMessage.find({ conversationId: req.params.id })
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: { messages }
  });
});

exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { content, regenerate } = req.body;
  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  const conversation = await AIConversation.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  if (regenerate) {
    const lastAiMessage = await AIMessage.findOne({
      conversationId: req.params.id,
      role: 'assistant'
    }).sort({ createdAt: -1 });

    if (lastAiMessage) {
      await AIMessage.findByIdAndDelete(lastAiMessage._id);
    }
  }

  const userMessage = await AIMessage.create({
    conversationId: req.params.id,
    role: 'user',
    content
  });

  const history = await AIMessage.find({ conversationId: req.params.id })
    .sort({ createdAt: 1 });

  const messages = history.map(m => ({
    role: m.role,
    content: m.content
  }));

  const isFirstMessage = history.filter(m => m.role === 'user').length <= 1;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  let fullContent = '';
  let aborted = false;

  req.on('close', () => {
    aborted = true;
  });

  try {
    await aiService.generateChatStream(messages, conversation.context, {
      onChunk: (chunk) => {
        if (aborted) return;
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      },
      onDone: async (content) => {
        if (aborted) return;
        const aiMessage = await AIMessage.create({
          conversationId: req.params.id,
          role: 'assistant',
          content
        });

        await AIConversation.findByIdAndUpdate(req.params.id, {
          lastMessageAt: new Date()
        });

        if (isFirstMessage) {
          try {
            const generatedTitle = await aiService.generateChatTitle(content);
            await AIConversation.findByIdAndUpdate(req.params.id, {
              title: generatedTitle
            });
          } catch {
          }
        }

        res.write(`data: ${JSON.stringify({ type: 'done', messageId: aiMessage._id, content })}\n\n`);
        res.end();
      },
      onError: (error) => {
        if (aborted) return;
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'An error occurred' })}\n\n`);
        res.end();
      }
    });
  } catch (error) {
    if (!aborted) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate response. Please try again.' })}\n\n`);
      res.end();
    }
  }
});
