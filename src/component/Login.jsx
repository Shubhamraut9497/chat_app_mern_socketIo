import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const toast = useToast();
   const apiUrl = process.env.REACT_APP_API_URL;
   const history = useHistory();

  const handleSubmit = async(e) => {
     e.preventDefault();
     setLoading(true);
     if ( !email || !password) {
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
       const  response  = await axios.post(
         `${apiUrl}/api/user/login`,
         { email, password, },
         config
       );
       toast({
         title: "Registration Successfull",
         status: "success",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });
       localStorage.setItem("userInfo", JSON.stringify(response.data));
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
            type={"password"}
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="cyan"
        width="100%"
        style={{ marginTop: "15px" }}
        onClick={handleSubmit}
      >
        Login
      </Button>
      <Button
      variant={"solid"}
        colorScheme="red"
        width="100%"
        style={{ marginTop: "15px" }}
        onClick={()=>{
          setEmail("guest@gmail.com");
          setPassword("guest123");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
}

export default Login;
