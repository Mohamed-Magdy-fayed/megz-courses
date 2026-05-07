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
    loadDotEnvFile(".env.local");
    loadDotEnvFile(".env");
}

type CourseLevelDoc = {
    _id: ObjectId;
    courseId?: ObjectId | null;
    levelOrder?: number | null;
    createdAt?: Date;
};

type SystemFormDoc = {
    _id: ObjectId;
    type?: string;
    courseId?: ObjectId | null;
    courseLevelId?: ObjectId | null;
};

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
        const levelsCollection = db.collection<CourseLevelDoc>("CourseLevel");
        const formsCollection = db.collection<SystemFormDoc>("SystemForm");

        console.log(`[${mode}] Starting data repair`);

        // 1) Normalize CourseLevel.levelOrder per course to strict 0..N sequence.
        const levels = await levelsCollection
            .find(
                { courseId: { $ne: null } },
                { projection: { _id: 1, courseId: 1, levelOrder: 1, createdAt: 1 } }
            )
            .sort({ courseId: 1, createdAt: 1, _id: 1 })
            .toArray();

        const levelCounterByCourse = new Map<string, number>();
        let levelOrderFixes = 0;

        for (const level of levels) {
            if (!level.courseId) continue;

            const courseId = level.courseId.toString();
            const expectedOrder = levelCounterByCourse.get(courseId) ?? 0;
            const currentOrder = typeof level.levelOrder === "number" ? level.levelOrder : null;

            if (currentOrder !== expectedOrder) {
                levelOrderFixes += 1;
                if (shouldApply) {
                    await levelsCollection.updateOne(
                        { _id: level._id },
                        { $set: { levelOrder: expectedOrder } }
                    );
                }
            }

            levelCounterByCourse.set(courseId, expectedOrder + 1);
        }

        // 2) Backfill SystemForm.courseId from CourseLevel.courseId where missing.
        const formsNeedingCourse = await formsCollection
            .find(
                {
                    courseId: null,
                    courseLevelId: { $ne: null },
                },
                { projection: { _id: 1, type: 1, courseId: 1, courseLevelId: 1 } }
            )
            .toArray();

        let formCourseBackfills = 0;
        let unresolvedForms = 0;

        for (const form of formsNeedingCourse) {
            if (!form.courseLevelId) {
                unresolvedForms += 1;
                continue;
            }

            const level = await levelsCollection.findOne(
                { _id: form.courseLevelId },
                { projection: { _id: 1, courseId: 1 } }
            );

            if (!level?.courseId) {
                unresolvedForms += 1;
                continue;
            }

            formCourseBackfills += 1;
            if (shouldApply) {
                await formsCollection.updateOne(
                    { _id: form._id },
                    { $set: { courseId: level.courseId } }
                );
            }
        }

        console.log(`[${mode}] Course levels checked: ${levels.length}`);
        console.log(`[${mode}] Course levelOrder fixes ${shouldApply ? "applied" : "found"}: ${levelOrderFixes}`);
        console.log(`[${mode}] SystemForm.courseId backfills ${shouldApply ? "applied" : "found"}: ${formCourseBackfills}`);
        console.log(`[${mode}] System forms still unresolved: ${unresolvedForms}`);

        if (!shouldApply) {
            console.log("[DRY-RUN] No writes performed. Re-run with --apply to persist fixes.");
        } else {
            console.log("[APPLY] Data repair complete.");
        }
    } finally {
        await client.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
