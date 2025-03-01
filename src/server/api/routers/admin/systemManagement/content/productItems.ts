import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { hasPermission } from "@/server/permissions";
import { productItemSchema } from "@/components/admin/systemManagement/products/productItems/ProductItemForm";

export const productItemsRouter = createTRPCRouter({
    getById: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({ ctx, input: { id } }) => {
            const productItem = await ctx.prisma.productItem.findUnique({
                where: { id },
                include: {
                    course: true,
                    level: true,
                    product: true,
                }
            });

            return { productItem };
        }),
    getAll: protectedProcedure
        .input(z.object({
            productId: z.string(),
        }))
        .query(async ({ ctx, input: { productId } }) => {
            const productItems = await ctx.prisma.productItem.findMany({
                where: { productId },
                include: {
                    course: true,
                    level: true,
                    product: true,
                }
            });

            return { productItems };
        }),
    create: protectedProcedure
        .input(productItemSchema)
        .mutation(async ({ input: { courseId, levelId, productId }, ctx }) => {
            const productItem = await ctx.prisma.productItem.create({
                data: {
                    course: { connect: { id: courseId } },
                    level: { connect: { id: levelId } },
                    product: { connect: { id: productId } },
                },
            });

            return {
                productItem,
            };
        }),
    import: protectedProcedure
        .input(z.array(productItemSchema))
        .mutation(async ({ input, ctx }) => {
            const productItems = await ctx.prisma.$transaction(
                input.map(({ courseId, levelId, productId }) => ctx.prisma.productItem.create({
                    data: {
                        course: { connect: { id: courseId } },
                        level: { connect: { id: levelId } },
                        product: { connect: { id: productId } },
                    },
                }))
            );

            return {
                productItems,
            };
        }),
    update: protectedProcedure
        .input(productItemSchema)
        .mutation(
            async ({
                ctx,
                input: { id, courseId, levelId, productId },
            }) => {
                const productItem = await ctx.prisma.productItem.update({
                    where: {
                        id,
                    },
                    data: {
                        course: { connect: { id: courseId } },
                        level: { connect: { id: levelId } },
                        product: { connect: { id: productId } },
                    },
                });

                return { productItem };
            }
        ),
    delete: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "productItems", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const productItems = await ctx.prisma.productItem.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { productItems };
        }),
});
