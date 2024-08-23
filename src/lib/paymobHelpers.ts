import { env } from "@/env.mjs";
import { Course, User } from "@prisma/client";
import axios from "axios";

export function formatAmountForPaymob(
    amount: number,
): number {
    return amount * 100
}

export async function createPaymentIntent(price: number, course: Course, user: User, orderNumber: string) {
    const intentData = {
        special_reference: orderNumber,
        amount: formatAmountForPaymob(price),
        currency: "EGP",
        payment_methods: [4618117, 4617984],
        items: [
            {
                name: course.name,
                amount: formatAmountForPaymob(price),
                description: course.description,
                quantity: 1,
            }
        ],
        billing_data: {
            first_name: user.name.split(" ")[0],
            last_name: user.name.split(" ")[-1] || user.name.split(" ")[0],
            phone_number: user.phone,
            email: user.email,
        },
        customer: {
            first_name: user.name.split(" ")[0],
            last_name: user.name.split(" ")[-1] || user.name.split(" ")[0],
            email: user.email,
        },
    };

    const intentConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${env.PAYMOB_BASE_URL}/v1/intention/`,
        headers: {
            'Authorization': `Token ${env.PAYMOB_API_SECRET}`,
            'Content-Type': 'application/json'
        },
        data: intentData
    };

    try {
        const intentResponse = (await axios.request(intentConfig)).data
        if (!intentResponse.client_secret) return null
        return intentResponse
    } catch (error: any) {
        console.log(error.response.data);
        return null
    }
}
