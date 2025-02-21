import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import { env } from "@/env.mjs";
import axios from "axios";
import { hasPermission } from "@/server/permissions";

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
            if (!hasPermission(ctx.session.user, "metaClients", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
            if (!hasPermission(ctx.session.user, "metaClients", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const clientId = env.WHATSAPP_APP_ID
            const clientSecret = env.WHATSAPP_APP_SECRET

            const url = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${fbExchangeToken}`;

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url,
            };

            try {
                const response = (await axios.request(config)).data;

                const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?access_token=${response.access_token}`;
                const pagesResponse = (await axios.get(pagesUrl)).data;

                if (!pagesResponse.data || pagesResponse.data.length === 0) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "No pages found for this user." });
                }

                const page = pagesResponse.data.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
                if (!page) throw new TRPCError({ code: "BAD_REQUEST", message: `No page found with this name! ${name}` });
                const pageAccessToken = page.access_token;

                const metaClient = await ctx.prisma.metaClient.create({
                    data: {
                        name: page.name,
                        accessToken: pageAccessToken
                    }
                })

                return { metaClient }
            }
            catch (error) {
                throw new TRPCError(getTRPCErrorFromUnknown(error))
            }
        }),
    updatePermenantAccessCode: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            fbExchangeToken: z.string(),
        }))
        .mutation(async ({ input: { id, name, fbExchangeToken }, ctx }) => {
            if (!hasPermission(ctx.session.user, "metaClients", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const clientId = env.WHATSAPP_APP_ID
            const clientSecret = env.WHATSAPP_APP_SECRET

            const url = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${fbExchangeToken}`;

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url,
            };

            try {
                const response = (await axios.request(config)).data;

                const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?access_token=${response.access_token}`;
                const pagesResponse = (await axios.get(pagesUrl)).data;

                if (!pagesResponse.data || pagesResponse.data.length === 0) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "No pages found for this user." });
                }

                const page = pagesResponse.data.find((s: any) => s.name === name);
                const pageAccessToken = page.access_token;

                const metaClient = await ctx.prisma.metaClient.update({
                    where: { id },
                    data: {
                        name,
                        accessToken: pageAccessToken
                    }
                })

                return { metaClient }
            }
            catch (error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JSON.stringify(error) })
            }
        }),
});
