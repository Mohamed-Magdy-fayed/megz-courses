import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validCourseStatuses } from "@/lib/enumsTypes";
import { hasPermission } from "@/server/permissions";

export const waitingListRouter = createTRPCRouter({
    queryFullList: protectedProcedure
        .input(z.object({ status: z.enum(validCourseStatuses) }))
        .query(async ({ ctx, input: { status } }) => {
            const fullList = await ctx.prisma.courseStatus.findMany({
                where: {
                    status,
                },
                include: {
                    course: { include: { levels: true, orders: true } },
                    level: true,
                    user: true,
                },
                orderBy: { createdAt: "asc" }
            })

            const statusCounts = await ctx.prisma.courseStatus.groupBy({
                by: ['status'],
                _count: true,
            });

            return { fullList, statusCounts }
        }),
    getFullWaitingList: protectedProcedure
        .query(async ({ ctx }) => {
            const fullList = await ctx.prisma.courseStatus.findMany({
                where: {
                    status: "Waiting",
                },
                include: {
                    course: { include: { levels: true, orders: true } },
                    level: true,
                    user: true,
                },
                orderBy: { createdAt: "asc" }
            })
            return { fullList }
        }),
    addToWaitingList: protectedProcedure
        .input(z.object({
            courseId: z.string(),
            userId: z.string(),
            levelId: z.string(),
            oralFeedback: z.string(),
        }))
        .mutation(async ({ input: { userId, levelId, courseId, oralFeedback }, ctx }) => {
            const PlacementTest = await ctx.prisma.placementTest.findFirst({
                where: { courseId, studentUserId: userId },
            })
            if (PlacementTest && !hasPermission(ctx.session.user, "placementTests", "update", PlacementTest)) throw new TRPCError({ code: "UNAUTHORIZED", message: "You can't take that action!" })

            const user = await ctx.prisma.user.findUnique({ where: { id: userId }, include: { courseStatus: { include: { level: true } } } })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found!" })

            const alreadySubmitted = user.courseStatus.find(s => s.courseId === courseId && s.courseLevelId === levelId)
            if (alreadySubmitted) throw new TRPCError({ code: "BAD_REQUEST", message: `Result submitted already! ${alreadySubmitted.status}` })

            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "course not found!" })

            const status = await ctx.prisma.courseStatus.findMany({
                where: {
                    courseId,
                    userId,
                    courseLevelId: { isSet: false },
                    status: { in: ["PlacementTest", "OrderPaid"] },
                }
            })
            if (!status[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "No courses status found!" })

            const [] = await ctx.prisma.$transaction([
                ctx.prisma.courseStatus.update({
                    where: {
                        id: status[0].id,
                    },
                    data: {
                        status: "Waiting",
                        level: {
                            connect: {
                                id: levelId,
                            }
                        }
                    },
                }),
                ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Student added to Waiting list by ${ctx.session.user.name}`,
                        type: "Info",
                        createdForStudent: { connect: { id: user.id } },
                        messages: [{
                            message: `User was added to Waiting list of course ${course.name} at level ${user.courseStatus.find((s) => courseId === s.courseId)?.level?.name}`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                    }
                }),
                ctx.prisma.placementTest.update({
                    where: { id: PlacementTest?.id },
                    data: { oralFeedback }
                })
            ])

            return { user, course };
        }),
});
