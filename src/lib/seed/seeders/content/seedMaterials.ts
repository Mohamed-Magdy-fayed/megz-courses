import { connectDB } from "@/lib/seed/utils/connect";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { seedLevels } from "@/lib/seed/seeders/content/seedLevels";
import { ObjectId } from "mongodb";
import { courses } from "@/lib/seed/data/courses";

type Levels = Awaited<ReturnType<typeof seedLevels>>["levels"]

export const seedMaterials = async (allLevels: Levels) => {
  logInfo("Seeding Materials...");

  const { db, client } = await connectDB();
  const materialsCollection = db.collection("MaterialItem");

  const materials: { _id: ObjectId; title: string; subTitle: string; slug: string; sessionOrder: number; uploads: string[]; type: string; courseLevelId: ObjectId; createdAt: Date; updatedAt: Date; }[] = [];

  const slugToId = new Map<string, Levels[number]>(
    allLevels.map((lvl) => [lvl.slug, lvl])
  );

  for (const course of courses) {
    for (const level of course.levels) {
      const insertedLevel = slugToId.get(level.slug)
      const courseLevelId = insertedLevel?._id;
      if (!courseLevelId) {
        logError(`Level not found for slug: ${level.slug}`);
        continue;
      }

      for (const [idx, material] of level.materials.entries()) {
        materials.push({
          _id: new ObjectId(),
          title: material.title,
          subTitle: material.subTitle,
          slug: material.slug,
          sessionOrder: idx + 1,
          uploads: material.uploads,
          type: "Upload",
          courseLevelId,
          createdAt: insertedLevel.createdAt,
          updatedAt: insertedLevel.updatedAt,
        });
      }
    }
  }

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await materialsCollection.insertMany(materials, { session });
    });

    logSuccess(`Inserted ${materials.length} Materials`);
  } catch (error) {
    console.error("Error during seeding Materials:", error);
  } finally {
    await session.endSession();
  }

  return { materials };
};