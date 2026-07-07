const express = require('express');
const aiChatController = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', aiChatController.getConversations);
router.post('/conversations', aiChatController.createConversation);
router.get('/conversations/search', aiChatController.searchConversations);
router.get('/conversations/:id', aiChatController.getConversation);
router.patch('/conversations/:id', aiChatController.updateConversation);
router.delete('/conversations/:id', aiChatController.deleteConversation);
router.get('/conversations/:id/messages', aiChatController.getMessages);
router.post('/conversations/:id/messages', aiChatController.sendMessage);

module.exports = router;
