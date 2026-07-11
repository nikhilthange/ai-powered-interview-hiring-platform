const express = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/rooms', chatController.getMyRooms);
router.post('/rooms', chatController.getOrCreateRoom);
router.get('/rooms/unread-count', chatController.getUnreadCount);
router.get('/rooms/:roomId/messages', chatController.getRoomMessages);
router.delete('/messages/:id', chatController.deleteMessage);
router.post('/upload', upload.single('file'), chatController.uploadAttachment);

module.exports = router;
