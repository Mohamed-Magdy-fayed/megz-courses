import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    name: string;
};

const POST = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    console.log(req.body);

    res.status(200).json({ name: "John Doe" });
};

export default POST
