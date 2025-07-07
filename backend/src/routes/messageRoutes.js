import express from 'express';
import protect  from '../middleware/authMiddleware.js';
import { sendMessage, allMessages } from '../controllers/messageController.js';

const router = express.Router();

// Route to send a message
router.route('/').post(protect, sendMessage);

// Route to get all messages for a chat
router.route('/:chatId').get(protect, allMessages);

export default router;