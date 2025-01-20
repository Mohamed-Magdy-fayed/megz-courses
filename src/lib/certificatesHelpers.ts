import { env } from "@/env.mjs";
import { PrismaClient } from "@prisma/client"
import { TRPCError } from "@trpc/server";
import { Session } from "next-auth"

export const generateCertificateId = () => {
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
    return `${timestamp}-${randomString}`.toUpperCase();
};

export async function generateCertificate({ ctx, courseSlug, levelSlug, score }: {
    ctx: { prisma: PrismaClient, session: Session };
    courseSlug: string;
    levelSlug: string;
    score: string;
}) {
    const course = await ctx.prisma.course.findUnique({ where: { slug: courseSlug }, select: { id: true } })
    if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

    const certificate = await ctx.prisma.certificate.create({
        data: {
            certificateId: generateCertificateId(),
            completionDate: new Date(),
            user: { connect: { id: ctx.session.user.id } },
            course: { connect: { slug: courseSlug } },
            courseLevel: { connect: { courseId_slug: { slug: levelSlug, courseId: course.id } } },
        },
        include: { user: true, course: true, courseLevel: true }
    })

    await ctx.prisma.userNote.create({
        data: {
            sla: 0,
            status: "Closed",
            title: `Student final test submitted with score ${score}`,
            type: "Info",
            messages: [{
                message: `Final test submitted and user certificate was Created ${certificate.certificateId}\nCertificate URL: ${env.NEXTAUTH_URL}certificates/${certificate.certificateId}`,
                updatedAt: new Date(),
                updatedBy: "System"
            }],
            createdByUser: { connect: { id: ctx.session.user.id } },
            createdForStudent: { connect: { id: ctx.session.user.id } }
        }
    })

    return certificate
}