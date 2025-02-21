import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.string().url(),
    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
    WHATSAPP_APP_ID: z.string(),
    WHATSAPP_APP_SECRET: z.string(),
    WHATSAPP_VERSION: z.string(),
    WHATSAPP_PHONE_NUMBER_ID: z.string(),
    ZOOM_CLIENT_ID: z.string(),
    ZOOM_CLIENT_SECRET: z.string(),
    ZOOM_REDIRECT_URI: z.string(),
    COMMS_EMAIL: z.string().email(),
    COMMS_EMAIL_PASS: z.string(),
    COMMS_EMAIL_HOST: z.string().optional(),
    COMMS_EMAIL_PORT: z.string().optional(),
    PAYMOB_BASE_URL: z.string(),
    PAYMOB_API_KEY: z.string(),
    PAYMOB_API_SECRET: z.string(),
    PAYMOB_PUBLIC_KEY: z.string(),
    TIER: z.string(),
    DEBUG: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
  */
  client: {
    NEXT_PUBLIC_PUSHER_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
    NEXT_PUBLIC_PUSHER_SECRET: z.string(),
    NEXT_PUBLIC_NEXTAUTH_URL: z.string().url(),
    NEXT_PUBLIC_PLACEMENT_TEST_TIME: z.string(),
    NEXT_PUBLIC_EMAIL: z.string(),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    NEXT_PUBLIC_EMAIL: process.env.NEXT_PUBLIC_EMAIL,
    COMMS_EMAIL: process.env.COMMS_EMAIL,
    COMMS_EMAIL_PASS: process.env.COMMS_EMAIL_PASS,
    COMMS_EMAIL_HOST: process.env.COMMS_EMAIL_HOST,
    COMMS_EMAIL_PORT: process.env.COMMS_EMAIL_PORT,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
    NEXT_PUBLIC_PUSHER_SECRET: process.env.NEXT_PUBLIC_PUSHER_SECRET,
    WHATSAPP_APP_ID: process.env.WHATSAPP_APP_ID,
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
    WHATSAPP_VERSION: process.env.WHATSAPP_VERSION,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    ZOOM_CLIENT_ID: process.env.ZOOM_CLIENT_ID,
    ZOOM_CLIENT_SECRET: process.env.ZOOM_CLIENT_SECRET,
    ZOOM_REDIRECT_URI: process.env.ZOOM_REDIRECT_URI,
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    PAYMOB_BASE_URL: process.env.PAYMOB_BASE_URL,
    PAYMOB_API_KEY: process.env.PAYMOB_API_KEY,
    PAYMOB_API_SECRET: process.env.PAYMOB_API_SECRET,
    PAYMOB_PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY,
    NEXT_PUBLIC_PLACEMENT_TEST_TIME: process.env.NEXT_PUBLIC_PLACEMENT_TEST_TIME,
    TIER: process.env.TIER,
    DEBUG: process.env.DEBUG,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
  */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
