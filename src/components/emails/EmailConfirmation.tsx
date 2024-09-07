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
    confirmationLink: string;
    logoUrl: string;
}

export const EmailConfirmation = ({
    customerName,
    userEmail,
    confirmationLink,
    logoUrl,
}: EmailProps) => {
    const previewText = `Confirm your email, ${customerName}`;

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
                                <strong>Confirm</strong> Your Email
                            </Row>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Hello {customerName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                            Please confirm your email address to complete the signup process.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-orange-500 rounded text-white text-[12px] p-[14px_20px_14px_20px] font-semibold no-underline text-center"
                                href={confirmationLink}
                            >
                                Confirm Email
                            </Button>
                        </Section>
                        <Text className="text-black text-sm leading-6 px-[16px]">
                            or copy and paste this URL into your browser:{' '}
                            <Link
                                href={confirmationLink}
                                className="text-blue-600 no-underline"
                            >
                                {confirmationLink}
                            </Link>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px] p-[16px]">
                            This email was intended for{' '}
                            <span className="text-black">{customerName}</span> at {userEmail}. If you were not
                            expecting this email, you can ignore it. If you are
                            concerned about your account's safety, please reply to this email to
                            get in touch with us.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default EmailConfirmation;
