import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import Chat from '../models/chatModel.js';

// @desc    Send message
// @route   POST /api/message
// @access  Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  // Create new message object
  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // Create the message
    let message = await Message.create(newMessage);

    // Populate the message with sender and chat details
    message = await Message.findById(message._id)
      .populate("sender", "name picture")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "name picture email",
        },
      });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name picture email")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "name picture email",
        },
      })
      .sort({ createdAt: 1 }); // Sort by creation time (oldest first)

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { sendMessage, allMessages };