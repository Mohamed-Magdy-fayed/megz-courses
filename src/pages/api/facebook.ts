import { findConversationBySenderId } from "@/lib/metaHelpers";
import { leadsCodeGenerator } from "@/lib/utils";
import { prisma } from "@/server/db";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    switch (req.method) {
        case "GET":
            res.status(200).send(req.query["hub.challenge"]);
            break;
        case "POST":
            const metaClient = await prisma.metaClient.findFirst()
            if (!metaClient) return res.status(200).send('no meta client configured')

            if (req.body.object === 'page') {
                req.body.entry.forEach((entry: any) => {
                    entry.messaging.forEach(async function (event: any) {
                        const { sender, message } = event;
                        const senderId = sender.id;
                        const text = message.text;

                        try {
                            const conversation = await findConversationBySenderId({ accessToken: metaClient.accessToken, senderId: senderId })
                            if (!conversation) return

                            const senderData = conversation.senders.data.find(sender => sender.id === senderId);
                            if (!senderData) return
                            const metaUserId = senderData.id

                            const userExists = await prisma.lead.findFirst({ where: { metaUserId }, include: { user: true } })
                            if (userExists) {
                                await prisma.leadInteraction.create({
                                    data: {
                                        description: text,
                                        type: "Chat",
                                        lead: { connect: { id: userExists.id } },
                                    }
                                })
                                return
                            }

                            const conversationId = conversation.id
                            const name = senderData.name

                            await prisma.lead.create({
                                data: {
                                    metaUserId,
                                    name,
                                    conversationId,
                                    code: leadsCodeGenerator(),
                                    source: "Facebook",
                                    interactions: {
                                        create: {
                                            description: text,
                                            type: "Chat",
                                        }
                                    },
                                    leadStage: { connect: { defaultStage: "Intake" } },
                                    isReminderSet: false,
                                    message: text,
                                    isAssigned: false,
                                    isAutomated: true,
                                }
                            })


                        } catch (error: any) {
                            if (error.response && error.response.data) {
                                console.log("145", error.response.data);
                            } else if (error.message) {
                                console.log("147", error.message);
                            } else {
                                console.log("149", error);
                            }
                        }
                    });
                });

                res.status(200).send('success!');
                break;
            }

            if (req.body.object === 'whatsapp_business_account') {
                req.body.entry.forEach((entry: any) => {
                    entry.changes.forEach(async function (event: any) {
                        const { value } = event;

                        if (value.messaging_product === "whatsapp") {
                            console.log(value);

                            try {
                                const userId = value.contacts[0]?.wa_id || "no user ID"
                                const name = value.contacts[0]?.profile.name || "no name"
                                const phone = value.messages[0]?.from || "No phone"
                                const message = value.messages[0]?.text.body || "no messages"

                                const userExists = await prisma.lead.findFirst({ where: { userId } })
                                if (userExists) return res.status(200).send('ALREADY_ADDED');

                                await prisma.lead.create({
                                    data: {
                                        userId,
                                        name,
                                        code: leadsCodeGenerator(),
                                        source: "WhatsApp",
                                        leadStage: { connect: { defaultStage: "Intake" } },
                                        phone,
                                        message,
                                        isAssigned: false,
                                        isAutomated: true,
                                        isReminderSet: true,
                                    }
                                })
                            } catch (error: any) {
                                if (error.response && error.response.data) {
                                    console.log("145", error.response.data);
                                } else if (error.message) {
                                    console.log("147", error.message);
                                } else {
                                    console.log("149", error);
                                }
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
                            const senderId = event.sender.id

                            const instagramResponse = await axios.get(`https://graph.facebook.com/v20.0/${senderId}`,
                                {
                                    params: {
                                        access_token: metaClient.accessToken,
                                        fields: `id,name,profile_pic,username`
                                    }
                                }
                            )
                            const userData = instagramResponse.data

                            const userId = userData.id
                            const name = userData.name
                            const email = userData.username || "No Email"
                            const image = userData.profile_pic || "No Image"

                            const userExists = await prisma.lead.findFirst({ where: { userId } })
                            if (userExists) return res.status(200).send('ALREADY_ADDED');

                            await prisma.lead.create({
                                data: {
                                    userId,
                                    name,
                                    email,
                                    code: leadsCodeGenerator(),
                                    source: "Instagram",
                                    leadStage: { connect: { defaultStage: "Intake" } },
                                    image,
                                    isAssigned: false,
                                    isAutomated: true,
                                    isReminderSet: true,
                                },
                            })
                        } catch (error: any) {
                            if (error.response && error.response.data) {
                                console.log("145", error.response.data);
                            } else if (error.message) {
                                console.log("147", error.message);
                            } else {
                                console.log("149", error);
                            }
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