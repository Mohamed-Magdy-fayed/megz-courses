import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CoursStatus, PlacementTest, Prisma, User } from "@prisma/client";

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
                    student: true,
                    trainer: { include: { user: true } },
                    oralTestTime: true,
                    writtenTest: { include: { submissions: true } },
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
                    oralTestTime: true,
                    writtenTest: { include: { submissions: true } },
                }
            })

            return { tests }
        }),
    startCourses: protectedProcedure
        .input(z.object({
            userId: z.string(),
            trainerId: z.string(),
            testTime: z.date(),
            courseIds: z.array(z.string()),
        }))
        .mutation(async ({ input: { userId, courseIds, testTime, trainerId }, ctx }) => {
            let placementTests: PlacementTest[] = []

            for (let i = 0; i < courseIds.length; i++) {
                const courseId = courseIds[i];
                if (!courseId) return

                const evaluationForm = await ctx.prisma.evaluationForm.findFirst({ where: { courseId } })
                if (!evaluationForm) throw new TRPCError({ code: "BAD_REQUEST", message: "No Evaluation Form" })
                const evaluationFormId = evaluationForm.id
                const placementTestTimeId = (await ctx.prisma.placementTestTime.create({ data: { testTime } })).id

                const placementTest = await ctx.prisma.placementTest.create({
                    data: {
                        courseId,
                        studentUserId: userId,
                        evaluationFormId,
                        placementTestTimeId,
                        trainerId,
                    },
                    include: { oralTestTime: true, writtenTest: true }
                })
                placementTests.push(placementTest)
            }

            return { placementTests };
        }),
    updatePlacementFormTestScore: protectedProcedure
        .input(z.object({
            score: z.number(),
            testId: z.string(),
        }))
        .mutation(async ({ input: { score, testId }, ctx }) => {
            const updatedPlacementTest = await ctx.prisma.placementTest.update({
                where: {
                    id: testId,
                },
                data: {

                }
            })

            return { updatedPlacementTest };
        }),
    updatePlacementOralTestScore: protectedProcedure
        .input(z.object({
            score: z.number(),
            testId: z.string(),
        }))
        .mutation(async ({ input: { score, testId }, ctx }) => {
            const updatedPlacementTest = await ctx.prisma.placementTest.update({
                where: {
                    id: testId,
                },
                data: {

                }
            })

            return { updatedPlacementTest };
        }),
});
