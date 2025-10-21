import styled from "styled-components";
import { Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import authService from "../utils/auth";
import db from "../utils/db";
import Chat from "./Chat";

function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadChats(currentUser.id);
      }
    };
    loadUser();
  }, []);

  const loadChats = async (userId) => {
    try {
      const userChats = await db.getChatsByUserId(userId);
      
      // Load participant details for each chat
      const chatsWithUsers = await Promise.all(
        userChats.map(async (chat) => {
          const otherUserId = chat.participants.find(id => id !== userId);
          const otherUser = await getUserById(otherUserId);
          return {
            ...chat,
            otherUser: otherUser
          };
        })
      );
      
      setChats(chatsWithUsers);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const getUserById = async (userId) => {
    try {
      const allUsers = await db.getAllUsers();
      return allUsers.find(u => u.id === userId);
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  const handleCreateChat = async () => {
    setOpenDialog(true);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = await db.searchUsers(query);
      // Filter out current user
      const filtered = results.filter(u => u.id !== user.id);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    setSelectedUser(selectedUser);
    
    // Check if chat already exists
    const existingChat = await db.chatExists(user.id, selectedUser.id);
    
    if (existingChat) {
      // Navigate to existing chat
      router.push(`/chat/${existingChat.id}`);
      setOpenDialog(false);
    } else {
      // Create new chat
      const newChat = await db.createChat(user.id, selectedUser.id);
      router.push(`/chat/${newChat.id}`);
      setOpenDialog(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
  };

  if (!user) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Header>
        <UserAvatar src={user.photoURL} alt={user.username} />
        
        <UserInfo>
          <Username>{user.username}</Username>
        </UserInfo>

        <IconsContainer>
          <IconButton onClick={handleCreateChat}>
            <ChatIcon />
          </IconButton>

          <IconButton onClick={handleLogout} title="تسجيل خروج">
            <LogoutIcon />
          </IconButton>
        </IconsContainer>
      </Header>

      <SearchContainer>
        <SearchIcon />
        <SearchInput 
          placeholder="ابحث في المحادثات" 
          value={searchQuery}
          onChange={(e) => handleSearchUsers(e.target.value)}
        />
      </SearchContainer>

      <SidebarButton onClick={handleCreateChat}>بدء محادثة جديدة</SidebarButton>

      <ChatsContainer>
        {chats.length === 0 ? (
          <EmptyState>لا توجد محادثات بعد. ابدأ محادثة جديدة!</EmptyState>
        ) : (
          chats.map((chat) => (
            <Chat 
              key={chat.id} 
              id={chat.id} 
              otherUser={chat.otherUser}
              lastMessage={chat.lastMessage}
              lastMessageTime={chat.lastMessageTime}
            />
          ))
        )}
      </ChatsContainer>

      {/* Search Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>ابحث عن مستخدم</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="اسم المستخدم"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={(e) => handleSearchUsers(e.target.value)}
            placeholder="ابحث باسم المستخدم..."
          />
          
          <SearchResultsContainer>
            {searchResults.length === 0 && searchQuery.trim().length > 0 && (
              <NoResults>لا توجد نتائج</NoResults>
            )}
            
            {searchResults.map((result) => (
              <UserResult key={result.id} onClick={() => handleSelectUser(result)}>
                <Avatar src={result.photoURL} alt={result.username} />
                <UserResultInfo>
                  <UserResultName>{result.username}</UserResultName>
                </UserResultInfo>
              </UserResult>
            ))}
          </SearchResultsContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Sidebar;

const Container = styled.div`
  flex: 0.45;
  border-right: 1px solid whitesmoke;
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  background-color: white;

  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 768px) {
    flex: 1;
    max-width: 100%;
    min-width: 100%;
    border-right: none;
  }
`;

const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  background-color: #f0f2f5;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;

  @media (max-width: 768px) {
    padding: 10px;
    height: 70px;
  }
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 15px;
  
  @media (max-width: 768px) {
    margin-left: 10px;
  }
`;

const Username = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f0f2f5;
  border-bottom: 1px solid whitesmoke;

  @media (max-width: 768px) {
    padding: 8px 10px;
  }
`;

const SearchInput = styled.input`
  outline-width: 0;
  border: none;
  flex: 1;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  margin-left: 10px;

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 14px;
  }
`;

const SidebarButton = styled(Button)`
  width: 100%;

  &&& {
    border-top: 1px solid whitesmoke;
    border-bottom: 1px solid whitesmoke;
    color: #25d366;
    padding: 12px;
    font-weight: 500;

    @media (max-width: 768px) {
      padding: 10px;
      font-size: 14px;
    }
  }
`;

const ChatsContainer = styled.div`
  @media (max-width: 768px) {
    padding-bottom: 20px;
  }
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #667781;
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 30px 15px;
    font-size: 13px;
  }
`;

const SearchResultsContainer = styled.div`
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const UserResult = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f2f5;
  }
`;

const UserResultInfo = styled.div`
  margin-left: 15px;
`;

const UserResultName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #667781;
  font-size: 14px;
`;
