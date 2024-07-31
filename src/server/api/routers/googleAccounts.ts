import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { forms_v1, google } from "googleapis";

export const googleAccountsRouter = createTRPCRouter({
    getGoogleAccounts: protectedProcedure
        .query(async ({ ctx }) => {
            const googleAccounts = await ctx.prisma.googleClient.findMany()
            return { googleAccounts }
        }),
    // getGoogleForm: protectedProcedure
    //     .input(z.object({
    //         url: z.string()
    //     }))
    //     .mutation(async ({ ctx, input: { url } }) => {

    //         function getFormIdFromUrl(url: string) {
    //             const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    //             return match ? match[1] : undefined;
    //         }

    //         const googleClient = await ctx.prisma.googleClient.findMany({ orderBy: { id: "desc" }, take: 1 })
    //         if (!googleClient[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Google client not found" })
    //         if (!googleClient[0].accessToken) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No access token" })

    //         const oauth2Client = new google.auth.OAuth2(
    //             process.env.GOOGLE_CLIENT_ID,
    //             process.env.GOOGLE_CLIENT_SECRET,
    //             process.env.GOOGLE_REDIRECT_URI
    //         );

    //         oauth2Client.setCredentials({
    //             access_token: googleClient[0].accessToken,
    //             refresh_token: googleClient[0].refreshToken,
    //         });

    //         // Check if the token has expired and refresh it if necessary
    //         if (googleClient[0].expiryDate && googleClient[0].expiryDate < Date.now()) {
    //             try {
    //                 const tokens = await oauth2Client.refreshAccessToken();
    //                 const newTokens = tokens.credentials;

    //                 // Update the tokens in the database
    //                 await ctx.prisma.googleClient.update({
    //                     where: { id: googleClient[0].id },
    //                     data: {
    //                         accessToken: newTokens.access_token,
    //                         expiryDate: newTokens.expiry_date,
    //                         idToken: newTokens.id_token,
    //                         refreshToken: newTokens.refresh_token,
    //                         scope: newTokens.scope,
    //                     },
    //                 });

    //                 oauth2Client.setCredentials(newTokens);
    //             } catch (error) {
    //                 throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to refresh access token: ${error}` });
    //             }
    //         }

    //         const forms: forms_v1.Forms = google.forms({ version: 'v1', auth: oauth2Client });

    //         const data = await forms.forms.get({ formId: getFormIdFromUrl(url) })
    //         return { data };
    //     }),
    deleteGoogleAccounts: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { ids } }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action" });
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
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/forms', "https://www.googleapis.com/auth/drive.file"],
            });

            return { googleAuthUrl };
        }),
    createToken: protectedProcedure
        .input(z.object({
            code: z.string(),
        }))
        .mutation(async ({ ctx, input: { code } }) => {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const redirectUri = `${process.env.NEXTAUTH_URL}google`;

            const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

            // After redirect and receiving the authorization code, exchange it for tokens
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            const googleClient = await ctx.prisma.googleClient.create({
                data: {
                    name: "TEST",
                    accessToken: tokens.access_token,
                    expiryDate: tokens.expiry_date,
                    idToken: tokens.id_token,
                    refreshToken: tokens.refresh_token,
                    scope: tokens.scope,
                }
            });

            return { googleClient };
        }),
});
