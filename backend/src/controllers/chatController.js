import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import User from "../models/user.js";

export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User Id Params not send with request");
    return res.sendStatus(400);
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});
export const fetchChats = asyncHandler(async (req, res) => {
  try {
    await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(400).send(err.message);
      });
  } catch (err) {
    res.status(400).send(err.message);
  }
});
export const createGroupChat = asyncHandler(async (req, res) => {
  const users = req.body.users; // Assuming users is a JSON string
  const name = req.body.name;

  if (!users || !name) {
    return res.status(400).send("Please fill all required fields");
  }

  // Parse the JSON string into an array
  const usersArray = JSON.parse(users);

  if (!Array.isArray(usersArray) || usersArray.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group");
  }

  // Push the current user into the users array
  usersArray.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: usersArray, // Use the parsed array
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({
      _id: groupChat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

export const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedName = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "=password");
  if (!updatedName) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.json(updatedName);
  }
});
export const addToGroup = asyncHandler(async (req, res) => {
    const {chatId,userId}=req.body;
    const added=await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId}
        },
        {
            new:true,
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password");
    if(!added){
        res.status(400);
        throw new Error("Group Chat Not Found");
    }else{
        res.status(200).json(added);
    }
});
export const removeFromGroup = asyncHandler(async (req, res) => {
      const { chatId, userId } = req.body;
      const remove = await Chat.findByIdAndUpdate(
        chatId,
        {
          $pull: { users: userId },
        },
        {
          new: true,
        }
      )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      if (!remove) {
        res.status(400);
        throw new Error("Group Chat Not Found");
      } else {
        res.status(200).json(remove);
      }
});

