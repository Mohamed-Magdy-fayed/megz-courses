import { env } from "@/env.mjs";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Section,
    Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
    securityCode?: string;
    username?: string;
    logoUrl: string;
}

export const ResetPasswordEmail = ({
    securityCode,
    username,
    logoUrl,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Img
                        src={logoUrl}
                        width="100"
                        height="100"
                        alt="Logo"
                        style={logo}
                    />
                    <Text style={tertiary}>Verify Your Identity</Text>
                    <Heading style={secondary}>
                        Hi {username}, Enter the following code to finish resetting your password.
                    </Heading>
                    <Section style={codeContainer}>
                        <Text style={code}>{securityCode}</Text>
                    </Section>
                    <Text style={paragraph}>Not expecting this email?</Text>
                    <Text style={paragraph}>
                        Contact{" "}
                        <Link href={`mailto:${env.NEXT_PUBLIC_EMAIL}`} style={link}>
                            {env.NEXT_PUBLIC_EMAIL}
                        </Link>{" "}
                        if you did not request this code.
                    </Text>
                    <div><table cellPadding={0} cellSpacing={0} width="100%" style={{ maxWidth: '600px' }}> <tbody><tr> <td style={{ padding: '12px 0' }}> <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}> <tbody><tr> <td className="DISPLAYPICTURE" style={{ width: '160px' }} width={160}> <div style={{ margin: 0, lineHeight: 0, textAlign: 'center' }}> <img width="110px" style={{ maxWidth: '110px', height: 'auto', border: '3px solid #5363f2', borderRadius: '50%' }} src="https://contacts.zoho.com/file?fs=original&ID=861511892&nps=404" /> </div> </td> <td style={{ width: '180px', paddingRight: '20px' }} width={180}> <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}> <tbody><tr> <td> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '20px', color: '#5363f2', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Gateling TMS</p> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '14px', color: 'grey', margin: '5px 0 0' }}>TMS <span className="seperator">-</span> Gateling TMS</p> </td> </tr> <tr> <td style={{ padding: '8px 0 0' }}> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '14px', margin: 0, paddingTop: '6px', height: '30px' }}> <a className="FACEBOOKURL" href="https://www.facebook.com/gatelingsolutions" target="_blank" style={{ display: 'inline-block', lineHeight: 0, marginRight: '5px' }}><img alt="Facebook" width={20} style={{ maxWidth: '20px', height: 'auto', border: 0 }} src="https://static.zohocdn.com/toolkit/assets/f365fd888609adb4592a.png" /></a>  <a className="LINKEDINURL" href="https://www.linkedin.com/in/mohamed-magdy-fayed/" target="_blank" style={{ display: 'inline-block', lineHeight: 0, marginRight: '5px' }}><img alt="LinkedIn" width={20} style={{ maxWidth: '20px', height: 'auto', border: 0 }} src="https://static.zohocdn.com/toolkit/assets/44994ddd001121ef78ab.png" /></a>  <a className="INSTAGRAMURL" href="https://www.instagram.com/gatelingsolutions" target="_blank" style={{ display: 'inline-block', lineHeight: 0, marginRight: '5px' }}><img alt="Instagram" width={20} style={{ maxWidth: '20px', height: 'auto', border: 0 }} src="https://static.zohocdn.com/toolkit/assets/3581a585b3c1ed74caa7.png" /></a> </p> </td> </tr> </tbody></table> </td> <td style={{ borderLeft: '1px solid #a1a4aa', paddingLeft: '20px' }}> <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}> <tbody><tr> <td style={{ lineHeight: '1.6' }}> <table cellPadding={0} cellSpacing={0} style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '14px', width: '100%' }}> <tbody><tr className="PHONENUMBER"> <td style={{ width: '26px', padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/8c62b345a3e98fbffcaa.png" /></td> <td>+201123862218</td> </tr> <tr className="EMAIL"> <td style={{ padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/e9f50d5df538b77aaf67.png" /></td> <td><a href={`mailto:${env.NEXT_PUBLIC_EMAIL}`} style={{ textDecoration: 'none' }}>{env.NEXT_PUBLIC_EMAIL}</a></td> </tr> <tr className="WEBSITE"> <td style={{ padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/3c660a292e9d9e5ec69a.png" /></td> <td><a href="https://tms.gateling.com" style={{ textDecoration: 'none' }}>tms.gateling.com</a></td> </tr> <tr className="ADDRESS"> <td style={{ verticalAlign: 'top', padding: '4px 0 0' }}><img style={{ width: '16px', height: 'auto', lineHeight: 0 }} src="https://static.zohocdn.com/toolkit/assets/603ad3f106f2ae6eaf88.png" /></td> <td>Cairo, Egypt</td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> </tbody></table> </td> </tr> <tr className="DISCLAIMER"> <td style={{ borderTop: '1px solid #a1a4aa', paddingTop: '8px' }}> <p style={{ fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif', fontSize: '12px', color: 'grey', margin: 0, lineHeight: '1.5' }}>The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.</p> </td> </tr> </tbody></table></div>
                </Container>
                <Text style={footer}>Securely powered by Gateling.</Text>
            </Body>
        </Html>
    )
};

ResetPasswordEmail.PreviewProps = {
    validationCode: "144833",
    logoUrl: ""
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #eee",
    borderRadius: "5px",
    boxShadow: "0 5px 10px rgba(20,50,70,.2)",
    marginTop: "20px",
    maxWidth: "360px",
    margin: "0 auto",
    padding: "68px 0 130px",
};

const logo = {
    margin: "0 auto",
};

const tertiary = {
    color: "#0a85ea",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
    height: "16px",
    letterSpacing: "0",
    lineHeight: "16px",
    margin: "16px 8px 8px 8px",
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
};

const secondary = {
    color: "#000",
    display: "inline-block",
    fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
    fontSize: "20px",
    fontWeight: 500,
    lineHeight: "24px",
    marginBottom: "0",
    marginTop: "0",
    textAlign: "center" as const,
};

const codeContainer = {
    background: "rgba(0,0,0,.05)",
    borderRadius: "4px",
    margin: "16px auto 14px",
    verticalAlign: "middle",
    width: "280px",
};

const code = {
    color: "#000",
    display: "inline-block",
    fontFamily: "HelveticaNeue-Bold",
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "6px",
    lineHeight: "40px",
    paddingBottom: "8px",
    paddingTop: "8px",
    margin: "0 auto",
    width: "100%",
    textAlign: "center" as const,
};

const paragraph = {
    color: "#444",
    fontSize: "15px",
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
    letterSpacing: "0",
    lineHeight: "23px",
    padding: "0 40px",
    margin: "0",
    textAlign: "center" as const,
};

const link = {
    color: "#444",
    textDecoration: "underline",
};

const footer = {
    color: "#000",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0",
    lineHeight: "23px",
    margin: "0",
    marginTop: "20px",
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
};
