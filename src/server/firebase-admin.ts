import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccount = require("@/service_key.json")
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
}

export const firebaseAdmin = admin;