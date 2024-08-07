import { prisma } from "@/server/db";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    switch (req.method) {
        case "GET":
            res.status(200).send(req.query["hub.challenge"]);
            break;
        case "POST":
            console.log(JSON.stringify(req.body.entry));

            const metaClient = await prisma.metaClient.findFirst()
            if (!metaClient) return res.status(200).send('no meta client configured')

            if (req.body.object === 'page') {
                req.body.entry.forEach((entry: any) => {
                    entry.messaging.forEach(async function (event: any) {
                        const { sender, message } = event;
                        const senderId = "me"; // change later sender.id
                        const text = message.text;

                        try {
                            const senderResponse = await axios.get(`https://graph.facebook.com/v20.0/${senderId}`,
                                {
                                    params: {
                                        access_token: metaClient.accessToken,
                                        fields: `id,name,email,picture{url},birthday`
                                    }
                                }
                            )
                            const senderData = senderResponse.data;

                            const userId = senderData.id
                            const name = senderData.name
                            const email = senderData.email
                            const picture = senderData.picture.data.url
                            const userExists = await prisma.potintialCustomer.findFirst({ where: { userId } })
                            if (userExists) return res.status(200).send('ALREADY_ADDED');

                            await prisma.potintialCustomer.create({
                                data: {
                                    userId,
                                    name,
                                    email,
                                    platform: "Facebook",
                                    picture,
                                    message: text,
                                }
                            })
                        } catch (error: any) {
                            console.log(error.message);
                        }
                    });
                });

                res.status(200).send('EVENT_RECEIVED');
                break;
            }

            if (req.body.object === 'whatsapp_business_account') {
                req.body.entry.forEach((entry: any) => {
                    entry.changes.forEach(async function (event: any) {
                        const { value } = event;

                        if (value.messaging_product === "whatsapp") {
                            try {
                                const userId = value.contacts[0]?.wa_id || "no user ID"
                                const name = value.contacts[0]?.profile.name || "no name"
                                const phone = value.metadata.display_phone_number
                                const message = value.messages[0]?.text.body || "no messages"

                                await prisma.potintialCustomer.create({
                                    data: {
                                        userId,
                                        name,
                                        platform: "WhatsApp",
                                        phone,
                                        message,
                                    }
                                })
                            } catch (error: any) {
                                console.log(error.message);
                            }
                        }
                    });
                });

                res.status(200).send('EVENT_RECEIVED');
                break;
            }

            if (req.body.object === 'instagram') {
                req.body.entry.forEach((entry: any) => {
                    entry.messaging.forEach(async function (event: any) {

                        try {
                            const senderId = /*event.sender.id*/ "me"

                            const instagramResponse = await axios.get(`https://graph.facebook.com/v20.0/${senderId}`,
                                {
                                    params: {
                                        access_token: metaClient.accessToken,
                                        fields: `id,name,email,picture{url},birthday`
                                    }
                                }
                            )
                            const userData = instagramResponse.data

                            const userId = userData.id
                            const name = userData.name
                            const email = userData.email
                            const picture = userData.picture.data.url
                            const userExists = await prisma.potintialCustomer.findFirst({ where: { userId } })
                            if (userExists) return res.status(200).send('ALREADY_ADDED');

                            await prisma.potintialCustomer.create({
                                data: {
                                    userId,
                                    name,
                                    email,
                                    platform: "Instagram",
                                    picture,
                                }
                            })
                        } catch (error: any) {
                            console.log(error.message);
                        }
                    });
                });

                res.status(200).send('EVENT_RECEIVED');
                break;
            }
        default:
            break;
    }
};

export default handler;