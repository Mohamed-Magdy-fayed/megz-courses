import { prisma } from "@/server/db";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    switch (req.method) {
        case "GET":
            res.status(200).send(req.query["hub.challenge"]);
            break;
        case "POST":
            if (req.body.entry[0].changes[0].field !== 'feed') return res.status(400).send({})

            const userId = req.body.entry[0].changes[0].value.from.id
            const value = await axios.get(`https://graph.facebook.com/v18.0/${userId}?&fields=id,first_name,last_name,picture&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`)
                .then(res => {
                    return res.data
                })
                .then(async (data) => {
                    const potintialCustomer = await prisma.potintialCustomer.create({
                        data: {
                            facebookUserId: userId,
                            firstName: data.first_name,
                            lastName: data.last_name,
                            picture: data.picture.data.url
                        }
                    })

                    return potintialCustomer
                })
                .catch(e => console.log(e.response))

            res.status(200).json({ value });
            break;

        default:
            break;
    }
};

export default handler;