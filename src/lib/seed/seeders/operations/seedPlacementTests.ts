import { generateTimestamps, getRandomFutureSharpDate } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/seed/utils/connect";
import { Document, ObjectId, WithId } from "mongodb";
import { seedRootAdmin } from "@/lib/seed/seeders/seedRoot";
import { seedOrders } from "@/lib/seed/seeders/operations/seedOrders";
import { seedTrainers } from "@/lib/seed/seeders/users/seedTrainers";
import { oralTestFeedbackOutcomes } from "@/lib/seed/data/utils";
import { seedForms } from "@/lib/seed/seeders/content/seedForms";
import { seedSalesAgents } from "@/lib/seed/seeders/users/seedSalesAgents";

export const seedPlacementTests = async (
  zoomAccount: Awaited<ReturnType<typeof seedRootAdmin>>["zoomAccount"],
  placementTestsStatuses: Awaited<ReturnType<typeof seedOrders>>["placementTestsStatuses"],
  testers: Awaited<ReturnType<typeof seedTrainers>>["testers"],
  tests: Awaited<ReturnType<typeof seedForms>>["placementTests"],
  agents: Awaited<ReturnType<typeof seedSalesAgents>>["agents"],
) => {
  logInfo("Seeding Placement Tests...");

  const { db, client } = await connectDB();
  const placementTestCollection = db.collection("PlacementTest");
  const zoomSessionCollection = db.collection("ZoomSession");

  logInfo(`${placementTestsStatuses.length} potential placement tests`);

  const testsToInsert: { createdAt: Date; updatedAt: Date; _id: ObjectId; studentUserId: any; courseId: any; writtenTestId: ObjectId | undefined; testerId: ObjectId; createdByUserId: ObjectId; oralTestTime: Date; oralFeedback: string; }[] = []
  const sessionsToInsert: WithId<Document>[] = []

  // Get unique statuses by user-course combination
  const uniqueStatuses = placementTestsStatuses.reduce<Record<string, WithId<Document>>>((acc, status) => {
    const key = `${status.userId}_${status.courseId}`;
    if (!acc[key]) {
      acc[key] = status;
    }
    return acc;
  }, {});

  const uniqueStatusesArray = Object.values(uniqueStatuses);
  logInfo(`Creating ${uniqueStatusesArray.length} unique placement tests`);

  uniqueStatusesArray.map(status => {
    const timestamps = generateTimestamps(status.updatedAt);
    const oralTestTime = getRandomFutureSharpDate(timestamps.updatedAt);
    const writtenTestId = tests.find(t => t.courseId === status.courseId)?._id;

    const placementTestId = new ObjectId();
    const zoomSessionId = new ObjectId();

    if (!writtenTestId) {
      logError(`${status.course.name} has no test`);
    }

    // Create placement test
    testsToInsert.push({
      _id: placementTestId,
      studentUserId: status.userId,
      courseId: status.courseId,
      writtenTestId,
      testerId: faker.helpers.arrayElement(testers).testerId,
      createdByUserId: faker.helpers.arrayElement(agents)._id,
      oralTestTime,
      oralFeedback: faker.helpers.arrayElement(oralTestFeedbackOutcomes),
      ...timestamps,
    });

    // Create zoom session
    sessionsToInsert.push({
      _id: zoomSessionId,
      sessionDate: oralTestTime,
      meetingNumber: "77569231226",
      meetingPassword: "abcd1234",
      sessionStatus: oralTestTime.getTime() < new Date().getTime() ? "Completed" : "Scheduled",
      zoomClientId: zoomAccount._id,
      placementTestId,
      ...timestamps
    });
  });

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await placementTestCollection.insertMany(testsToInsert, { session });
      await zoomSessionCollection.insertMany(sessionsToInsert, { session });
    });

    logSuccess(`Inserted ${testsToInsert.length} Tests`);
    logSuccess(`Inserted ${sessionsToInsert.length} Sessions`);

  } catch (error) {
    logError(`Error during seeding Placement Tests: ${error}`);
  } finally {
    await session.endSession();
  }

  return {
    placementTests: testsToInsert,
    placementTestsZoomSessions: sessionsToInsert,
  }
};