import { google } from 'googleapis';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';
import { TRPCError } from '@trpc/server';

export const getGoogleFormDetails = async (url: string, clientId: string) => {
    function getFormIdFromUrl(url: string) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        return match ? match[1] : undefined;
    }

    const googleClient = await prisma.googleClient.findUnique({ where: { id: clientId } })
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
            await prisma.googleClient.update({
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
        } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Failed to refresh access token: ${error}` });
        }
    }

    const formsApi = google.forms({ version: 'v1', auth: oauth2Client });
    const form = await formsApi.forms.get({ formId: getFormIdFromUrl(url) })
        .then((res) => res.data)
        .catch(e => {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Didn't find this form on the selected account!\n${e}` })
        })

    // const responses = (await formsApi.forms.responses.list({ formId: getFormIdFromUrl(url) })).data.responses?.map(res => {

    //     return {
    //         responseId: res.responseId,
    //         formId: res.formId,
    //         userEmail: res.respondentEmail,
    //         totalScore: res.totalScore,
    //         answers: res.answers,
    //         createdAt: res.createTime,
    //     }
    // })

    const formRespondUrl = form.responderUri
    const formId = form.formId
    const title = form.info?.title || "no title"
    if (!formRespondUrl || !formId) throw new TRPCError({ code: "BAD_REQUEST", message: "Form Data incomplete!" })
    const questions = form.items?.map(i => {
        const questionText = i.title || "no text"
        const questionImage = i.questionItem?.image || "no image"
        const questionPoints = i.questionItem?.question?.grading?.pointValue || 0
        const questionOptions = i.questionItem?.question?.choiceQuestion?.options || []
        const correctAnswers = i.questionItem?.question?.grading?.correctAnswers?.answers || []

        return ({
            questionText,
            questionImage,
            questionPoints,
            questionOptions,
            correctAnswers,
        })
    }) || []

    return {
        formRespondUrl,
        formId,
        title,
        questions,
    };
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

            return { refreshedClient }
        } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Failed to refresh access token: ${error}` });
        }
    }

    return { googleClient }
}
