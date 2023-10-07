import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { useHistory} from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [picture, setPicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const toast = useToast();
  const apiUrl = process.env.REACT_APP_API_URL;
  const history = useHistory();

  const handleShow = () => setShow(!show);
  const postDetails = (pic) => {
    setLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please Select and image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pic.type === "image/jpeg" || pic.type === "image/png") {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "chat_application_mern");
      data.append("cloud_name", "dvbhnjlvx");
      fetch("https://api.cloudinary.com/v1_1/dvbhnjlvx/image/upload", {
        method: "POST",
        body: data,
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setPicture(data.url.toString());
          console.log(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select and image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  };

  const handleSubmit = (e) => {
    setLoading(true);
    if (!name || !email || !password) {
      toast({
        title: "Please Submit all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const response  = axios.post(
        `${apiUrl}/api/user`,
        { name, email, password, picture },
        config
      )
         toast({
           title: "Login Successful",
           status: "success",
           duration: 5000,
           isClosable: true,
           position: "bottom",
         });

         // Store the user info in localStorage
         localStorage.setItem("userInfo", JSON.stringify(response));
         setLoading(false);
         history.push("/chats");
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err.response.data.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <VStack spacing={"5px"}>
      <FormControl id="first_name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            {password && (
              <Button h="1.725rem" size="sm" onClick={handleShow}>
                {show ? "hide" : "show"}
              </Button>
            )}
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="picture">
        <FormLabel>Upload Your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="cyan"
        width="100%"
        style={{ marginTop: "15px" }}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default Signup;
