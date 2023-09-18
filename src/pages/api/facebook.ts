import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    value: number;
};

const POST = (req: NextApiRequest, res: NextApiResponse<Data>) => {
    console.log(req.body);

    res.status(200).json({ value: 2013469864 });
};

export default POST
