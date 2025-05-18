import { connectDB } from './utils/connect';
import { logInfo, logSuccess, logError } from './utils/logger';
import { seedUsers } from '@/lib/seed/seeders/users';
import { seedRootAdmin } from '@/lib/seed/seeders/seedRoot';
import { prisma } from '@/server/db';
import { seedContent } from '@/lib/seed/seeders/content';
import { seedOperations } from '@/lib/seed/seeders/operations';
import { setupDefaultMessageTemplates } from '@/lib/whatsApp';
import { faker } from '@faker-js/faker';
import { validNotificationChannels, validNotificationTypes } from '@/lib/enumsTypes';
import { notificationTemplates } from '@/lib/seed/data/utils';
import { generateTimestamps } from '@/lib/seed/utils/helpers';

async function main() {
    const { db } = await connectDB();
    // const collections = await db.collections()

    // logInfo('Seeding database...')
    // logInfo('Clearing collections...')

    // for (const collection of collections) {
    //     await collection.deleteMany({})
    //     logSuccess(`Cleared ${collection.collectionName}`)
    // }

    // logSuccess('✅ Database has been cleaned!');

    // logInfo('Seeding license key...')
    // await db.collection("license_key").insertOne({ key: "$2b$10$vNgJlxWIz4cCM.SOw0JrduZCnPtWyT2T23acbzAxgM0aQnOjYCr92" })
    // logSuccess('✅ License key seeded')

    // await setupDefaultMessageTemplates(prisma)
    // const { leadStages, zoomAccount } = await seedRootAdmin()
    // const { agents, ...trainers } = await seedUsers()
    // const { materials, levels, placementTests, ...content } = await seedContent()
    // await seedOperations(agents, leadStages, content, levels, materials, zoomAccount, trainers, placementTests)
    const users = await db.collection("User").find().toArray()
    await db.collection("Notification").insertMany(users.flatMap(user => {
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
}

main()
    .then(() => {
        logSuccess('✅ All seeding completed!');
        process.exit(0);
    })
    .catch(err => {
        logError(`❌ Seeding error: ${err}`);
        process.exit(1);
    });
