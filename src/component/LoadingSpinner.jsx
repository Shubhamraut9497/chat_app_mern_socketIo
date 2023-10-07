import React from "react";
import { Spinner, Flex } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

function LoadingSpinner() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minH="100vh" // Set a minimum height to fill the viewport
    >
      <Spinner size="xl" color="teal.500" />
    </Box>
  );
}

export default LoadingSpinner;
