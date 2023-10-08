import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { google } from 'googleapis';

export const googleSheetsRouter = createTRPCRouter({
    getSheetData: protectedProcedure
        .input(z.object({ url: z.string() }))
        .query(async ({ ctx, input: { url } }) => {


            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    private_key: process.env.GOOGLE_CLIENT_SECRET?.replace(/\\n/g, '\n'),
                },
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/spreadsheets',
                ],
            });

            const sheets = google.sheets({
                auth,
                version: 'v4',
            });

            const response = await sheets.spreadsheets.values.get({spreadsheetId: "1718928846", range: "range1"})

            return { response }
        })
});
