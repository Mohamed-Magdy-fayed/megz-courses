import { connectDB } from '../utils/connect';
import { logInfo, logSuccess } from '../utils/logger';
import { faker } from '@faker-js/faker';
import { generatePhone, generateTimestamps } from '@/lib/seed/utils/helpers';
import { validDefaultStages, validUserRoles, validUserScreens } from '@/lib/enumsTypes';
import { ROOT_EMAIL } from '@/server/constants';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export async function seedRootAdmin() {
  const { db, client } = await connectDB();
  const userCollection = db.collection('User');
  const salesAgentCollection = db.collection('SalesAgent');
  const zoomClientCollection = db.collection("ZoomClient")
  const leadStageCollection = db.collection("LeadStage");

  logInfo('Seeding root and admin...');

  const hashedPassword = await bcrypt.hash("Make.12", 10)
  const timeStamps = generateTimestamps()

  const adminId = new ObjectId("681632f6ca2da50fb7a5d7ca");
  const rootId = new ObjectId("681632f6ca2da50fb7a5d7cb");
  const adminAgentId = new ObjectId("681632f6ca2da50fb7a5d7cc");
  const rootAgentId = new ObjectId("681632f6ca2da50fb7a5d7cd");

  const [admin, root] = [
    {
      _id: adminId,
      name: "Admin Megz",
      email: "admin@gmail.com",
      emailVerified: faker.date.past({ years: 2 }),
      hashedPassword,
      phone: generatePhone(),
      image: "/avatars/avatar-anika-visser.png",
      salesAgentId: adminAgentId,
      userRoles: [...validUserRoles],
      userScreens: [...validUserScreens],
      ...timeStamps,
    },
    {
      _id: rootId,
      name: "Root",
      email: ROOT_EMAIL,
      emailVerified: faker.date.past({ years: 2 }),
      hashedPassword,
      phone: generatePhone(),
      image: "/avatars/avatar-anika-visser.png",
      salesAgentId: rootAgentId,
      userRoles: [...validUserRoles],
      userScreens: [...validUserScreens],
      ...timeStamps,
    },
  ]
  const zoomAccount = {
    _id: new ObjectId(),
    name: "Zoom Account",
    isZoom: true,
    encodedIdSecret: "TmhDeVU5SGZRZmV4Vmt1VUgxWXpWUTplR2xwN09hTzVsc2ZSdUxzcXZ1NGRSN0FIeXBhWjNQVg==",
    accessToken: "eyJzdiI6IjAwMDAwMiIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjgxYmJkNTkyLTYzMDEtNDY3Ni1hZjNmLTdlYWYzY2M4ZjBhOSJ9.eyJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJMei1QMVNaYlFudUI4dzNodDdWVFlnIiwidmVyIjoxMCwiYXVpZCI6Ijc3N2YzMjUxNWI4MWI3YmJlZWMxZDVjMDRlNGQxN2Y5YzBkMDdlZWI4ODcyOGM3ZjljNmUxNzY5MzNjNmNjMWMiLCJuYmYiOjE3NDYxMjI5MDcsImNvZGUiOiJNMlNDSkduMVhSa1dNWm5sYmt2UVJDYVJFdG1Wb2lYM0EiLCJpc3MiOiJ6bTpjaWQ6TmhDeVU5SGZRZmV4Vmt1VUgxWXpWUSIsImdubyI6MCwiZXhwIjoxNzQ2MTI2NTA3LCJ0eXBlIjowLCJpYXQiOjE3NDYxMjI5MDcsImFpZCI6ImV1RF9vYmo1VC1hdmxQa3M3SHVwLVEifQ.rdatIV4d6PKEqgUjayuClqNDRNX5W3xC5R9eLFidgeJcjeeAjxm1EMfl1dFYfsGXHT085L25YOjCNHh3NmjVuw",
    refreshToken: "eyJzdiI6IjAwMDAwMiIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6Ijk3Y2Q2NTQ2LTc3ZTYtNDU1MC05MWI2LTI3ODNiODk4ZGFlNyJ9.eyJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJMei1QMVNaYlFudUI4dzNodDdWVFlnIiwidmVyIjoxMCwiYXVpZCI6Ijc3N2YzMjUxNWI4MWI3YmJlZWMxZDVjMDRlNGQxN2Y5YzBkMDdlZWI4ODcyOGM3ZjljNmUxNzY5MzNjNmNjMWMiLCJuYmYiOjE3NDYxMjI5MDcsImNvZGUiOiJNMlNDSkduMVhSa1dNWm5sYmt2UVJDYVJFdG1Wb2lYM0EiLCJpc3MiOiJ6bTpjaWQ6TmhDeVU5SGZRZmV4Vmt1VUgxWXpWUSIsImdubyI6MCwiZXhwIjoxNzUzODk4OTA3LCJ0eXBlIjoxLCJpYXQiOjE3NDYxMjI5MDcsImFpZCI6ImV1RF9vYmo1VC1hdmxQa3M3SHVwLVEifQ.d6cnhtaz5c6hZgQGgGEDyj7NvFIgNXoRNHN877fO0NmKg3OxJrEVsXJorRG5CEZYkuSpKvhn3hXbOMR0_lVhdg",
    ...generateTimestamps(),
  }
  const leadStages = validDefaultStages.map((stage, index) => ({
    _id: new ObjectId(),
    name: stage,
    defaultStage: stage,
    order: index + 1,
    ...generateTimestamps()
  }));

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      await userCollection.insertMany([admin, root], { session });
      await salesAgentCollection.insertMany([{ userId: adminId, ...timeStamps, }, { userId: rootId, ...timeStamps, }], { session });
      await zoomClientCollection.insertOne(zoomAccount, { session });
      await leadStageCollection.insertMany(leadStages, { session });
    });

    logSuccess('Root&Admin seeded successfully!');
  } catch (error) {
    console.error("Error during seeding transaction:", error);
  } finally {
    await session.endSession();
  }

  return {
    admin,
    root,
    zoomAccount,
    leadStages,
  };
}
