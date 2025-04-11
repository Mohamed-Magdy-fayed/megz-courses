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

interface PlacementTestEmailProps {
    studentName: string;
    testDate: string;
    testTime: string;
    testerName: string;
    courseSlug: string;
}

export const PlacementTestEmail = ({
    studentName,
    testDate,
    testTime,
    testerName,
    courseSlug,
    logoUrl,
    brandName1,
    brandName2,
}: PlacementTestEmailProps & EmailSignatureProps) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>Your Placement Test Has Been Scheduled</Preview>
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
                    We're pleased to inform you that your oral placement test has been successfully scheduled for:
                </Text>

                <Text style={paragraph}>
                    <strong>Date:</strong> {testDate}<br />
                    <strong>Time:</strong> {testTime}<br />
                    <strong>Tester:</strong> Mr/Mrs. {testerName}
                </Text>

                <Text style={paragraph}>
                    Please be ready and join the meeting at least 5 minutes before the scheduled time using the link below:
                </Text>

                <Section style={btnContainer}>
                    <Button
                        style={button}
                        href={`${env.NEXTAUTH_URL}student/placement_test/${courseSlug}`}
                    >
                        Join the Meeting
                    </Button>
                </Section>

                <Text style={paragraph}>
                    If you have any questions or need assistance, feel free to reach out.
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

export default PlacementTestEmail;

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
