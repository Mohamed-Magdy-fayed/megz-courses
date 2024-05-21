import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CoursStatus } from "@prisma/client";

export const placementTestsRouter = createTRPCRouter({
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
                }
            })

            return { tests }
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

            const user = await ctx.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "user not found!" })

            const newStatuses: CoursStatus[] = courseIds.map(id => ({ courseId: id, state: "waiting" }))

            const updatedUser = await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    courseStatus: {
                        set: [...user.courseStatus, ...newStatuses]
                    }
                },
            });

            return { placementTests, updatedUser };
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
