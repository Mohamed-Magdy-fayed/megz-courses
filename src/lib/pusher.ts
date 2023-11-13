import { env } from "../env.mjs";
import PusherServer from "pusher"
import PusherClient from 'pusher-js';

let pusherServer: PusherServer;
let pusherClient: PusherClient;

try {
    pusherServer = new PusherServer({
        appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
        key: env.NEXT_PUBLIC_PUSHER_KEY,
        secret: env.NEXT_PUBLIC_PUSHER_SECRET,
        cluster: "eu",
        useTLS: true
    });
} catch (error) {
    console.error("Pusher server initialization failed:", error);
}

try {
    pusherClient = new PusherClient(env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: 'eu',
    });
} catch (error) {
    console.error("Pusher client initialization failed:", error);
}

export { pusherClient, pusherServer };