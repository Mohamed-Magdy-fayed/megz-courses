import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { orderCodeGenerator, salesOperationCodeGenerator } from "@/lib/utils";
import { validOperationStatus } from "@/lib/enumsTypes";
import { TRPCError } from "@trpc/server";

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
                    assignee: { include: { user: true } },
                    orderDetails: { include: { user: true, courses: true } },
                },
            });
            return { salesOperations };
        }),
    createSalesOperation: protectedProcedure
        .input(
            z.object({
                assigneeId: z.string().optional(),
                status: z.enum(validOperationStatus),
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
                    orderDetails: true,
                },
            });

            return {
                salesOperations,
            };
        }),
    assignSalesOperation: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                assigneeId: z.string(),
            })
        )
        .mutation(async ({ input: { id, assigneeId }, ctx }) => {
            const salesOperations = await ctx.prisma.salesOperation.update({
                where: {
                    id
                },
                data: {
                    assignee: { connect: { userId: assigneeId } },
                    status: "assigned",
                },
                include: {
                    assignee: { include: { user: true } },
                    orderDetails: true,
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
                email: z.string().email().optional(),
                amount: z.number().optional(),
                status: z.enum(validOperationStatus).optional(),
            })
        )
        .mutation(async ({ ctx, input: { id, status, amount, email } }) => {
            const updatedSalesOperations = await ctx.prisma.salesOperation.update({
                where: {
                    id,
                },
                data: {
                    status,
                    orderDetails: !email || !amount ? undefined : {
                        connectOrCreate: {
                            where: { salesOperationId: id },
                            create: {
                                orderNumber: orderCodeGenerator(),
                                amount,
                                user: { connect: { email } },
                            }
                        }
                    }
                },
                include: {
                    assignee: { include: { user: true, tasks: true } },
                    orderDetails: true
                },
            });

            return { updatedSalesOperations };
        }),
    deleteSalesOperations: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
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
