import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { google } from "googleapis";
import { getGoogleFormDetails, refreshGoogleToken, revokeToken } from "@/lib/googleApis";
import { hasPermission } from "@/server/permissions";

export const googleAccountsRouter = createTRPCRouter({
    getGoogleAccounts: protectedProcedure
        .query(async ({ ctx }) => {
            const googleAccounts = await ctx.prisma.googleClient.findMany()
            return { googleAccounts }
        }),
    getGoogleForm: protectedProcedure
        .input(z.object({
            url: z.string(),
            clientId: z.string(),
        }))
        .mutation(async ({ ctx, input: { url, clientId } }) => {
            const formDetails = await getGoogleFormDetails(url, clientId)
            return { formDetails }
        }),
    deleteGoogleAccounts: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { ids } }) => {
            if (!hasPermission(ctx.session.user, "googleClients", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action" });
            const accounts = await ctx.prisma.googleClient.findMany({ where: { id: { in: ids } } })

            accounts.forEach(acc => revokeToken(acc.accessToken || "", acc.refreshToken || ""))

            const deletedGoogleAccounts = await ctx.prisma.googleClient.deleteMany({
                where: { id: { in: ids } }
            });

            return { deletedGoogleAccounts };
        }),
    createAuthCode: protectedProcedure
        .input(z.object({
            name: z.string(),
        }))
        .mutation(async ({ input: { name } }) => {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = `${process.env.NEXTAUTH_URL}google`;

            const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

            const googleAuthUrl = oAuth2Client.generateAuthUrl({
                access_type: "offline",
                scope: [
                    "https://www.googleapis.com/auth/forms",
                    "https://www.googleapis.com/auth/drive.file",
                    "https://www.googleapis.com/auth/forms.responses.readonly",
                    "https://www.googleapis.com/auth/forms.body.readonly",
                ],
                prompt: "consent",
                state: name,
            });

            return { googleAuthUrl };
        }),
    createToken: protectedProcedure
        .input(z.object({
            code: z.string(),
            name: z.string(),
        }))
        .mutation(async ({ ctx, input: { code, name } }) => {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = `${process.env.NEXTAUTH_URL}google`;

            const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

            // After redirect and receiving the authorization code, exchange it for tokens
            const { tokens, res } = await oAuth2Client.getToken(code);
            console.log(tokens);
            console.log(res);

            oAuth2Client.setCredentials(tokens);

            const googleClient = await ctx.prisma.googleClient.create({
                data: {
                    name,
                    accessToken: tokens.access_token,
                    expiryDate: tokens.expiry_date,
                    idToken: tokens.id_token,
                    refreshToken: tokens.refresh_token,
                    scope: tokens.scope,
                }
            });

            return { googleClient };
        }),
    refreshToken: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            const googleClient = await refreshGoogleToken(id)
            return { googleClient }
        })
});
