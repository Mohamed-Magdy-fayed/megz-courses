import { Prisma, PrismaClient } from "@prisma/client";

export async function createLead(prisma: PrismaClient, data: Prisma.LeadCreateArgs["data"], include?: Prisma.LeadCreateArgs["include"]) {
    return await prisma.lead.create({ data, include })
}