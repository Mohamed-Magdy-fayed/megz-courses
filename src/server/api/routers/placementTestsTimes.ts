import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const placementTestsTimesRouter = createTRPCRouter({
    getPlacementTestTimes: protectedProcedure
        .query(async ({ ctx }) => {
            const placementTestsTimes = await ctx.prisma.placementTestTime.findMany()
            return { placementTestsTimes }
        }),
    createPlacementTestTimes: protectedProcedure
        .input(z.object({
            testTime: z.date(),
        }))
        .mutation(async ({ input: { testTime }, ctx }) => {
            const placementTestsTime = await ctx.prisma.placementTestTime.create({
                data: {
                    testTime,
                }
            })
            return { placementTestsTime };
        }),
    updatePlacementTestTimes: protectedProcedure
        .input(z.object({
            id: z.string(),
            testTime: z.date(),
        }))
        .mutation(async ({ input: { id, testTime }, ctx }) => {
            const updatedPlacementTestTime = await ctx.prisma.placementTestTime.update({
                where: {
                    id,
                },
                data: {
                    testTime,
                }
            })

            return { updatedPlacementTestTime };
        }),
    deletePlacementTestTimes: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()),
        }))
        .mutation(async ({ input: { ids }, ctx }) => {
            const deletedPlacementTestTimes = await ctx.prisma.placementTest.deleteMany({
                where: {
                    id: { in: ids },
                },
            })

            return { deletedPlacementTestTimes };
        }),
});
