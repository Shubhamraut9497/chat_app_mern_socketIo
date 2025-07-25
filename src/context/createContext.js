import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const chatContext = createContext();

const ChatProvider = ({ children }) => {
  const history = useHistory();
  const [user, setUser] = useState();
  const [selectedChats, setSelectedChats] = useState();
  const [chats, setChats] = useState([]);
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) {
      history.push("/");
    }
  }, [history]);
  return (
    <chatContext.Provider value={{ user, setUser, selectedChats, setSelectedChats, chats, setChats }}>
      {children}
    </chatContext.Provider>
  );
};
export const ChatState = () => {
  return useContext(chatContext);
};
export default ChatProvider;
