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

interface FinalTestInvitationEmailProps {
  studentName: string;
  courseName: string;
  finalTestLink: string;
}

export const FinalTestInvitationEmail = ({
  studentName,
  courseName,
  finalTestLink,
  logoUrl,
  brandName1,
  brandName2,
}: FinalTestInvitationEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your {courseName} Zoom sessions are done — it's time for your final test!</Preview>
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
          Congratulations on completing all the Zoom sessions for <strong>{courseName}</strong>! 🎉
        </Text>

        <Text style={paragraph}>
          You're now one step away from receiving your certificate. Please take your final test using the button below:
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href={finalTestLink}>
            Take Final Test
          </Button>
        </Section>

        <Text style={paragraph}>
          📝 Once you complete the test, your certificate will be automatically generated and shared with you.
        </Text>

        <Text style={paragraph}>
          If you have any questions or need help, feel free to reach out to our team.
        </Text>

        <Text style={paragraph}>
          Best of luck on your test!
        </Text>

        <Text style={paragraph}>
          Warm regards,<br />
          The {brandName1.toUpperCase()} {brandName2.toUpperCase()} Team
        </Text>

        <Hr style={hr} />
        <Text style={footer}>{env.NEXTAUTH_URL}</Text>
      </Container>
    </Body>
  </Html>
);

export default FinalTestInvitationEmail;

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
