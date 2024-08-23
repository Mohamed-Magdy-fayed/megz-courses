import { env } from "@/env.mjs";
import nodemailer from "nodemailer";

type SendEmailInputs = {
    email: string,
    subject: string,
    html: string,
}

export function sendEmail({ email, html, subject }: SendEmailInputs) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.GMAIL_EMAIL,
            pass: env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: env.GMAIL_EMAIL,
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
