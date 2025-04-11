import { EmailSignatureProps } from '@/components/general/emails/EmailSignature';
import { env } from '@/env.mjs';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SessionStartedEmailProps {
  studentName: string;
  courseName: string;
  sessionTitle: string;
  zoomJoinLink: string;
  materialLink: string;
}

export const SessionStartedEmail = ({
  studentName,
  courseName,
  sessionTitle,
  zoomJoinLink,
  materialLink,
  logoUrl,
  brandName1,
  brandName2,
}: SessionStartedEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your session for {courseName} has started – join now!</Preview>
      <Container style={container}>
        <Img
          src={logoUrl}
          width="120"
          height="120"
          alt="Logo"
          style={logo}
        />

        <Text style={paragraph}>Hey {studentName},</Text>

        <Text style={paragraph}>
          Your session <strong>{sessionTitle}</strong> for <strong>{courseName}</strong> has just started. You can join the live Zoom session now using the button below:
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={zoomJoinLink}>
            Join Zoom Session
          </Button>
        </Section>

        <Text style={paragraph}>
          📘 You can also access or download the material for this session below:
        </Text>

        <Section style={btnContainer}>
          <Button style={{ ...button, backgroundColor: '#1E90FF' }} href={materialLink}>
            View Session Material
          </Button>
        </Section>

        <Text style={paragraph}>
          If you face any issues, please reach out to your instructor or support team.
        </Text>

        <Text style={paragraph}>
          Best wishes,<br />
          The {brandName1.toUpperCase()} {brandName2.toUpperCase()} Team
        </Text>

        <Hr style={hr} />
        <Text style={footer}>{env.NEXTAUTH_URL}</Text>
      </Container>
    </Body>
  </Html>
);

export default SessionStartedEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo = {
  margin: '0 auto',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '20px',
};

const button = {
  backgroundColor: '#FF6200',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};
