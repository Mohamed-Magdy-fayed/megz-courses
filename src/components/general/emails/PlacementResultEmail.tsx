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

interface PlacementResultEmailProps {
  studentName: string;
  levelName: string;
  courseName: string;
  courseSlug: string;
}

export const PlacementResultEmail = ({
  studentName,
  levelName,
  courseName,
  courseSlug,
  logoUrl,
  brandName1,
  brandName2,
}: PlacementResultEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your Placement Result is Ready</Preview>
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
          Congratulations! Based on your oral placement test, you've been placed in the <strong>{levelName}</strong> level for the course: <strong>{courseName}</strong>.
        </Text>

        <Text style={paragraph}>
          You can now access your course details and start learning by clicking the button below:
        </Text>

        <Section style={btnContainer}>
          <Button
            style={button}
            href={`${env.NEXTAUTH_URL}student/my_courses/${courseSlug}`}
          >
            View My Course
          </Button>
        </Section>

        <Text style={paragraph}>
          Once your learning officially begins—whether in a group class or private session—you’ll receive a separate email with your schedule and meeting times.
        </Text>

        <Text style={paragraph}>
          We're excited to support you on your learning journey. If you have any questions, feel free to reach out.
        </Text>

        <Text style={paragraph}>
          Best regards,<br />
          The {brandName1.toUpperCase()} {brandName2.toUpperCase()} Team
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          {env.NEXTAUTH_URL}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PlacementResultEmail;

// === Styles ===
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
