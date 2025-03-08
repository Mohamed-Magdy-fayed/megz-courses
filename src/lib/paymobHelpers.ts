import { env } from "@/env.mjs";
import { orderCodeGenerator } from "@/lib/utils";
import { Course, User } from "@prisma/client";
import axios from "axios";

export function formatAmountForPaymob(
    amount: number,
): number {
    return amount * 100
}

export async function createPaymentIntent(price: number, course: Pick<Course, "name" | "description">, user: Pick<User, "name" | "email" | "phone">, orderNumber: string) {
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
export async function generateToken() {
    return (await axios.post("https://accept.paymob.com/api/auth/tokens", {
        api_key: env.PAYMOB_API_KEY
    })).data.token;
}

export async function createOrder(token: string, amount_cents: number, orderNumber: string, name: string, description?: string) {
    const payload = {
        auth_token: token,
        delivery_needed: false,
        amount_cents,
        currency: "EGP",
        merchant_order_id: orderNumber,
        items: [{
            name,
            amount_cents,
            description: description || "",
            quantity: 1,
            category: "DIGITAL_GOODS",
            brand: "Gateling TMS"
        }],
    };

    return (await axios.post("https://accept.paymob.com/api/ecommerce/orders", payload, {
        headers: { "Content-Type": "application/json" }
    })).data.id;
}

export async function getPaymentKey(auth_token: string, amount_cents: number, order_id: string, name: string) {
    const payload = {
        auth_token,
        amount_cents,
        expiration: 3600,
        order_id,
        billing_data: {
            first_name: name.split(" ")[0],
            last_name: name.split(" ")[-1] || name.split(" ")[0],
            street: "['This field is required.']",
            building: "['This field is required.']",
            floor: "['This field is required.']",
            apartment: "['This field is required.']",
            city: "['This field is required.']",
            country: "['This field is required.']",
            email: "['This field is required.']",
            phone_number: "['This field is required.']"
        },
        customer: {
            first_name: name.split(" ")[0],
            last_name: name.split(" ")[-1] || name.split(" ")[0],
        },
        currency: "EGP",
        integration_id: 4618117
    }

    return (await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", payload, {
        headers: { "Content-Type": "application/json" }
    })).data.token;
}

export async function generatePaymentLink(amount: number, orderId: string, name: string, description?: string) {
    const token = await generateToken();
    const amount_cents = formatAmountForPaymob(amount)
    const order_id = await createOrder(token, amount_cents, orderId, name, description)
    const paymentKey = await getPaymentKey(token, amount_cents, order_id, name)

    return `https://accept.paymob.com/acceptance/payments/${paymentKey}`
}
