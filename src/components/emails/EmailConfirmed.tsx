import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface EmailProps {
    customerName: string;
    userEmail: string;
    accountLink: string;
    logoUrl: string;
}

export const EmailConfirmationSuccess = ({
    customerName,
    userEmail,
    accountLink,
    logoUrl,
}: EmailProps) => {
    const previewText = `Your email has been verified, ${customerName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={logoUrl}
                                width="60"
                                height="60"
                                alt="Logo"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0 bg-orange-500">
                            <Row>
                                <strong>Email</strong> Verified Successfully
                            </Row>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Hello {customerName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Your email address <strong>{userEmail}</strong> has been successfully verified.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            You can now access your account and start using our services.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-orange-500 rounded text-white text-[12px] p-[14px_20px_14px_20px] font-semibold no-underline text-center"
                                href={accountLink}
                            >
                                Go to your account from here
                            </Button>
                        </Section>
                        <Text className="text-black text-sm leading-6 px-[16px]">
                            or copy and paste this URL into your browser: {' '}
                            <Link
                                href={accountLink}
                                className="text-blue-600 no-underline"
                            >
                                {accountLink}
                            </Link>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px] p-[16px]">
                            This email was intended for{' '}
                            <span className="text-black">{customerName}</span> at {userEmail}. If you were not
                            expecting this email, please ignore it. If you have any questions or concerns, feel free to reach out to us by replying to this email.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default EmailConfirmationSuccess;
