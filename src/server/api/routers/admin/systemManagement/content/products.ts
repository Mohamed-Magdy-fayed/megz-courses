import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { hasPermission } from "@/server/permissions";
import { productSchema } from "@/components/admin/systemManagement/products/ProductForm";

export const productsRouter = createTRPCRouter({
    getById: publicProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({ ctx, input: { id } }) => {
            const product = await ctx.prisma.product.findUnique({
                where: { id },
                include: {
                    orders: true,
                    productItems: { include: { course: true, level: true } }
                }
            });

            return { product };
        }),
    getLatest: publicProcedure
        .query(async ({ ctx }) => {
            const products = await ctx.prisma.product.findMany({
                take: 6,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: true,
                }
            });

            return { products };
        }),
    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            const products = await ctx.prisma.product.findMany({
                include: {
                    orders: true,
                }
            });

            return { products };
        }),
    create: protectedProcedure
        .input(productSchema)
        .mutation(async ({ input: { isActive, name, privatePrice, groupPrice, description }, ctx }) => {
            const product = await ctx.prisma.product.create({
                data: {
                    isActive,
                    name,
                    privatePrice, groupPrice,
                    description,
                },
            });

            return {
                product,
            };
        }),
    import: protectedProcedure
        .input(z.array(productSchema))
        .mutation(async ({ input, ctx }) => {
            const products = await ctx.prisma.$transaction(
                input.map(({ isActive, name, privatePrice, groupPrice, description }) => ctx.prisma.product.create({
                    data: {
                        isActive,
                        name,
                        privatePrice, groupPrice,
                        description,
                    },
                }))
            );

            return {
                products,
            };
        }),
    update: protectedProcedure
        .input(productSchema)
        .mutation(
            async ({
                ctx,
                input: { id, isActive, name, privatePrice, groupPrice, description },
            }) => {
                const product = await ctx.prisma.product.update({
                    where: {
                        id,
                    },
                    data: {
                        isActive,
                        name,
                        privatePrice, groupPrice,
                        description,
                    },
                });

                return { product };
            }
        ),
    delete: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "products", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const products = await ctx.prisma.product.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { products };
        }),
});
