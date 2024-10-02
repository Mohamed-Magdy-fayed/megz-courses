import { env } from "@/env.mjs";
import axios from "axios";

type Input = {
    toNumber: string;
    textBody: string;
}

export const sendWhatsAppMessage = async ({ toNumber, textBody }: Input) => {
    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": toNumber,
        "type": "text",
        "text": {
            "body": textBody
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/${env.NEXT_PUBLIC_WHATSAPP_VERSION}/${env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID}/messages`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN}`
        },
        data: data
    };

    try {
        const response = await axios.request(config)

        if (response.status === 200) {
            return { success: true, toNumber, textBody }
        } else {
            return { success: false, toNumber, textBody }
        }
    } catch (error) {
        console.log(error);
        console.log("WhatsApp API not active - ", {
            toNumber,
            textBody,
        })
    }
}
