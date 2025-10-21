import { useState } from "react";
import styled from "styled-components";
import Head from "next/head";
import { useRouter } from "next/router";
import authService from "../utils/auth";

function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const whatsappLogo =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2042px-WhatsApp.svg.png";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("كلمة السر غير متطابقة");
      return;
    }

    if (username.length < 3) {
      setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
      return;
    }

    if (password.length < 6) {
      setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register(username, password);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <Container>
      <Head>
        <title>إنشاء حساب جديد - WhatsApp</title>
      </Head>

      <RegisterContainer>
        <Logo src={whatsappLogo} alt="WhatsApp Logo" />
        <Title>WhatsApp Web</Title>
        <Subtitle>إنشاء حساب جديد</Subtitle>

        <Form onSubmit={handleRegister}>
          <InputGroup>
            <Label>اسم المستخدم</Label>
            <Input
              type="text"
              placeholder="أدخل اسم المستخدم (3 أحرف على الأقل)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              minLength={3}
            />
            <Helper>سيستخدم هذا الاسم للبحث عنك والتواصل معك</Helper>
          </InputGroup>

          <InputGroup>
            <Label>كلمة السر</Label>
            <Input
              type="password"
              placeholder="أدخل كلمة السر (6 أحرف على الأقل)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </InputGroup>

          <InputGroup>
            <Label>تأكيد كلمة السر</Label>
            <Input
              type="password"
              placeholder="أعد إدخال كلمة السر"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <RegisterButton type="submit" disabled={loading}>
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </RegisterButton>
        </Form>

        <Divider>أو</Divider>

        <LoginLink onClick={goToLogin}>
          لديك حساب بالفعل؟ <Strong>سجل دخول</Strong>
        </LoginLink>
      </RegisterContainer>
    </Container>
  );
}

export default Register;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #00a884 0%, #25d366 100%);
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const RegisterContainer = styled.div`
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;

  @media (max-width: 768px) {
    padding: 30px 20px;
    border-radius: 10px;
  }
`;

const Logo = styled.img`
  height: 100px;
  width: 100px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    height: 80px;
    width: 80px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: #25d366;
  margin-bottom: 10px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #667781;
  margin-bottom: 30px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  width: 100%;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;

  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #3b4a54;
  font-size: 14px;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 2px solid #e9edef;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #25d366;
  }

  &:disabled {
    background-color: #f0f2f5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const Helper = styled.small`
  display: block;
  margin-top: 5px;
  color: #667781;
  font-size: 12px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #25d366;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #20bd5a;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #a0d5b8;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 15px;
  }
`;

const Divider = styled.div`
  width: 100%;
  text-align: center;
  margin: 25px 0;
  color: #667781;
  font-size: 14px;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background-color: #e9edef;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  @media (max-width: 768px) {
    margin: 20px 0;
    font-size: 13px;
  }
`;

const LoginLink = styled.div`
  color: #667781;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #25d366;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Strong = styled.span`
  color: #25d366;
  font-weight: 600;
`;
