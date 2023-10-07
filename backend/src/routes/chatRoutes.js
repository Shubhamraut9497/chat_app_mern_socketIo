import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup } from '../controllers/chatController.js';

const router = express.Router();

// Access an individual chat (POST request)
router.post("/", protect, accessChat);

// Fetch all chats (GET request)
router.get("/", protect, fetchChats);

// Create a group chat (POST request)
router.post("/group", protect, createGroupChat);

// Rename a group chat (PUT request)
router.put("/rename", protect, renameGroup);

// Remove a user from a group chat (PUT request)
router.put("/groupremove", protect, removeFromGroup);

// Add a user to a group chat (PUT request)
router.put("/groupadd", protect, addToGroup);

export default router;

