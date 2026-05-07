import { MongoClient } from "mongodb";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnvFile(fileName: string) {
    const filePath = resolve(process.cwd(), fileName);
    if (!existsSync(filePath)) return;

    const content = readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        const equalIndex = line.indexOf("=");
        if (equalIndex <= 0) continue;

        const key = line.slice(0, equalIndex).trim();
        let value = line.slice(equalIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

function loadEnv() {
    loadDotEnvFile(".env.local");
    loadDotEnvFile(".env");
}

async function run() {
    loadEnv();

    const uri = process.env.DATABASE_URL;
    if (!uri) throw new Error("DATABASE_URL is required");

    const shouldApply = process.argv.includes("--apply");
    const mode = shouldApply ? "APPLY" : "DRY-RUN";

    const client = new MongoClient(uri);
    await client.connect();

    try {
        const db = client.db();
        const usersCollection = db.collection("User");

        const admins = await usersCollection.find(
            { userRoles: "Admin" },
            { projection: { _id: 1, email: 1, userScreens: 1 } }
        ).toArray();

        const missing = admins.filter((admin) => {
            const screens = Array.isArray(admin.userScreens) ? admin.userScreens : [];
            return !screens.includes("certificates");
        });

        if (shouldApply && missing.length > 0) {
            await usersCollection.updateMany(
                { userRoles: "Admin" },
                { $addToSet: { userScreens: "certificates" } }
            );
        }

        console.log(`[${mode}] Admin users checked: ${admins.length}`);
        console.log(`[${mode}] Admin users missing certificates screen ${shouldApply ? "before apply" : "found"}: ${missing.length}`);
        if (!shouldApply) {
            console.log("[DRY-RUN] No writes performed. Re-run with --apply to persist changes.");
        } else {
            console.log("[APPLY] Certificates screen added to admin users.");
        }
    } finally {
        await client.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
