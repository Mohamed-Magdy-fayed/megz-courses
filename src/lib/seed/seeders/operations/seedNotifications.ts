import { ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/seed/utils/connect";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { notificationTemplates } from "@/lib/seed/data/utils";
import { validNotificationTypes, validNotificationChannels } from "@/lib/enumsTypes";
import { generateTimestamps } from "@/lib/seed/utils/helpers";

export const seedNotifications = async (
) => {
    logInfo('Seeding Notifications...')

    const { db, client } = await connectDB()
    const notificationCollection = db.collection("Notification");

    // 2. Create notifications for each order
    const notificationsToInsert: { _id: ObjectId; notificationId: string; notificationProof: string; notificationAmount: any; orderId: ObjectId; userId: any; agentId: ObjectId; createdAt: Date; updatedAt: Date; }[] = []

    const session = client.startSession();

    try {
        const users = await db.collection("User").find().toArray()
        await notificationCollection.insertMany(users.flatMap(user => {
            return faker.helpers.multiple(() => {
                const notification = faker.helpers.arrayElement(notificationTemplates)

                return {
                    userId: user._id,
                    type: faker.helpers.arrayElement(validNotificationTypes),
                    title: notification.title,
                    message: notification.message,
                    isRead: false,
                    sent: false,
                    channel: faker.helpers.arrayElement(validNotificationChannels),
                    ...generateTimestamps(user.updatedAt)
                }
            }, { count: { min: 100, max: 300 } })
        }))

        logSuccess(`Inserted ${notificationsToInsert.length} Payments`);

    } catch (error) {
        logError(`Error during seeding Payments: ${error}`);
    } finally {
        await session.endSession();
    }

    return {
        notifications: notificationsToInsert,
    };
};