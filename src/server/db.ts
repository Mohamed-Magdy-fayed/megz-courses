import { PrismaClient } from "@prisma/client";
import { MongoClient, Db } from 'mongodb';
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// const DATABASE_URL = env.DATABASE_URL

// const globalForMongo = globalThis as unknown as {
//   mongoClient: MongoClient | undefined;
//   mongoDb: Db | undefined;
// };

// export const mongoClient =
//   globalForMongo.mongoClient ??
//   new MongoClient(DATABASE_URL);

// export const mongoDb = globalForMongo.mongoDb ?? mongoClient.db();

// // Connect to the MongoDB server
// (async () => {
//   try {
//     if (!globalForMongo.mongoClient) {
//       await mongoClient.connect();
//       console.log('Connected to MongoDB');
//       globalForMongo.mongoClient = mongoClient;
//       globalForMongo.mongoDb = mongoDb;
//     }
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//     throw error;
//   }
// })();
