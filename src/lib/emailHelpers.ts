import { env } from "@/env.mjs";
import nodemailer from "nodemailer";

type SendEmailInputs = {
    email: string,
    subject: string,
    html: string,
}

export async function sendZohoEmail({ email, html, subject }: SendEmailInputs) {

    const transporter = nodemailer.createTransport({
        host: env.COMMS_EMAIL_HOST,
        port: Number(env.COMMS_EMAIL_PORT),
        secure: true,
        auth: {
            user: env.COMMS_EMAIL,
            pass: env.COMMS_EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: env.COMMS_EMAIL,
        to: email,
        subject,
        html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(info);
        }
    });
}
