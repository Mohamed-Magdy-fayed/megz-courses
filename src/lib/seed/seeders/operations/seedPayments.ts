import { seedOrders } from "@/lib/seed/seeders/operations/seedOrders";
import { connectDB } from "@/lib/seed/utils/connect";
import { generateTimestamps } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { faker } from "@faker-js/faker";
import { ObjectId } from "mongodb";

export const seedPayments = async (
    orders: Awaited<ReturnType<typeof seedOrders>>["orders"],
) => {
    logInfo('Seeding Payments...')

    const { db, client } = await connectDB()
    const paymentCollection = db.collection("Payment");

    const paymentsToInsert: { createdAt: Date; updatedAt: Date; _id: ObjectId; paymentAmount: any; paymentId: string; paymentProof: string; orderId: ObjectId; userId: any; agentId: ObjectId; }[] = []

    // 2. Create payments for each order
    orders.filter(o => ["Paid", "Refunded"].includes(o.status)).forEach(order => {
        const paymentCount = faker.helpers.weightedArrayElement([
            { value: 1, weight: 0.7 },
            { value: 2, weight: 0.3 }
        ]);

        if (paymentCount === 1) {
            // Single full payment
            paymentsToInsert.push({
                _id: new ObjectId(),
                paymentAmount: order.amount,
                paymentId: `pay_${faker.string.alphanumeric(16)}`,
                paymentProof: faker.image.url(),
                orderId: order._id,
                userId: order.userId,
                agentId: order.agentId,
                ...generateTimestamps(order.updatedAt)
            });
        } else {
            // Split payment (two partial payments)
            const firstPaymentAmount = faker.number.float({
                min: order.amount * 0.3,
                max: order.amount * 0.7
            });
            const secondPaymentAmount = order.amount - firstPaymentAmount;

            paymentsToInsert.push(
                {
                    _id: new ObjectId(),
                    paymentAmount: firstPaymentAmount,
                    paymentId: `pay_${faker.string.alphanumeric(16)}`,
                    paymentProof: faker.image.url(),
                    orderId: order._id,
                    userId: order.userId,
                    agentId: order.agentId,
                    ...generateTimestamps(order.updatedAt)
                },
                {
                    _id: new ObjectId(),
                    paymentAmount: secondPaymentAmount,
                    paymentId: `pay_${faker.string.alphanumeric(16)}`,
                    paymentProof: faker.image.url(),
                    orderId: order._id,
                    userId: order.userId,
                    agentId: order.agentId,
                    ...generateTimestamps(new Date(order.updatedAt.getTime() + 86400000))
                }
            );
        }
    });

    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            await paymentCollection.insertMany(paymentsToInsert, { session });
        });

        logSuccess(`Inserted ${paymentsToInsert.length} Payments`);

    } catch (error) {
        logError(`Error during seeding Payments: ${error}`);
    } finally {
        await session.endSession();
    }

    return {
        payments: paymentsToInsert,
    };
};