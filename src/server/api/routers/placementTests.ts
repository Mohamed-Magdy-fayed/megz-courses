import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const placementTestsRouter = createTRPCRouter({
    startCourse: protectedProcedure
        .input(z.object({
            userId: z.string(),
            courseId: z.string(),
        }))
        .mutation(async ({ input: { userId, courseId }, ctx }) => {
            const placementTest = await ctx.prisma.placementTest.create({
                data: {
                    testStatus: {},
                    student: {
                        connect: {
                            id: userId
                        }
                    },
                    course: {
                        connect: {
                            id: courseId
                        }
                    }
                }
            })

            await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    courseStatus: {
                        updateMany: {
                            where: {
                                courseId,
                            },
                            data: {
                                state: "waiting"
                            }
                        }
                    }
                },
            });

            return { placementTest };
        }),
    startCourses: protectedProcedure
        .input(z.object({
            userId: z.string(),
            courseIds: z.array(z.string()),
        }))
        .mutation(async ({ input: { userId, courseIds }, ctx }) => {
            const placementTests = await ctx.prisma.placementTest.createMany({
                data: courseIds.map(courseId => ({
                    testStatus: {},
                    courseId,
                    studentUserId: userId,
                })),
            })

            await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    courseStatus: {
                        push: courseIds.map(courseId => ({
                            courseId,
                            state: "waiting"
                        })),
                    }
                },
            });

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
                    testStatus: {
                        update: { form: Math.round(score) }
                    }
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
                    testStatus: {
                        update: { oral: Math.round(score) }
                    }
                }
            })

            return { updatedPlacementTest };
        }),
});
