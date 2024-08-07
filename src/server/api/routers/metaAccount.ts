import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env.mjs";
import axios from "axios";

export const metaAccountRouter = createTRPCRouter({
    getMetaClient: protectedProcedure
        .query(async ({ ctx }) => {
            const metaClient = await ctx.prisma.metaClient.findFirst()
            return { metaClient }
        }),
    deleteMetaClient: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input: { id } }) => {
            const deletedMetaClient = await ctx.prisma.metaClient.delete({
                where: { id }
            })

            return { deletedMetaClient }
        }),
    createPermenantAccessCode: protectedProcedure
        .input(z.object({
            name: z.string(),
            fbExchangeToken: z.string(),
        }))
        .mutation(async ({ input: { name, fbExchangeToken }, ctx }) => {
            const clientId = env.NEXT_PUBLIC_WHATSAPP_APP_ID
            const clientSecret = env.NEXT_PUBLIC_WHATSAPP_APP_SECRET

            const url = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${fbExchangeToken}`;

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url,
            };

            try {
                const response = (await axios.request(config)).data;

                const metaClient = await ctx.prisma.metaClient.create({
                    data: {
                        name,
                        accessToken: response.access_token
                    }
                })

                return { metaClient }
            }
            catch (error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JSON.stringify(error) })
            }
        }),
    updatePermenantAccessCode: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            fbExchangeToken: z.string(),
        }))
        .mutation(async ({ input: { id, name, fbExchangeToken }, ctx }) => {
            const clientId = env.NEXT_PUBLIC_WHATSAPP_APP_ID
            const clientSecret = env.NEXT_PUBLIC_WHATSAPP_APP_SECRET

            const url = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${fbExchangeToken}`;

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url,
            };

            try {
                const response = (await axios.request(config)).data;

                const metaClient = await ctx.prisma.metaClient.update({
                    where: { id },
                    data: {
                        name,
                        accessToken: response.access_token
                    }
                })

                return { metaClient }
            }
            catch (error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JSON.stringify(error) })
            }
        }),
});
