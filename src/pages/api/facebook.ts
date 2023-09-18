import { prisma } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    value: string | string[] | undefined;
};

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    switch (req.method) {
        case "GET":
            console.log("GET request");
            console.log("req.query", req.query);
            console.log("req.query.hub_challenge", req.query.hub_challenge);
            console.log("req.query.hub_verify_token", req.query.hub_verify_token);

            res.status(200).json({ value: req.query.hub_challenge });
            break;
        case "POST":
            console.log("POST request");
            prisma.facebook.create({
                data: { data: JSON.stringify(req.body) }
            })

            res.status(200).json({ value: req.body });
            break;

        default:
            break;
    }
};

export default handler;