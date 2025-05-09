import { logInfo, logSuccess } from '@/lib/seed/utils/logger';
import { seedLeads } from '@/lib/seed/seeders/operations/seedLeads';
import { seedOrders } from '@/lib/seed/seeders/operations/seedOrders';
import { seedPlacementTests } from '@/lib/seed/seeders/operations/seedPlacementTests';
import { seedSalesAgents } from '@/lib/seed/seeders/users/seedSalesAgents';
import { seedPayments } from '@/lib/seed/seeders/operations/seedPayments';
import { seedRefunds } from '@/lib/seed/seeders/operations/seedRefunds';
import { seedSubmissions } from '@/lib/seed/seeders/operations/seedSubmissions';
import { seedGroups } from '@/lib/seed/seeders/operations/seedGroups';
import { seedRootAdmin } from '@/lib/seed/seeders/seedRoot';
import { seedCourses } from '@/lib/seed/seeders/content/seedCourses';
import { seedTrainers } from '@/lib/seed/seeders/users/seedTrainers';
import { seedForms } from '@/lib/seed/seeders/content/seedForms';
import { seedLevels } from '@/lib/seed/seeders/content/seedLevels';
import { seedMaterials } from '@/lib/seed/seeders/content/seedMaterials';

export async function seedOperations(
    agents: Awaited<ReturnType<typeof seedSalesAgents>>["agents"],
    stages: Awaited<ReturnType<typeof seedRootAdmin>>["leadStages"],
    content: Awaited<ReturnType<typeof seedCourses>>,
    levels: Awaited<ReturnType<typeof seedLevels>>["levels"],
    materials: Awaited<ReturnType<typeof seedMaterials>>["materials"],
    zoomAccount: Awaited<ReturnType<typeof seedRootAdmin>>["zoomAccount"],
    trainers: Awaited<ReturnType<typeof seedTrainers>>,
    tests: Awaited<ReturnType<typeof seedForms>>["placementTests"],
) {
    logInfo('Seeding Operations...')

    const { leads } = await seedLeads(stages, agents)
    const { orders, placementTestsStatuses, courseStatuses } = await seedOrders(content, leads, levels)
    await seedPayments(orders)
    await seedRefunds(orders)
    const { placementTests } = await seedPlacementTests(zoomAccount, placementTestsStatuses, trainers.testers, tests, agents)
    await seedSubmissions(placementTests, tests)
    await seedGroups(zoomAccount, courseStatuses, trainers.teachers, materials)
    // await seedNotes()

    logSuccess('✅ Seeded Operations')
}
