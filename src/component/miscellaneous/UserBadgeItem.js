import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button } from "@chakra-ui/react";
import React from "react";

function UserBadgeItem({ user, handleFunction }) {
  return (
    <Button
      px={2}
      py={1}
      borderRadius={"lg"}
      m={1}
      mb={2}
      variant="solid"
      colorScheme={"facebook"}
      cursor="pointer"
      onClick={handleFunction}
    >
        {user.name}
        <CloseIcon pl={1}/>
    </Button>
  );
}

export default UserBadgeItem;
