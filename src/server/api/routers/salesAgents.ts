import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

export const salesAgentsRouter = createTRPCRouter({
    getSalesAgents: protectedProcedure
        .query(async ({ ctx }) => {
            const salesAgents = await ctx.prisma.salesAgent.findMany({
                include: {
                    user: true,
                    tasks: true,
                },
            });

            return { salesAgents };
        }),
    getSalesAgentById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const salesAgent = await ctx.prisma.salesAgent.findUnique({
                where: { id },
                include: { tasks: true },
            });
            return { salesAgent };
        }),
    getSalesAgentByEmail: publicProcedure
        .input(
            z.object({
                email: z.string(),
            })
        )
        .query(async ({ input: { email }, ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    email
                },
                include: { salesAgent: true },
            });

            return { user };
        }),
    createSalesAgent: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string(),
                phone: z.string().optional(),
                image: z.string().optional(),
                salary: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const hashedPassword = await bcrypt.hash(input.password, 10);

            // check if email is taken
            const exists = await ctx.prisma.user.findFirst({
                where: {
                    email: input.email,
                },
            });
            if (exists) throw new Error("Email already used!");

            const user = await ctx.prisma.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    hashedPassword,
                    phone: input.phone,
                    image: input.image,
                    salesAgent: { create: { salary: input.salary } },
                    userType: "salesAgent",
                },
                include: {
                    salesAgent: true,
                },
            });

            return {
                user,
            };
        }),
    editSalesAgent: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                phone: z.string().optional(),
                salary: z.string()
            })
        )
        .mutation(
            async ({
                ctx,
                input: { name, email, phone, salary },
            }) => {
                const updatedUser = await ctx.prisma.user.update({
                    where: {
                        email: email,
                    },
                    data: {
                        name,
                        email,
                        phone,
                        salesAgent: { update: { salary } }
                    },
                    include: {
                        salesAgent: true,
                    },
                });

                return { updatedUser };
            }
        ),
    deleteSalesAgent: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedSalesAgents = await ctx.prisma.user.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedSalesAgents };
        }),
});
