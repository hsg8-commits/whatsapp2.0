import Head from "next/head";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import ChatScreen from "../../components/ChatScreen";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

function Chat() {
  const router = useRouter();
  const { id } = router.query;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Container>
      <Head>
        <title>محادثة - WhatsApp</title>
      </Head>
      
      {!isMobile && <Sidebar />}
      
      <ChatContainer>
        <ChatScreen chatId={id} />
      </ChatContainer>
    </Container>
  );
}

export default Chat;

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow: hidden;
  height: 100vh;

  @media (max-width: 768px) {
    width: 100%;
  }
`;
