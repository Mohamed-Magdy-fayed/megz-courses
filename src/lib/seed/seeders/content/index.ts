import { logInfo, logSuccess } from '@/lib/seed/utils/logger';
import { seedCourses } from '@/lib/seed/seeders/content/seedCourses';
import { seedLevels } from '@/lib/seed/seeders/content/seedLevels';
import { seedMaterials } from '@/lib/seed/seeders/content/seedMaterials';
import { seedForms } from '@/lib/seed/seeders/content/seedForms';

export async function seedContent() {
    logInfo('Seeding content...')

    const { courses, products, productItems } = await seedCourses()
    const { levels } = await seedLevels(courses)
    const { materials } = await seedMaterials(levels)
    const { placementTests } = await seedForms(courses, levels, materials)

    logSuccess('✅ Seeded content')
    return { materials, levels, courses, products, productItems, placementTests }
}
