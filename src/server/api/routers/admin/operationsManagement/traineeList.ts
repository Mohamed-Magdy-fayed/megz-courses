import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { validCourseStatuses } from "@/lib/enumsTypes";

export const traineeListRouter = createTRPCRouter({
    getLevelWaitingList: protectedProcedure
        .input(z.object({
            levelId: z.string(),
        }))
        .query(async ({ ctx, input: { levelId } }) => {
            const rows = await ctx.prisma.courseStatus.findMany({
                where: {
                    courseLevelId: levelId,
                    status: "Waiting",
                },
                include: {
                    user: true,
                },
                orderBy: { updatedAt: "desc" }
            })

            return { rows }
        }),
    queryFullList: protectedProcedure
        .input(z.object({
            status: z.enum(validCourseStatuses),
            courseId: z.string().optional(),
        }))
        .query(async ({ ctx, input: { status, courseId } }) => {
            const rows = await ctx.prisma.courseStatus.findMany({
                where: {
                    status,
                    ...(courseId ? { course: { id: courseId } } : {}),
                },
                include: {
                    course: { include: { levels: true } },
                    level: true,
                    user: true,
                },
                orderBy: { updatedAt: "desc" }
            })

            return { rows }
        }),
    getListsCount: protectedProcedure
        .query(async ({ ctx }) => {
            const statusCounts = await ctx.prisma.courseStatus.groupBy({
                by: ['status'],
                _count: true,
            });

            return { statusCounts }
        }),
});
