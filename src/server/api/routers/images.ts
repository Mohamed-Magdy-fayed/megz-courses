import {
    createTRPCRouter,
    publicProcedure,
} from "@/server/api/trpc";
import * as fs from "fs/promises";
import { z } from "zod";



export const imagesRouter = createTRPCRouter({
    upload: publicProcedure
        .input(z.object({
            name: z.string(),
            buffer: z.any(),
        }))
        .mutation(async ({ input: { buffer, name } }) => {
            const path = `./public/uploads/${name}`
            await fs.writeFile(path, buffer);

            return {
                path,
            };
        }),
});
