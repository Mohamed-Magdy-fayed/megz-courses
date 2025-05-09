import { connectDB } from "@/lib/seed/utils/connect";
import { logInfo, logSuccess, logError } from "@/lib/seed/utils/logger";
import { ObjectId } from "mongodb";
import { seedCourses } from "@/lib/seed/seeders/content/seedCourses";
import { courses } from "@/lib/seed/data/courses";

export const seedLevels = async (
  allCourses: Awaited<ReturnType<typeof seedCourses>>["courses"]
) => {
  logInfo("Seeding Levels...");

  const { db, client } = await connectDB();
  const levelsCollection = db.collection("CourseLevel");

  const levels: { _id: ObjectId; name: string; slug: string; courseId: ObjectId; createdAt: Date; updatedAt: Date; }[] = [];

  const slugToId = new Map<string, ObjectId>(
    allCourses.map((c) => [c.slug, c._id])
  );

  for (const course of courses) {
    const courseId = slugToId.get(course.slug);
    if (!courseId) {
      logError(`Course not found for slug: ${course.slug}`);
      continue;
    }

    for (const level of course.levels) {
      levels.push({
        _id: new ObjectId(),
        name: level.name,
        slug: level.slug,
        courseId,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      });
    }
  }

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await levelsCollection.insertMany(levels, { session });
    });

    logSuccess(`Inserted ${levels.length} Levels`);
  } catch (error) {
    console.error("Error during seeding Levels:", error);
  } finally {
    await session.endSession();
  }

  return { levels };
};
