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

interface AddedToGroupEmailProps {
  studentName: string;
  trainerName: string;
  groupStartDate: string;
  courseName: string;
  courseSlug: string;
}

export const AddedToGroupEmail = ({
  studentName,
  trainerName,
  groupStartDate,
  courseName,
  courseSlug,
  logoUrl,
  brandName1,
  brandName2,
}: AddedToGroupEmailProps & EmailSignatureProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>You're enrolled in a group for {courseName}</Preview>
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
          You’ve been successfully added to a learning group for the course <strong>{courseName}</strong> 🎉
        </Text>

        <Text style={paragraph}>
          🧑‍🏫 <strong>Teacher:</strong> {trainerName}<br />
          📅 <strong>Start Date:</strong> {groupStartDate}
        </Text>

        <Text style={paragraph}>
          When each session begins, you’ll receive an email with your Zoom meeting link to join the session.
        </Text>

        <Text style={paragraph}>
          If you haven't already, please download the Zoom app beforehand:
        </Text>

        <Section style={btnContainer}>
          <Button
            style={button}
            href="https://zoom.us/download"
          >
            Download Zoom
          </Button>
        </Section>

        <Section style={btnContainer}>
          <Button
            style={button}
            href={`${env.NEXTAUTH_URL}student/my_courses/${courseSlug}`}
          >
            View My Course
          </Button>
        </Section>

        <Text style={paragraph}>
          We're excited to support you on your learning journey. If you have any questions, feel free to reach out!
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

export default AddedToGroupEmail;

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
