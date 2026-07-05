const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ChatMessage, ChatRoom } = require('../models/Chat');
const Notification = require('../models/Notification');

let ioInstance = null;
const onlineUsers = new Map();

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];
      if (!token) {
        return next(new Error('Authentication failed. No token provided.'));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return next(new Error('TOKEN_EXPIRED'));
        }
        return next(new Error('Authentication failed. Invalid token session.'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication failed. User not found.'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed. Invalid token session.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));

    socket.join(`notifications:${userId}`);

    socket.on('join_room', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('send_message', async ({ roomId, messageText }) => {
      try {
        const message = await ChatMessage.create({
          chatRoomId: roomId,
          senderId: socket.user._id,
          messageText
        });

        const payload = {
          _id: message._id,
          chatRoomId: roomId,
          senderId: socket.user._id,
          messageText: message.messageText,
          createdAt: message.createdAt
        };

        io.to(roomId).emit('receive_message', payload);

        const chatRoom = await ChatRoom.findById(roomId);
        if (chatRoom) {
          const otherUserId = chatRoom.candidateId.toString() !== userId
            ? chatRoom.candidateId
            : chatRoom.recruiterId;
          if (otherUserId) {
            const notif = await Notification.create({
              recipientId: otherUserId,
              type: 'chat_message',
              title: `New message from ${socket.user.name || 'User'}`,
              message: messageText.slice(0, 100)
            });
            io.to(`notifications:${otherUserId}`).emit('notification', {
              _id: notif._id,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              isRead: false,
              createdAt: notif.createdAt
            });
          }
        }
      } catch (err) {
        console.error('WebSocket send_message save error:', err.message);
      }
    });

    socket.on('mark_read', async ({ roomId }) => {
      try {
        await ChatMessage.updateMany(
          { chatRoomId: roomId, senderId: { $ne: socket.user._id }, isRead: false },
          { $set: { isRead: true } }
        );
        socket.to(roomId).emit('messages_read', { roomId, userId: socket.user._id });
      } catch (err) {
        console.error('WebSocket mark_read error:', err.message);
      }
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing_status', {
        userId: socket.user._id,
        isTyping
      });
    });

    socket.on('refresh_token', async ({ token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          socket.user = user;
          socket.emit('token_refreshed', { success: true });
        }
      } catch (err) {
        socket.emit('token_refreshed', { success: false, error: 'Invalid token' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

const sendSocketNotification = async ({ userId, type, title, message }) => {
  if (!ioInstance) return null;

  const notif = await Notification.create({ recipientId: userId, type, title, message });
  const payload = {
    _id: notif._id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    isRead: false,
    createdAt: notif.createdAt
  };
  ioInstance.to(`notifications:${userId}`).emit('notification', payload);
  return notif;
};

module.exports = {
  initSocket,
  sendSocketNotification
};
