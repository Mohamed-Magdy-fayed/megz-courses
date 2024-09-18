import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validCourseStatuses } from "@/lib/enumsTypes";

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
                    status: "waiting",
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
        }))
        .mutation(async ({ input: { userId, levelId, courseId }, ctx }) => {
            const currentUser = await ctx.prisma.user.findUnique({
                where: { id: ctx.session.user.id },
                include: { trainer: true }
            })
            const isAssignedTester = (await ctx.prisma.placementTest.findFirst({
                where: { courseId, studentUserId: userId },
                include: { trainer: true }
            }))?.trainer.userId === ctx.session.user.id

            if (!currentUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "not logged in" })
            if (currentUser.userType !== "teacher" && currentUser.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You can't take that action!" })
            if (!isAssignedTester && currentUser.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You can't take that action!" })

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
                }
            })
            if (!status[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "No courses status found!" })

            await ctx.prisma.courseStatus.update({
                where: {
                    id: status[0].id,
                },
                data: {
                    status: "waiting",
                    level: {
                        connect: {
                            id: levelId,
                        }
                    }
                },
            });

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Student added to waiting list by ${ctx.session.user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: user.id } },
                    messages: [{
                        message: `User was added to waiting list of course ${course.name} at level ${user.courseStatus.find((s) => courseId === s.courseId)?.level?.name}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: ctx.session.user.id } },
                }
            })

            return { user, course };
        }),
});
