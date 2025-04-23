import { getCaller } from "@/server/api/root";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const caller = await getCaller(req, res);
        await caller.cron.missedSessions();
        return res.status(200).json({ status: "ok" });
    } catch (err) {
        console.error("Cron error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
