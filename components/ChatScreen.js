import styled from "styled-components";
import { Avatar, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import Message from "./Message";
import { useRef, useState, useEffect } from "react";
import authService from "../utils/auth";
import db from "../utils/db";
import moment from "moment";

function ChatScreen({ chatId }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [chat, setChat] = useState(null);
  const endOfMessagesRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (chatId && user) {
        // Load chat
        const chatData = await db.getChatById(parseInt(chatId));
        setChat(chatData);

        if (chatData) {
          // Get other user
          const otherUserId = chatData.participants.find(id => id !== user.id);
          const allUsers = await db.getAllUsers();
          const other = allUsers.find(u => u.id === otherUserId);
          setOtherUser(other);

          // Load messages
          loadMessages();

          // Mark messages as read
          await db.markMessagesAsRead(parseInt(chatId), user.id);
        }
      }
    };

    loadData();

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      if (chatId) {
        loadMessages();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async () => {
    if (chatId) {
      const msgs = await db.getMessagesByChatId(parseInt(chatId));
      setMessages(msgs);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    try {
      await db.sendMessage(parseInt(chatId), currentUser.id, input.trim());
      setInput("");
      await loadMessages();
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const goBack = () => {
    router.push("/");
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "غير متاح";
    const time = moment(lastSeen);
    const now = moment();
    
    if (now.diff(time, 'minutes') < 1) {
      return 'متصل الآن';
    } else if (now.diff(time, 'hours') < 1) {
      return `منذ ${now.diff(time, 'minutes')} دقيقة`;
    } else if (now.diff(time, 'days') < 1) {
      return `منذ ${now.diff(time, 'hours')} ساعة`;
    } else {
      return time.format('DD/MM/YYYY');
    }
  };

  if (!currentUser || !otherUser) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={goBack}>
          <ArrowBackIcon />
        </BackButton>
        
        <Avatar src={otherUser.photoURL} alt={otherUser.username} />

        <HeaderInformation>
          <h3>{otherUser.username}</h3>
          <p>آخر ظهور: {formatLastSeen(otherUser.lastSeen)}</p>
        </HeaderInformation>
        
        <HeaderIcons>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </HeaderIcons>
      </Header>

      <MessageContainer>
        {messages.length === 0 ? (
          <EmptyMessages>
            لا توجد رسائل بعد. ابدأ المحادثة!
          </EmptyMessages>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUser.id}
            />
          ))
        )}
        <EndOfMessage ref={endOfMessagesRef} />
      </MessageContainer>

      <InputContainer onSubmit={sendMessage}>
        <IconButton type="button">
          <InsertEmoticonIcon />
        </IconButton>
        
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالة..."
        />
        
        <IconButton type="submit" disabled={!input.trim()}>
          <SendIcon style={{ color: input.trim() ? '#25d366' : '#8696a0' }} />
        </IconButton>
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;

  @media (max-width: 768px) {
    height: 100vh;
  }
`;

const Header = styled.div`
  position: sticky;
  background-color: #f0f2f5;
  z-index: 100;
  top: 0;
  display: flex;
  padding: 11px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid whitesmoke;

  @media (max-width: 768px) {
    height: 70px;
    padding: 10px;
  }
`;

const BackButton = styled(IconButton)`
  &&& {
    margin-right: 10px;
    
    @media (min-width: 769px) {
      display: none;
    }
  }
`;

const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;

  > h3 {
    margin-bottom: 3px;
    font-size: 16px;

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }

  > p {
    font-size: 13px;
    color: #667781;

    @media (max-width: 768px) {
      font-size: 12px;
    }
  }
`;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
  flex: 1;
  padding: 30px;
  background-color: #e5ded8;
  background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
  overflow-y: auto;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const EmptyMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #667781;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const EndOfMessage = styled.div`
  margin-bottom: 50px;
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: #f0f2f5;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const Input = styled.input`
  flex: 1;
  outline: 0;
  border: none;
  border-radius: 20px;
  background-color: white;
  padding: 12px 20px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 15px;

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 14px;
  }
`;
