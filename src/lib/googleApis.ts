import { forms_v1, google } from 'googleapis';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';
import { TRPCError } from '@trpc/server';

const getFormIdFromUrl = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : undefined;
}

const getForm = async (url: string, clientId: string) => {
    const { oauth2Client } = await refreshGoogleToken(clientId)
    const formsApi = google.forms({ version: 'v1', auth: oauth2Client });

    return {
        form: (await formsApi.forms.get({ formId: getFormIdFromUrl(url) })).data,
        oauth2Client,
        formsApi,
    }
}

export const getGoogleFormDetails = async (url: string, clientId: string) => {
    const { form } = await getForm(url, clientId)

    return form
};

export const refreshGoogleToken = async (id: string) => {
    const googleClient = await prisma.googleClient.findUnique({ where: { id } })
    if (!googleClient) throw new TRPCError({ code: "BAD_REQUEST", message: "Google client not found" })
    if (!googleClient.accessToken) throw new TRPCError({ code: "BAD_REQUEST", message: "No access token" })

    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: googleClient.accessToken,
        refresh_token: googleClient.refreshToken,
    });

    // Check if the token has expired and refresh it if necessary
    if (googleClient.expiryDate && googleClient.expiryDate < Date.now()) {
        try {
            const tokens = await oauth2Client.refreshAccessToken();
            const newTokens = tokens.credentials;

            // Update the tokens in the database
            const refreshedClient = await prisma.googleClient.update({
                where: { id: googleClient.id },
                data: {
                    accessToken: newTokens.access_token,
                    expiryDate: newTokens.expiry_date,
                    idToken: newTokens.id_token,
                    refreshToken: newTokens.refresh_token,
                    scope: newTokens.scope,
                },
            });

            oauth2Client.setCredentials(newTokens);

            return { refreshedClient, oauth2Client }
        } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Failed to refresh access token: ${error}` });
        }
    }

    return { googleClient, oauth2Client }
}

export const revokeToken = async (accessToken: string, refreshToken: string) => {
    const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    oauth2Client.revokeToken(accessToken, (err) => {
        if (err) throw new TRPCError({ code: "BAD_REQUEST", message: "Error revoke token" })
    })
};
