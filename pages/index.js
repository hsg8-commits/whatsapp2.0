import Head from "next/head";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <Container>
      <Head>
        <title>WhatsApp Web</title>
        <meta name="description" content="WhatsApp Web Clone" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MainContainer>
        <Sidebar />
        <WelcomeContainer>
          <WelcomeContent>
            <WelcomeLogo 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2042px-WhatsApp.svg.png"
              alt="WhatsApp Logo"
            />
            <WelcomeTitle>WhatsApp Web</WelcomeTitle>
            <WelcomeText>
              ابدأ محادثة جديدة أو اختر محادثة موجودة من القائمة
            </WelcomeText>
          </WelcomeContent>
        </WelcomeContainer>
      </MainContainer>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  overflow: hidden;
`;

const MainContainer = styled.div`
  display: flex;
  height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const WelcomeContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 6px solid #25d366;

  @media (max-width: 768px) {
    display: none;
  }
`;

const WelcomeContent = styled.div`
  text-align: center;
  padding: 40px;
`;

const WelcomeLogo = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 30px;
  opacity: 0.8;
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  color: #41525d;
  margin-bottom: 20px;
  font-weight: 300;
`;

const WelcomeText = styled.p`
  font-size: 16px;
  color: #667781;
  line-height: 1.6;
  max-width: 450px;
  margin: 0 auto;
`;
