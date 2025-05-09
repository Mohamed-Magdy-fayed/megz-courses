import { generateTimestamps } from "@/lib/seed/utils/helpers";
import { logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { connectDB } from "@/lib/seed/utils/connect";
import { Document, ObjectId, WithId } from "mongodb";
import { trainersData } from "@/lib/seed/data/trainers";

export const seedTrainers = async () => {
  logInfo("Seeding Trainers...");

  const { db, client } = await connectDB();
  const usersCollection = db.collection("User");
  const teachersCollection = db.collection("Teacher");
  const testersCollection = db.collection("Tester");

  // Process all trainers in sequence
  const users: WithId<Document>[] = []
  const teachers: WithId<Document>[] = []
  const testers: WithId<Document>[] = []

  const ROLE_MAP = {
    Teacher: (trainerId: ObjectId, userId: ObjectId, timeStamps: any) => {
      teachers.push({ _id: trainerId, userId, ...timeStamps });
      return { teacherId: trainerId };
    },
    Tester: (trainerId: ObjectId, userId: ObjectId, timeStamps: any) => {
      testers.push({ _id: trainerId, userId, ...timeStamps });
      return { testerId: trainerId };
    }
  };

  for (const trainer of trainersData) {
    const userId = new ObjectId();
    const trainerId = new ObjectId();
    const timeStamps = generateTimestamps();
    const role = trainer.trainerRole as keyof typeof ROLE_MAP;

    if (!ROLE_MAP[role]) continue;

    const roleSpecificField = ROLE_MAP[role](trainerId, userId, timeStamps);

    users.push({
      _id: userId,
      name: trainer.name,
      email: trainer.email,
      emailVerified: new Date(),
      hashedPassword: trainer.password,
      phone: trainer.phone,
      image: trainer.image,
      userRoles: [role],
      ...roleSpecificField,
      ...timeStamps,
    });

  }

  // After building seededProducts, seededCourses, seededProductItems arrays
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await usersCollection.insertMany(users, { session });
      await teachersCollection.insertMany(teachers, { session });
      await testersCollection.insertMany(testers, { session });
    });

    logSuccess(`Inserted ${users.length} Trainers`);

  } catch (error) {
    console.error("Error during seeding Trainers:", error);
  } finally {
    await session.endSession();
  }

  return {
    teachers: users.filter(u => u.teacherId),
    testers: users.filter(u => u.testerId),
  };
};