import { EmailSignatureProps } from '@/components/general/emails/EmailSignature';
import { env } from '@/env.mjs';
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
    courseLink: string;
}

export const CredentialsEmail = ({
    customerName,
    userEmail,
    password,
    logoUrl,
    courseLink,
}: CredentialsEmailProps & EmailSignatureProps) => {
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
                    <div><table cellPadding={0} cellSpacing={0} width="100%" style={{ maxWidth: '600px' }}> <tbody><tr> <td style={{ padding: '12px 0' }}> <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}> <tbody><tr> <td className="DISPLAYPICTURE" style={{ width: '160px' }} width={160}> <div style={{ margin: 0, lineHeight: 0, textAlign: 'center' }}> <img width="110px" style={{ maxWidth: '110px', height: 'auto', border: '3px solid #5363f2', borderRadius: '50%' }} src="https://contacts.zoho.com/file?fs=original&ID=861511892&nps=404" /> </div> </td> <td style={{ width: '180px', paddingRight: '20px' }} width={180}> <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}> <tbody><tr> <td> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '20px', color: '#5363f2', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Gateling TMS</p> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '14px', color: 'grey', margin: '5px 0 0' }}>TMS <span className="seperator">-</span> Gateling TMS</p> </td> </tr> <tr> <td style={{ padding: '8px 0 0' }}> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '14px', margin: 0, paddingTop: '6px', height: '30px' }}> <a className="FACEBOOKURL" href="https://www.facebook.com/gatelingsolutions" target="_blank" style={{ display: 'inline-block', lineHeight: 0, marginRight: '5px' }}><img alt="Facebook" width={20} style={{ maxWidth: '20px', height: 'auto', border: 0 }} src="https://static.zohocdn.com/toolkit/assets/f365fd888609adb4592a.png" /></a>  <a className="LINKEDINURL" href="https://www.linkedin.com/in/mohamed-magdy-fayed/" target="_blank" style={{ display: 'inline-block', lineHeight: 0, marginRight: '5px' }}><img alt="LinkedIn" width={20} style={{ maxWidth: '20px', height: 'auto', border: 0 }} src="https://static.zohocdn.com/toolkit/assets/44994ddd001121ef78ab.png" /></a>  <a className="INSTAGRAMURL" href="https://www.instagram.com/gatelingsolutions" target="_blank" style={{ display: 'inline-block', lineHeight: 0, marginRight: '5px' }}><img alt="Instagram" width={20} style={{ maxWidth: '20px', height: 'auto', border: 0 }} src="https://static.zohocdn.com/toolkit/assets/3581a585b3c1ed74caa7.png" /></a> </p> </td> </tr> </tbody></table> </td> <td style={{ borderLeft: '1px solid #a1a4aa', paddingLeft: '20px' }}> <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}> <tbody><tr> <td style={{ lineHeight: '1.6' }}> <table cellPadding={0} cellSpacing={0} style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '14px', width: '100%' }}> <tbody><tr className="PHONENUMBER"> <td style={{ width: '26px', padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/8c62b345a3e98fbffcaa.png" /></td> <td>+201123862218</td> </tr> <tr className="EMAIL"> <td style={{ padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/e9f50d5df538b77aaf67.png" /></td> <td><a href={`mailto:${env.NEXT_PUBLIC_EMAIL}`} style={{ textDecoration: 'none' }}>{env.NEXT_PUBLIC_EMAIL}</a></td> </tr> <tr className="WEBSITE"> <td style={{ padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/3c660a292e9d9e5ec69a.png" /></td> <td><a href="https://tms.gateling.com" style={{ textDecoration: 'none' }}>tms.gateling.com</a></td> </tr> <tr className="ADDRESS"> <td style={{ verticalAlign: 'top', padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/603ad3f106f2ae6eaf88.png" /></td> <td>Cairo, Egypt</td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> <tr className="DISCLAIMER"> <td style={{ borderTop: '1px solid #a1a4aa', paddingTop: '8px' }}> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '12px', color: 'grey', margin: 0, lineHeight: '1.5' }}>The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.</p> </td> </tr> </tbody></table></div>
                </Body>
            </Tailwind>
        </Html>
    );
};
