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

interface SessionEndedEmailProps {
  studentName: string;
  courseName: string;
  sessionTitle: string;
  nextSessionDate: string;
  assignmentLink: string;
}

export const SessionEndedEmail = ({
  studentName,
  courseName,
  sessionTitle,
  nextSessionDate,
  assignmentLink,
  logoUrl,
  brandName1,
  brandName2,
}: SessionEndedEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>{courseName} – Your session has ended. Here's what's next.</Preview>
      <Container style={container}>
        <Img
          src={logoUrl}
          width="120"
          height="120"
          alt="Logo"
          style={logo}
        />

        <Text style={paragraph}>Hi {studentName},</Text>

        <Text style={paragraph}>
          You've just completed the session <strong>{sessionTitle}</strong> for <strong>{courseName}</strong>. Great job! 👏
        </Text>

        <Text style={paragraph}>
          📅 <strong>Next Session:</strong><br />
          {nextSessionDate}
        </Text>

        <Text style={paragraph}>
          📝 Here's your assignment to complete before the next session:
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={assignmentLink}>
            View Assignment
          </Button>
        </Section>

        <Text style={paragraph}>
          Stay consistent, and keep up the great work. If you have questions, don't hesitate to reach out!
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

export default SessionEndedEmail;

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
