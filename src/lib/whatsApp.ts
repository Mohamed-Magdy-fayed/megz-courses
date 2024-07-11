import { env } from "@/env.mjs";
import axios from "axios";

type Input = {
    toNumber: string;
    textBody: string;
}

/**
 * user name and password
 * payment notification
 * payment confirmation
 * placement test time
 * placement test result (level)
 * added to group
 * session time updates ***************************NOT DONE
 * session times
 * quiz before session
 * material and assignment after session
 * final session / test time
 */

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

    const response = await axios.request(config)

    if (response.status === 200) {
        return { success: true, toNumber, textBody }
    } else {
        return { success: false, toNumber, textBody }
    }
}
