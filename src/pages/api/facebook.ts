import { prisma } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    switch (req.method) {
        case "GET":
            console.log("GET request");
            console.log("req.query", req.query);
            console.log("req.query.hub_challenge", req.query["hub.challenge"]);
            console.log("req.query.hub_verify_token", req.query["hub.verify_token"]);

            res.status(200).send(req.query["hub.challenge"]);
            break;
        case "POST":
            console.log("POST request");
            await prisma.facebook.create({
                data: { data: JSON.stringify(req.body) }
            })

            res.status(200).json({ value: req.body });
            break;

        default:
            break;
    }
};

export default handler;