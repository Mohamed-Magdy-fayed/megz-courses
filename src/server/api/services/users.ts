import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt"

export async function getUserById(prisma: PrismaClient, id: string, include?: Prisma.UserFindUniqueArgs["include"]) {
    return await prisma.user.findUnique({ where: { id }, include })
}

export async function createUser(prisma: PrismaClient, data: {
    name: string,
    email: string,
    phone: string,
    password: string,
    emailVerified?: boolean
}, include?: Prisma.UserFindUniqueArgs["include"]) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            hashedPassword,
            phone: data.phone.replace("+", ""),
            emailVerified: data.emailVerified ? new Date() : null,
        }, include
    })
}