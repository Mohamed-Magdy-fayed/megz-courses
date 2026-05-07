import { MongoClient, ObjectId } from "mongodb";
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
    // Match Next.js-style precedence for local execution.
    loadDotEnvFile(".env.local");
    loadDotEnvFile(".env");
}

async function run() {
    loadEnv();

    const uri = process.env.DATABASE_URL;
    if (!uri) throw new Error("DATABASE_URL is required");

    const client = new MongoClient(uri);
    await client.connect();

    try {
        const db = client.db();
        const levelsCollection = db.collection("CourseLevel");
        const productsCollection = db.collection("ProductItem");

        const levels = await levelsCollection
            .find({}, { projection: { _id: 1, courseId: 1, createdAt: 1 } })
            .sort({ courseId: 1, createdAt: 1, _id: 1 })
            .toArray();

        const levelOrderByCourse = new Map<string, number>();
        for (const level of levels) {
            const courseId = (level.courseId as ObjectId | undefined)?.toString();
            if (!courseId) continue;

            const nextOrder = levelOrderByCourse.get(courseId) ?? 0;
            await levelsCollection.updateOne(
                { _id: level._id },
                { $set: { levelOrder: nextOrder } }
            );
            levelOrderByCourse.set(courseId, nextOrder + 1);
        }

        const grouped = await productsCollection
            .aggregate<{
                _id: { productId: ObjectId; courseId: ObjectId };
                levelIds: (ObjectId | null)[];
            }>([
                {
                    $group: {
                        _id: { productId: "$productId", courseId: "$courseId" },
                        levelIds: { $addToSet: "$courseLevelId" },
                    },
                },
            ])
            .toArray();

        for (const group of grouped) {
            const levelsCount = group.levelIds.filter((id) => id !== null).length;
            await productsCollection.updateMany(
                {
                    productId: group._id.productId,
                    courseId: group._id.courseId,
                },
                {
                    $set: {
                        levelsCount: Math.max(1, levelsCount),
                    },
                }
            );
        }

        console.log("Migration 1 complete: levelOrder and levelsCount backfilled.");
    } finally {
        await client.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
