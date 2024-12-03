import { Prisma, PrismaClient } from "@prisma/client";

export async function getCourseById(prisma: PrismaClient, id: string, include?: Prisma.CourseFindUniqueArgs["include"]) {
    return await prisma.course.findUnique({ where: { id }, include })
}