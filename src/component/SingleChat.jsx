import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { ChatState } from "../context/createContext";

function SingleChat({ fetchAgain, setFetchAgain }) {
  const { user, selectedChats, setSelectedChats } = ChatState();
  return (
    <>
      {selectedChats ? (
        <>
        <Text
        fontSize={{base:"28px",md:"30px"}}
        pb={3}
        px={2}
        w="100%"
        fontFamily={"Work sans"}
        display={"flex"}
        justifyContent={{base:"space-between"}}
        alignItems={"center"}
        >

        </Text>
        </>
      ) : (
        <Box
          display={"flex"}
          justifyContent="center"
          alignItems={"center"}
          h={"100%"}
        >
          <Text fontSize="3xl" pb={3} fontFamily={"Work sans"}>
            Click on a user to Chat
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
