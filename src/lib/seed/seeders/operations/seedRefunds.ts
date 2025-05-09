import { Document, ObjectId, OptionalId } from "mongodb";
import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/seed/utils/connect";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { seedOrders } from "@/lib/seed/seeders/operations/seedOrders";

export const seedRefunds = async (
    orders: Awaited<ReturnType<typeof seedOrders>>["orders"],
) => {
    logInfo('Seeding Refunds...')

    const { db, client } = await connectDB()
    const refundCollection = db.collection("Refund");

    // 2. Create refunds for each order
    const refundsToInsert: { _id: ObjectId; refundId: string; refundProof: string; refundAmount: any; orderId: ObjectId; userId: any; agentId: ObjectId; createdAt: Date; updatedAt: Date; }[] = []

    orders.filter(o => o.status === "Refunded").forEach(order => {
        refundsToInsert.push({
            _id: new ObjectId(),
            refundId: `ref_${faker.string.alphanumeric(16)}`,
            refundProof: faker.image.url(),
            refundAmount: order.amount,
            orderId: order._id,
            userId: order.userId,
            agentId: order.agentId,
            createdAt: new Date(order.createdAt.getTime() + 86400000 * faker.number.int({ min: 1, max: 14 })), // 1-14 days after order
            updatedAt: new Date()
        })
    });

    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            await refundCollection.insertMany(refundsToInsert, { session });
        });

        logSuccess(`Inserted ${refundsToInsert.length} Payments`);

    } catch (error) {
        logError(`Error during seeding Payments: ${error}`);
    } finally {
        await session.endSession();
    }

    return {
        refunds: refundsToInsert,
    };
};