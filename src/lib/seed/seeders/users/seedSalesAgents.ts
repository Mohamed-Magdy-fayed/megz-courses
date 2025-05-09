import { salesAgentsData } from "@/lib/seed/data/agents";
import { connectDB } from "@/lib/seed/utils/connect";
import { generateTimestamps } from "@/lib/seed/utils/helpers";
import { logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { ObjectId, WithId, Document, OptionalId } from "mongodb";

export const seedSalesAgents = async () => {
  logInfo("Seeding Agents...");

  const { db, client } = await connectDB();
  const usersCollection = db.collection("User");
  const agentsCollection = db.collection("SalesAgent");

  const users: { createdAt: Date; updatedAt: Date; _id: ObjectId; name: string; email: string; emailVerified: Date; hashedPassword: string; phone: string; image: string; salesAgentId: ObjectId; userRoles: ("SalesAgent" | "OperationAgent")[]; }[] = [];
  const agents: { createdAt: Date; updatedAt: Date; _id: ObjectId; userId: ObjectId; }[] = [];

  for (const agent of salesAgentsData) {
    const userId = new ObjectId();
    const agentId = new ObjectId();
    const timeStamps = generateTimestamps();

    users.push({
      _id: userId,
      name: agent.name,
      email: agent.email,
      emailVerified: new Date(),
      hashedPassword: agent.password,
      phone: agent.phone,
      image: agent.image,
      salesAgentId: agentId,
      userRoles: [agent.agentType],
      ...timeStamps,
    });

    agents.push({
      _id: agentId,
      userId,
      ...timeStamps,
    });
  }

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await usersCollection.insertMany(users, { session });
      await agentsCollection.insertMany(agents, { session });
    });

    logSuccess(`Inserted ${users.length} Agents`);
  } catch (error) {
    console.error("Error during seeding Agents:", error);
  } finally {
    await session.endSession();
  }

  return {
    agents: users,
  };
};
