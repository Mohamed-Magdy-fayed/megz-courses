import { connectDB } from './utils/connect';
import { logInfo, logSuccess, logError } from './utils/logger';
import { seedUsers } from '@/lib/seed/seeders/users';
import { seedRootAdmin } from '@/lib/seed/seeders/seedRoot';
import { prisma } from '@/server/db';
import { seedContent } from '@/lib/seed/seeders/content';
import { seedOperations } from '@/lib/seed/seeders/operations';
import { setupDefaultMessageTemplates } from '@/lib/whatsApp';

async function main() {
    const { db } = await connectDB();
    const collections = await db.collections()

    logInfo('Seeding database...')
    logInfo('Clearing collections...')

    for (const collection of collections) {
        await collection.deleteMany({})
        logSuccess(`Cleared ${collection.collectionName}`)
    }

    logSuccess('✅ Database has been cleaned!');

    logInfo('Seeding license key...')
    await db.collection("license_key").insertOne({ key: "$2b$10$vNgJlxWIz4cCM.SOw0JrduZCnPtWyT2T23acbzAxgM0aQnOjYCr92" })
    logSuccess('✅ License key seeded')

    await setupDefaultMessageTemplates(prisma)
    const { leadStages, zoomAccount } = await seedRootAdmin()
    const { agents, ...trainers } = await seedUsers()
    const { materials, levels, placementTests, ...content } = await seedContent()
    await seedOperations(agents, leadStages, content, levels, materials, zoomAccount, trainers, placementTests)
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
