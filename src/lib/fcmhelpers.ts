import { firebaseAdmin } from "@/server/firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api";

type SendNotificationInput = {
    tokens: string[];
    title: string;
    body: string;
    link: string,
};

export async function sendNotification({ tokens, body, link, title }: SendNotificationInput) {
    await Promise.all(tokens.map(async (token) => {
        const payload: Message = {
            token,
            data: {
                title,
                body,
                link,
            },
        }

        await firebaseAdmin.messaging().send(payload)
    }))
}
