import { Box, Text } from "@chakra-ui/layout";
import React, { useEffect, useState } from "react";
import { Button } from "@chakra-ui/button";
import { FaSearch } from "react-icons/fa";
import {
  Menu,
  MenuList,
  MenuButton,
  Tooltip,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast,
  Input,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/createContext";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../userAvatar/UserListItem";

function SideDrawer() {
  const { user, setSelectedChats, chats, setChats } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter Something In Search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      };
      const { data } = await axios.get(
        `${apiUrl}/api/user?search=${search}`,
        config
      );
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
  };
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.post(`${apiUrl}/api/chat`, {userId}, config);
      if (!chats.find((c) => c._id === response.data._id))
        setChats([response.data, ...chats]);
      setSelectedChats(response.data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip
          label="Search for user to chat"
          hasArrow
          placement="bottom-end"
        >
          <Button variant="ghost">
            <FaSearch />
            <Text d={{ base: "none", md: "flex" }} px={4} onClick={onOpen}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work-sans">
          Saarthi-Chat
        </Text>
        <div>
          <Menu>
            <Tooltip label="notifications" hasArrow placeholder="top-end">
              <MenuButton p={1}>
                <BellIcon fontSize="2xl" m="1" />
              </MenuButton>
            </Tooltip>
            {/* <MenuList></MenuList> */}
          </Menu>
          <Menu>
            <Tooltip label="profile" hasArrow placeholder="top-end">
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user.name}
                  src={user.picture}
                />
              </MenuButton>
            </Tooltip>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Search Users</DrawerHeader>

            <DrawerBody>
              <Box display="flex" pb={2}>
                <Input
                  placeholder="Search by Name or Email..."
                  mr={2}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </Box>
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult.map((result) => (
                  <UserListItem
                    key={result._id}
                    user={result}
                    handleFunction={() => accessChat(result._id)}
                  />
                ))
              )}
              {loadingChat && <Spinner ml={"auto"} display={"flex"}/>}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
}

export default SideDrawer;
