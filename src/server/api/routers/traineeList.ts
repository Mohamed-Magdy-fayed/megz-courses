import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { validCourseStatuses } from "@/lib/enumsTypes";

export const traineeListRouter = createTRPCRouter({
    queryFullList: protectedProcedure
        .input(z.object({
            status: z.enum(validCourseStatuses),
        }))
        .query(async ({ ctx, input: { status } }) => {
            const rows = await ctx.prisma.courseStatus.findMany({
                where: {
                    status,
                },
                include: {
                    course: { include: { levels: true, orders: true } },
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
