import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PlacementTest } from "@prisma/client";

export const placementTestsRouter = createTRPCRouter({
    getUserCoursePlacementTest: protectedProcedure
        .input(z.object({
            courseId: z.string(),
        }))
        .query(async ({ ctx, input: { courseId } }) => {
            const userId = ctx.session.user.id
            const placementTest = await ctx.prisma.placementTest.findFirst({
                where: {
                    AND: {
                        courseId,
                        studentUserId: userId,
                    }
                },
                include: {
                    course: true,
                    student: { include: { courseStatus: { include: { level: true, course: true } } } },
                    trainer: { include: { user: true } },
                    writtenTest: { include: { submissions: true, googleForm: true, questions: true } },
                }
            })

            return { placementTest }
        }),
    getCoursePlacementTest: protectedProcedure
        .input(z.object({
            courseId: z.string(),
        }))
        .query(async ({ ctx, input: { courseId } }) => {
            const tests = await ctx.prisma.placementTest.findMany({
                where: {
                    courseId,
                },
                include: {
                    course: true,
                    student: true,
                    trainer: { include: { user: true } },
                    writtenTest: { include: { submissions: true } },
                }
            })

            return { tests }
        }),
    getUserPlacementTest: protectedProcedure
        .input(z.object({
            userId: z.string(),
        }))
        .query(async ({ ctx, input: { userId } }) => {
            const tests = await ctx.prisma.placementTest.findMany({
                where: {
                    studentUserId: userId,
                },
                include: {
                    course: true,
                    student: true,
                    trainer: { include: { user: true } },
                    writtenTest: { include: { submissions: true } },
                }
            })

            return { tests }
        }),
    startCourses: protectedProcedure
        .input(z.object({
            userId: z.string(),
            trainerId: z.string(),
            meetingNumber: z.string(),
            meetingPassword: z.string(),
            testTime: z.date(),
            courseId: z.string(),
        }))
        .mutation(async ({ input: { userId, courseId, testTime, trainerId, meetingNumber, meetingPassword }, ctx }) => {
            const evaluationForm = await ctx.prisma.evaluationForm.findFirst({
                where: {
                    AND: {
                        courseId,
                        type: "placementTest"
                    }
                }
            })
            if (!evaluationForm) throw new TRPCError({ code: "BAD_REQUEST", message: "No Evaluation Form" })
            const evaluationFormId = evaluationForm.id

            const placementTest = await ctx.prisma.placementTest.create({
                data: {
                    course: { connect: { id: courseId } },
                    student: { connect: { id: userId } },
                    trainer: { connect: { id: trainerId } },
                    writtenTest: { connect: { id: evaluationFormId } },
                    createdBy: { connect: { id: ctx.session.user.id } },
                    oralTestMeeting: {
                        meetingNumber,
                        meetingPassword,
                    },
                    oralTestTime: testTime,
                },
                include: { writtenTest: true }
            })

            return { placementTest };
        }),
    editPlacementTest: protectedProcedure
        .input(z.object({
            testId: z.string(),
            testTime: z.date(),
            trainerId: z.string(),
            meetingNumber: z.string(),
            meetingPassword: z.string(),
        }))
        .mutation(async ({ input: { testId, meetingNumber, meetingPassword, testTime, trainerId }, ctx }) => {
            const updatedPlacementTest = await ctx.prisma.placementTest.update({
                where: {
                    id: testId,
                },
                data: {
                    oralTestMeeting: {
                        meetingNumber,
                        meetingPassword,
                    },
                    trainer: {
                        connect: { id: trainerId }
                    },
                    oralTestTime: testTime,
                }
            })

            return { updatedPlacementTest };
        }),
});
