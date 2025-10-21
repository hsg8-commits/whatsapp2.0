import { Avatar } from "@mui/material";
import { useRouter } from "next/router";
import styled from "styled-components";
import moment from "moment";

function Chat({ id, otherUser, lastMessage, lastMessageTime }) {
  const router = useRouter();

  const enterChat = () => {
    router.push(`/chat/${id}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const messageTime = moment(timestamp);
    const now = moment();
    
    if (now.diff(messageTime, 'days') === 0) {
      return messageTime.format('HH:mm');
    } else if (now.diff(messageTime, 'days') === 1) {
      return 'أمس';
    } else if (now.diff(messageTime, 'days') < 7) {
      return messageTime.format('dddd');
    } else {
      return messageTime.format('DD/MM/YYYY');
    }
  };

  return (
    <Container onClick={enterChat}>
      <UserAvatar src={otherUser?.photoURL} alt={otherUser?.username}>
        {otherUser?.username?.[0]?.toUpperCase()}
      </UserAvatar>
      <ChatInfo>
        <ChatName>{otherUser?.username || 'مستخدم'}</ChatName>
        {lastMessage && (
          <LastMessage>{lastMessage}</LastMessage>
        )}
      </ChatInfo>
      {lastMessageTime && (
        <TimeStamp>{formatTime(lastMessageTime)}</TimeStamp>
      )}
    </Container>
  );
}

export default Chat;

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-word;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s;

  :hover {
    background-color: #f5f6f6;
  }

  @media (max-width: 768px) {
    padding: 12px 10px;
  }
`;

const UserAvatar = styled(Avatar)`
  margin-right: 15px;

  @media (max-width: 768px) {
    margin-right: 10px;
  }
`;

const ChatInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ChatName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-bottom: 3px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: #667781;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const TimeStamp = styled.div`
  font-size: 12px;
  color: #667781;
  margin-left: 10px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;
