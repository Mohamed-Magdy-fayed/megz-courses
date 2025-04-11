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

interface CourseCompletionCongratulationsEmailProps {
  studentName: string;
  courseName: string;
  certificateLink: string;
}

export const CourseCompletionCongratulationsEmail = ({
  studentName,
  courseName,
  certificateLink,
  logoUrl,
  brandName1,
  brandName2,
}: CourseCompletionCongratulationsEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Congratulations on completing {courseName}! 🎓 Your certificate is ready.</Preview>
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
          🎉 Congratulations on successfully completing the course: <strong>{courseName}</strong>!
        </Text>

        <Text style={paragraph}>
          You've shown dedication and effort, and we’re proud to have been part of your learning journey.
        </Text>

        <Text style={paragraph}>
          Your certificate is now ready. You can view and download it here:
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={certificateLink}>
            View My Certificate
          </Button>
        </Section>

        <Text style={paragraph}>
          Thank you for learning with us. We hope to see you again in future programs!
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

export default CourseCompletionCongratulationsEmail;

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
