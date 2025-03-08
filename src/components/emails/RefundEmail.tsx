import { EmailSignatureProps } from '@/components/emails/EmailSignature';
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

interface RefundEmailProps {
    name: string;
    refundAmount: string;
    orderNumber: string;
}

export const RefundEmail = ({
    name,
    refundAmount,
    orderNumber,
    logoUrl,
    brandName1,
    brandName2,
}: RefundEmailProps & EmailSignatureProps) => (
    <Html>
        <Head />
        <Body style={main}>
            <Preview>
                Refund Completed
            </Preview>
            <Container style={container}>
                <Img
                    src={logoUrl}
                    width="120"
                    height="120"
                    alt="Logo"
                    style={logo}
                />
                <Text style={paragraph}>Hi {name},</Text>
                <Text style={paragraph}>
                    You have been refunded an amount {refundAmount} regarding order {orderNumber}, thank you for your time with us.
                </Text>
                <Section style={btnContainer}>
                    <Button style={button} href={`${env.NEXTAUTH_URL}student/my_account`}>
                        Go to my account
                    </Button>
                </Section>
                <Text style={paragraph}>
                    Best Regards,
                    <br />
                    {brandName1.toUpperCase()} {brandName2.toUpperCase()} team
                </Text>
                <Hr style={hr} />
                <Text style={footer}>
                    {env.NEXTAUTH_URL}
                </Text>
            </Container>
        </Body>
    </Html>
);

export default RefundEmail;

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
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px',
};

const hr = {
    borderColor: '#cccccc',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
};
