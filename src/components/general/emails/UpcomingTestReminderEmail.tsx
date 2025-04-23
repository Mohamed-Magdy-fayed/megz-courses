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

interface UpcomingTestReminderEmailProps {
  studentName: string;
  courseName: string;
  sessionDate: string;
  zoomJoinLink: string;
  quizLink: string;
}

export const UpcomingTestReminderEmail = ({
  studentName,
  courseName,
  sessionDate,
  zoomJoinLink,
  quizLink,
  logoUrl,
  brandName1,
  brandName2,
}: UpcomingTestReminderEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your upcoming test for {courseName} is starting soon!</Preview>
      <Container style={container}>
        <Img
          src={logoUrl}
          width="120"
          height="120"
          alt="Logo"
          style={logo}
        />

        <Text style={paragraph}>Hello {studentName},</Text>

        <Text style={paragraph}>
          This is a friendly reminder that your test for <strong>{courseName}</strong> course is starting soon on:
        </Text>

        <Text style={paragraph}>
          📅 <strong>Time:</strong> {sessionDate}
        </Text>

        <Text style={paragraph}>
          Please join the Zoom meeting using the button below at the scheduled time:
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={zoomJoinLink}>
            Join Zoom Session
          </Button>
        </Section>

        <Text style={paragraph}>
          ✍️ Before the test begins, please complete this short quiz to help prepare:
        </Text>
        <Section style={btnContainer}>
          <Button style={{ ...button, backgroundColor: '#0A7CFF' }} href={quizLink}>
            Take Pre-Session Quiz
          </Button>
        </Section>

        <Text style={paragraph}>
          Make sure you're ready ahead of time by checking your internet and having Zoom installed.
        </Text>

        <Text style={paragraph}>
          We look forward to seeing you in class!
        </Text>

        <Text style={paragraph}>
          Best regards,<br />
          The {brandName1.toUpperCase()} {brandName2.toUpperCase()} Team
        </Text>

        <Hr style={hr} />
        <Text style={footer}>{env.NEXTAUTH_URL}</Text>
      </Container>
    </Body>
  </Html>
);

export default UpcomingTestReminderEmail;

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
