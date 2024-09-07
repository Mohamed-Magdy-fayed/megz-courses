import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const waitingListRouter = createTRPCRouter({
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

            const user = await ctx.prisma.user.findUnique({ where: { id: userId }, include: { courseStatus: true } })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found!" })

            const alreadySubmitted = user.courseStatus.find(s => s.courseId === courseId)
            if (alreadySubmitted) throw new TRPCError({ code: "BAD_REQUEST", message: `Result submitted already! ${alreadySubmitted.status}` })

            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "course not found!" })

            const updatedUser = await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    courseStatus: {
                        create: { status: "waiting", course: { connect: { id: courseId } }, level: { connect: { id: levelId } } }
                    }
                },
                include: { courseStatus: { include: { level: true } } }
            });

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Student added to waiting list by ${ctx.session.user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: updatedUser.id } },
                    messages: [{
                        message: `User was added to waiting list of course ${course.name} at level ${updatedUser.courseStatus.find((s) => courseId === s.courseId)?.level?.name}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: ctx.session.user.id } },
                }
            })

            return { updatedUser, course };
        }),
});
