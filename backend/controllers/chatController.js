const { ChatRoom, ChatMessage } = require('../models/Chat');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * CREATE OR GET CHAT ROOM
 */
exports.getOrCreateRoom = asyncHandler(async (req, res, next) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    return next(new AppError('Please provide a recipientId.', 400));
  }

  // Determine role-based participant slots
  let candidateId, recruiterId;
  if (req.user.role === 'candidate') {
    candidateId = req.user._id;
    recruiterId = recipientId;
  } else {
    candidateId = recipientId;
    recruiterId = req.user._id;
  }

  let room = await ChatRoom.findOne({ candidateId, recruiterId });
  if (!room) {
    room = await ChatRoom.create({ candidateId, recruiterId });
  }

  res.status(200).json({
    status: 'success',
    data: { room }
  });
});

/**
 * GET ALL MY CHAT ROOMS
 */
exports.getMyRooms = asyncHandler(async (req, res, next) => {
  const query = req.user.role === 'candidate'
    ? { candidateId: req.user._id }
    : { recruiterId: req.user._id };

  const rooms = await ChatRoom.find(query)
    .populate('candidateId', 'name email role')
    .populate('recruiterId', 'name email role')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: rooms.length,
    data: { rooms }
  });
});

/**
 * GET MESSAGES FOR A CHAT ROOM (Paginated)
 */
exports.getRoomMessages = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const room = await ChatRoom.findById(roomId);
  if (!room) {
    return next(new AppError('Chat room not found.', 404));
  }

  // Verify user belongs to this room
  const userId = req.user._id.toString();
  if (room.candidateId.toString() !== userId && room.recruiterId.toString() !== userId) {
    return next(new AppError('You do not have access to this chat room.', 403));
  }

  const messages = await ChatMessage.find({ chatRoomId: roomId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Mark messages from the other party as read
  await ChatMessage.updateMany(
    { chatRoomId: roomId, senderId: { $ne: req.user._id }, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: { messages: messages.reverse() }
  });
});

/**
 * GET UNREAD MESSAGE COUNT FOR CURRENT USER
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const query = req.user.role === 'candidate'
    ? { candidateId: req.user._id }
    : { recruiterId: req.user._id };

  const rooms = await ChatRoom.find(query).select('_id');
  const roomIds = rooms.map(r => r._id);

  const count = await ChatMessage.countDocuments({
    chatRoomId: { $in: roomIds },
    senderId: { $ne: req.user._id },
    isRead: false
  });

  res.status(200).json({
    status: 'success',
    data: { count }
  });
});

/**
 * UPLOAD ATTACHMENT
 */
exports.uploadAttachment = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }
  
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
    const resourceType = isImage ? 'image' : 'raw';

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType,
      folder: 'hiremate/chat_attachments'
    });

    // Cleanup local file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        resourceType,
        name: req.file.originalname
      }
    });
  } catch (err) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError('File upload to Cloudinary failed.', 500));
  }
});

/**
 * DELETE MESSAGE
 */
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const message = await ChatMessage.findById(id);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Check if sender
  if (message.senderId.toString() !== req.user._id.toString()) {
    // Check if admin
    if (req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this message.', 403));
    }
  }

  await ChatMessage.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
