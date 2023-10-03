import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { SalesOperationStatus } from "@prisma/client";
import { salesOperationCodeGenerator } from "@/lib/utils";

export const salesOperationsRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const salesOperations = await ctx.prisma.salesOperation.findMany({
            include: {
                assignee: true,
            },
        });

        return { salesOperations };
    }),
    getById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const salesOperations = await ctx.prisma.salesOperation.findUnique({
                where: { id },
                include: {
                    assignee: true,
                },
            });
            return { salesOperations };
        }),
    createSalesOperation: protectedProcedure
        .input(
            z.object({
                assigneeId: z.string(),
                status: z.enum(["created", "assigned", "ongoing", "completed", "cancelled"]),
            })
        )
        .mutation(async ({ input: { assigneeId, status }, ctx }) => {
            const salesOperations = await ctx.prisma.salesOperation.create({
                data: {
                    assignee: { connect: { userId: assigneeId } },
                    code: salesOperationCodeGenerator(),
                    status,
                },
                include: {
                    assignee: true,
                },
            });

            return {
                salesOperations,
            };
        }),
    editSalesOperations: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                assigneeId: z.string(),
                code: z.string(),
                status: z.enum(["created", "assigned", "ongoing", "completed", "cancelled"]),
            })
        )
        .mutation(async ({ ctx, input: { id, assigneeId, code, status } }) => {
            const updatedSalesOperations = await ctx.prisma.salesOperation.update({
                where: {
                    id,
                },
                data: {
                    code,
                    status
                },
                include: {
                    assignee: true,
                },
            });

            return { updatedSalesOperations };
        }),
    deleteSalesOperations: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            const deletedSalesOperation = await ctx.prisma.salesOperation.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedSalesOperation };
        }),
});
