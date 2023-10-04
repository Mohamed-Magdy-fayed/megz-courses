import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { orderCodeGenerator } from "@/lib/utils";

export const ordersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                courses: true,
                user: true,
                salesOperation: { include: { assignee: true } }
            },
        });

        return { orders };
    }),
    getById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const order = await ctx.prisma.order.findUnique({
                where: { id },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });
            return { order };
        }),
    createOrder: protectedProcedure
        .input(
            z.object({
                courses: z.array(z.string()),
                salesOperationId: z.string(),
                email: z.string().email(),
            })
        )
        .mutation(async ({ input: { courses, salesOperationId, email }, ctx }) => {
            const coursesPrice = await ctx.prisma.course.findMany({
                where: {
                    id: { in: courses }
                }
            })
            const totalPrice = coursesPrice.map(course => course.price).reduce((accumulator, value) => {
                return accumulator + value;
            }, 0);

            const order = await ctx.prisma.order.create({
                data: {
                    amount: totalPrice,
                    orderNumber: orderCodeGenerator(),
                    courses: { connect: courses.map(c => ({ id: c })) },
                    salesOperation: { connect: { id: salesOperationId } },
                    user: { connect: { email } },
                },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            return {
                order,
            };
        }),
    editOrder: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                courses: z.array(z.string()),
            })
        )
        .mutation(async ({ ctx, input: { id, courses } }) => {
            const coursesPrice = await ctx.prisma.course.findMany({
                where: {
                    id: { in: courses }
                }
            })
            const totalPrice = coursesPrice.map(course => course.price).reduce((accumulator, value) => {
                return accumulator + value;
            }, 0);

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id,
                },
                data: {
                    amount: totalPrice,
                    courses: { connect: courses.map(c => ({ id: c })) },
                },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            return { updatedOrder };
        }),
    deleteOrders: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            const deletedOrders = await ctx.prisma.order.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedOrders };
        }),
});
