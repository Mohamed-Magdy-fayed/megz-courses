import { seedForms } from "@/lib/seed/seeders/content/seedForms";
import { seedPlacementTests } from "@/lib/seed/seeders/operations/seedPlacementTests";
import { connectDB } from "@/lib/seed/utils/connect";
import { generateTimestamps, getSubmissionScore } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { faker } from "@faker-js/faker";
import { Document, ObjectId, WithId } from "mongodb";

export const seedSubmissions = async (
    placementTests: Awaited<ReturnType<typeof seedPlacementTests>>["placementTests"],
    testForms: Awaited<ReturnType<typeof seedForms>>["placementTests"],
) => {
    logInfo("Seeding Placement Test Submissions...");

    const { db, client } = await connectDB();
    const submissionsCollection = db.collection("SystemFormSubmission");

    const submittedPlacementTests = placementTests.filter(t => t.oralTestTime < new Date())
    const submissionsToInsert: WithId<Document>[] = []

    submittedPlacementTests.map((test) => {
        const form = testForms.find(f => f._id === test.writtenTestId)
        if (!form) return logError("Test form not found!")

        const answers: {
            questionId: ObjectId;
            textAnswer: string | null;
            isCorrect: boolean;
            selectedAnswers: string[];
        }[] = form.items.flatMap(item => {
            return item.questions.map(question => {
                const selectedAnswers = faker.helpers.arrayElements(question.options.map(o => o.value), { min: 0, max: 3 })
                return ({
                    questionId: question._id,
                    selectedAnswers,
                    textAnswer: faker.datatype.boolean() ? faker.lorem.sentence() : null,
                    isCorrect: selectedAnswers.every(answer => question.options.some(o => o.value === answer && o.isCorrect)),
                })
            })
        });

        submissionsToInsert.push({
            _id: new ObjectId(),
            answers,
            totalScore: getSubmissionScore(form.items.flatMap(i => i.questions), answers),
            studentId: test.studentUserId,
            systemFormId: test.writtenTestId,
            placementTestId: test._id,
            ...generateTimestamps(test.createdAt),
        });
    });

    const session = client.startSession();
    try {
        await session.withTransaction(async () => {
            await submissionsCollection.insertMany(submissionsToInsert, { session });
        });

        logSuccess(`Inserted ${submissionsToInsert.length} Submissions`);
    } catch (error) {
        logError(`Error during seeding Submissions: ${error}`);
    } finally {
        await session.endSession();
    }

    return {
        submissions: submissionsToInsert,
    };
};
