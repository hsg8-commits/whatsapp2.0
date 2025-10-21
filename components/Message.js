import styled from "styled-components";
import moment from "moment";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";

function Message({ message, isOwnMessage }) {
  const formatTime = (timestamp) => {
    return moment(timestamp).format("HH:mm");
  };

  return (
    <Container isOwnMessage={isOwnMessage}>
      <MessageBubble isOwnMessage={isOwnMessage}>
        <MessageText>{message.message}</MessageText>
        <MessageFooter>
          <TimeStamp>{formatTime(message.timestamp)}</TimeStamp>
          {isOwnMessage && (
            <ReadStatus read={message.read}>
              {message.read ? <DoneAllIcon /> : <DoneIcon />}
            </ReadStatus>
          )}
        </MessageFooter>
      </MessageBubble>
    </Container>
  );
}

export default Message;

const Container = styled.div`
  display: flex;
  justify-content: ${props => props.isOwnMessage ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
  padding: 0 5px;

  @media (max-width: 768px) {
    margin-bottom: 6px;
    padding: 0 2px;
  }
`;

const MessageBubble = styled.div`
  position: relative;
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${props => props.isOwnMessage ? '#d9fdd3' : '#ffffff'};
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  word-wrap: break-word;

  ${props => props.isOwnMessage ? `
    border-top-right-radius: 0;
  ` : `
    border-top-left-radius: 0;
  `}

  @media (max-width: 768px) {
    max-width: 75%;
    padding: 7px 10px;
  }
`;

const MessageText = styled.p`
  font-size: 14px;
  color: #303030;
  margin: 0;
  margin-bottom: 5px;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const MessageFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
`;

const TimeStamp = styled.span`
  font-size: 11px;
  color: #667781;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const ReadStatus = styled.span`
  display: flex;
  align-items: center;
  
  svg {
    font-size: 16px;
    color: ${props => props.read ? '#53bdeb' : '#667781'};
    
    @media (max-width: 768px) {
      font-size: 14px;
    }
  }
`;
