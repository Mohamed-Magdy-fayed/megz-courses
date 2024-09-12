import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface CredentialsEmailProps {
    customerName: string;
    userEmail: string;
    password: string;
    logoUrl: string;
    courseLink: string;
}

export const CredentialsEmail = ({
    customerName,
    userEmail,
    password,
    logoUrl,
    courseLink,
}: CredentialsEmailProps) => {
    const previewText = `Your credentials for accessing the course materials`;

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
                                alt="logo"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Section>
                            <Text className="text-black text-[16px] leading-[24px] px-[16px]">
                                Hello {customerName},
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                                Thank you for choosing us! Here are your credentials for accessing the course materials.
                            </Text>
                        </Section>
                        <Section>
                            <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                                <strong>Username:</strong> {userEmail}
                                <br />
                                <strong>Password:</strong> {password}
                            </Text>
                        </Section>
                        <Section>
                            <Text className="text-black text-[14px] leading-[24px] px-[16px]">
                                You can change your username and password at any time. To access your courses, click the link below:
                            </Text>
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-orange-500 rounded text-white text-[12px] p-[14px_20px_14px_20px] font-semibold no-underline text-center"
                                href={courseLink}
                            >
                                Start learning
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
