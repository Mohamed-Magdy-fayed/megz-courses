import { seedTrainers } from '@/lib/seed/seeders/users/seedTrainers';
import { seedSalesAgents } from '@/lib/seed/seeders/users/seedSalesAgents';
import { logInfo, logSuccess } from '@/lib/seed/utils/logger';

export async function seedUsers() {
    logInfo('Seeding users...')

    const { agents } = await seedSalesAgents()
    const trainers = await seedTrainers()

    logSuccess('✅ Seeded users')
    return { agents, ...trainers }
}
