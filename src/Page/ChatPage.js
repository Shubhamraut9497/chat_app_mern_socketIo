import React, { useContext, useEffect, useState } from "react";
import { ChatState } from "../context/createContext";
import SideDrawer from "../component/miscellaneous/SideDrawer";
import { Box } from "@chakra-ui/react";
import MyChat from "../component/MyChat";
import ChatBox from "../component/ChatBox";

function ChatPage() {
  const { user } = ChatState(); // Use the useContext hook to access user data
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && (
          <MyChat fetchAgain={fetchAgain} />
        )}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
}

export default ChatPage;
