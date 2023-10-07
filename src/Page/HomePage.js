import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import React from "react";
import Login from "../component/Login";
import Signup from "../component/Signup";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

function HomePage() {
  const history = useHistory();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      history.push("/chats");
    }
  }, [history]);
  
  return (
    <Container maxW="xl" centerContent textAlign="center">
      <Box
        d={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        p={"3"}
        bg={"white"}
        width="100%"
        m="40px 0px 15px 0px"
        borderRadius={"lg"}
        borderWidth={"1px"}
        bgGradient="linear(to-l, #7928CA, #FF0080)"
      >
        <Text
          fontSize={"4xl"}
          fontFamily={"work sans"}
          color={"white"}
          fontWeight={"700"}
        >
          Saarthi-Chat
        </Text>
      </Box>
      <Box bg="white" borderRadius={"lg"} borderWidth={"1px"} p={4} w={"100%"}>
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList>
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default HomePage;
