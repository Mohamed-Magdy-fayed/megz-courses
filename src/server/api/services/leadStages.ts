import { Prisma, PrismaClient } from "@prisma/client";

export async function getLeadStage(prisma: PrismaClient, where: Prisma.LeadStageFindUniqueArgs["where"], include?: Prisma.LeadStageFindUniqueArgs["include"]) {
    return await prisma.leadStage.findUnique({ where, include })
}