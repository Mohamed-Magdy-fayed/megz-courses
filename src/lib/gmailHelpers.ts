import { env } from "@/env.mjs";
import nodemailer from "nodemailer";

type SendEmailInputs = {
    email: string,
    subject: string,
    html: string,
}

export function sendZohoEmail({ email, html, subject }: SendEmailInputs) {
    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 465,
        secure: true,
        auth: {
            user: env.ZOHO_MAIL,
            pass: env.ZOHO_PASS,
        },
    });

    const mailOptions = {
        from: env.ZOHO_MAIL,
        to: email,
        subject,
        html,
    };

    try {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info);
            }
        });
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}
