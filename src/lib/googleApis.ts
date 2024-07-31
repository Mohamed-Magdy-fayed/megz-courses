import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const baseApiUrl = "https://forms.googleapis.com"
const get = `GET /v1/forms/{formId}`
const list = `GET /v1/forms/{formId}/responses`

const getOAuth2Client = (): OAuth2Client => {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = `${process.env.NEXTAUTH_URL}api/auth/callback/google`;

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    console.log(oAuth2Client)
    oAuth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return oAuth2Client;
};

export const getGoogleFormDetails = async (formId: string) => {
    const auth = getOAuth2Client();
    const forms = google.forms({ version: 'v1', auth });

    try {
        const response = await forms.forms.get({ formId });
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching form details:', error);
    }
};
