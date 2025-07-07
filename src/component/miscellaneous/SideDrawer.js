import { Box, Text } from "@chakra-ui/layout";
import React, { useEffect, useState, useCallback } from "react";
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
  InputGroup,
  InputLeftElement,
  VStack,
  Divider,
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
  const [searchTimeout, setSearchTimeout] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const toast = useToast();

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setSearchResult([]);
        setLoading(false);
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
          `${apiUrl}/api/user?search=${searchTerm}`,
          config
        );
        
        console.log("search data", data);
        setSearchResult(data);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error Occurred",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        setLoading(false);
      }
    },
    [apiUrl, user.token, toast]
  );

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      debouncedSearch(value);
    }, 300); // 300ms delay

    setSearchTimeout(newTimeout);
  };

  // Clear search results when drawer closes
  const handleDrawerClose = () => {
    setSearch("");
    setSearchResult([]);
    setLoading(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    onClose();
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
      const response = await axios.post(`${apiUrl}/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === response.data._id))
        setChats([response.data, ...chats]);
      setSelectedChats(response.data);
      setLoadingChat(false);
      handleDrawerClose();
    } catch (error) {
      toast({
        title: "Error fetching the chats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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
          <Button variant="ghost" onClick={onOpen}>
            <FaSearch />
            <Text d={{ base: "none", md: "flex" }} px={4}>
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
          onClose={handleDrawerClose}
          finalFocusRef={btnRef}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <Text fontSize="lg" fontWeight="bold">
                Search Users
              </Text>
            </DrawerHeader>

            <DrawerBody p={0}>
              <Box p={4} borderBottomWidth="1px" bg="gray.50">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={handleSearchChange}
                    bg="white"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px #63b3ed",
                    }}
                  />
                </InputGroup>
              </Box>

              <Box flex="1" overflowY="auto">
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                    <Spinner size="lg" color="blue.500" />
                    <Text ml={3} color="gray.600">
                      Searching users...
                    </Text>
                  </Box>
                ) : search && searchResult.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500" fontSize="md">
                      {search.trim() ? "No users found" : "Start typing to search users"}
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {searchResult.map((result, index) => (
                      <Box key={result._id}>
                        <UserListItem
                          user={result}
                          handleFunction={() => accessChat(result._id)}
                        />
                        {index < searchResult.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </VStack>
                )}

                {loadingChat && (
                  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                    <Spinner size="md" color="blue.500" />
                    <Text ml={3} color="gray.600">
                      Creating chat...
                    </Text>
                  </Box>
                )}
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
}

export default SideDrawer;