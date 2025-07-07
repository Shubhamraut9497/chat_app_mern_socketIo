import { 
  Box, 
  Text, 
  Input, 
  Button, 
  VStack, 
  HStack, 
  Avatar, 
  IconButton, 
  useToast,
  Spinner,
  Flex,
  Divider
} from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { IoSend } from "react-icons/io5";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChatState } from "../context/createContext";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:4500";
let socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const { user, selectedChats, setSelectedChats } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Get the other user's info (for group chats, you might need different logic)
  const getSender = (users) => {
    return users[0]._id === user._id ? users[1] : users[0];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO setup
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch messages when selectedChats changes
  useEffect(() => {
    if (selectedChats) {
      fetchMessages();
      selectedChatCompare = selectedChats;
    }
  }, [selectedChats]);

  // Listen for new messages
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Give notification
        toast({
          title: "New Message",
          description: `${newMessageReceived.sender.name}: ${newMessageReceived.content}`,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const fetchMessages = async () => {
    if (!selectedChats) return;

    try {
      setMessagesLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `${apiUrl}/api/message/${selectedChats._id}`,
        config
      );

      setMessages(data);
      setMessagesLoading(false);
      
      // Join the chat room
      socket.emit("join chat", selectedChats._id);
    } catch (error) {
      toast({
        title: "Error fetching messages",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage.trim()) {
      event.preventDefault();
      socket.emit("stop typing", selectedChats._id);
      await handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    socket.emit("stop typing", selectedChats._id);
    
    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${apiUrl}/api/message`,
        {
          content: newMessage,
          chatId: selectedChats._id,
        },
        config
      );

      setNewMessage("");
      
      // Emit the new message to socket
      socket.emit("new message", data);
      
      setMessages([...messages, data]);
      setLoading(false);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "Error sending message",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChats._id);
    }
    
    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChats._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  const isSameSenderMargin = (messages, m, i, userId) => {
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    )
      return 33;
    else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
      return 0;
    else return "auto";
  };

  const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };

  return (
    <>
      {selectedChats ? (
        <Box display="flex" flexDirection="column" h="100%" w="100%">
          {/* Chat Header */}
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={4}
            w="100%"
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            bg="white"
            borderBottomWidth="1px"
            borderBottomColor="gray.200"
          >
            <HStack spacing={3}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChats("")}
                variant="ghost"
              />
              <Avatar
                size="sm"
                name={
                  selectedChats.isGroupChat
                    ? selectedChats.chatName
                    : getSender(selectedChats.users).name
                }
                src={
                  selectedChats.isGroupChat
                    ? ""
                    : getSender(selectedChats.users).picture
                }
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  {selectedChats.isGroupChat
                    ? selectedChats.chatName.toUpperCase()
                    : getSender(selectedChats.users).name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {selectedChats.isGroupChat
                    ? `${selectedChats.users.length} members`
                    : isTyping ? "Typing..." : "Active now"}
                </Text>
              </VStack>
            </HStack>
            <IconButton
              icon={<AttachmentIcon />}
              variant="ghost"
              onClick={() => toast({ title: "Feature coming soon!", status: "info" })}
            />
          </Box>

          {/* Messages Area */}
          <Box
            flex="1"
            overflowY="auto"
            p={3}
            bg="gray.50"
            position="relative"
          >
            {messagesLoading ? (
              <Flex justify="center" align="center" h="100%">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <VStack spacing={1} align="stretch">
                {messages &&
                  messages.map((m, i) => (
                    <Flex
                      key={m._id}
                      justify={m.sender._id === user._id ? "flex-end" : "flex-start"}
                      align="flex-end"
                      mb={isSameUser(messages, m, i) ? 1 : 3}
                    >
                      {(isSameSender(messages, m, i, user._id) ||
                        isLastMessage(messages, i, user._id)) && (
                        <Avatar
                          size="xs"
                          name={m.sender.name}
                          src={m.sender.picture}
                          mr={1}
                        />
                      )}
                      <Box
                        bg={m.sender._id === user._id ? "blue.500" : "white"}
                        color={m.sender._id === user._id ? "white" : "black"}
                        borderRadius="lg"
                        px={3}
                        py={2}
                        maxW="70%"
                        ml={isSameSenderMargin(messages, m, i, user._id)}
                        boxShadow="sm"
                        position="relative"
                      >
                        <Text fontSize="sm">{m.content}</Text>
                        <Text
                          fontSize="xs"
                          color={m.sender._id === user._id ? "blue.100" : "gray.500"}
                          mt={1}
                        >
                          {formatTime(m.createdAt)}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                <div ref={messagesEndRef} />
              </VStack>
            )}
          </Box>

          {/* Message Input */}
          <Box p={3} bg="white" borderTopWidth="1px" borderTopColor="gray.200">
            <HStack spacing={2}>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
                bg="gray.50"
                border="none"
                borderRadius="full"
                _focus={{
                  bg: "white",
                  boxShadow: "outline",
                }}
                flex="1"
              />
              <IconButton
                icon={<IoSend />}
                onClick={handleSendMessage}
                isLoading={loading}
                colorScheme="blue"
                borderRadius="full"
                isDisabled={!newMessage.trim()}
              />
            </HStack>
          </Box>
        </Box>
      ) : (
        <Box
          display={"flex"}
          justifyContent="center"
          alignItems={"center"}
          h={"100%"}
          flexDirection="column"
        >
          <Text fontSize="3xl" pb={3} fontFamily={"Work sans"} color="gray.500">
            Click on a user to start chatting
          </Text>
          <Text fontSize="lg" color="gray.400">
            Select a conversation to view messages
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;