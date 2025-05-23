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
    const notificationsToInsert: { createdAt: Date; updatedAt: Date; userId: ObjectId; type: "Info" | "Success" | "Warning" | "Error" | "Custom"; title: string; message: string; isRead: boolean; sent: boolean; channel: "InApp" | "Email" | "Push" | "SMS"; }[] = []

    const session = client.startSession();

    try {
        const users = await db.collection("User").find().toArray()
        users.forEach(user => {
            return faker.helpers.multiple(() => {
                const notification = faker.helpers.arrayElement(notificationTemplates)

                notificationsToInsert.push({
                    userId: user._id,
                    type: faker.helpers.arrayElement(validNotificationTypes),
                    title: notification.title,
                    message: notification.message,
                    isRead: false,
                    sent: false,
                    channel: faker.helpers.arrayElement(validNotificationChannels),
                    ...generateTimestamps(user.updatedAt)
                })
            }, { count: { min: 100, max: 300 } })
        })

        await notificationCollection.insertMany(notificationsToInsert)

        logSuccess(`Inserted ${notificationsToInsert.length} Notifications`);

    } catch (error) {
        logError(`Error during seeding Notifications: ${error}`);
    } finally {
        await session.endSession();
    }

    return {
        notifications: notificationsToInsert,
    };
};