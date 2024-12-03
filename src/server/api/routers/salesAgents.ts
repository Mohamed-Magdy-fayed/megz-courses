import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { validUserRoles } from "@/lib/enumsTypes";

export const salesAgentsRouter = createTRPCRouter({
    getBudget: protectedProcedure
        .query(async ({ ctx }) => {
            const zoomGroups = await ctx.prisma.zoomGroup.findMany({ include: { course: true } });

            return {
                zoomGroups: zoomGroups.map(group => ({
                    ...group,
                    groupCost: group.course?.instructorPrice,
                }))
            };
        }),
    getSalesAgents: protectedProcedure
        .query(async ({ ctx }) => {
            const salesAgents = await ctx.prisma.salesAgent.findMany({
                where: {
                    user: { AND: [{ userRoles: { hasSome: ["SalesAgent", "OperationAgent"] } }, { NOT: { userRoles: { has: "Admin" } } }] }
                },
                include: {
                    user: true,
                    leads: true,
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
            const SalesAgent = await ctx.prisma.salesAgent.findUnique({
                where: { id },
                include: { leads: true },
            });
            return { SalesAgent };
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
                include: { SalesAgent: true },
            });

            return { user };
        }),
    createSalesAgent: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string(),
                phone: z.string(),
                image: z.string().optional(),
                agentType: z.enum([validUserRoles[2], validUserRoles[6]]),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "users", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
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
                    emailVerified: new Date(),
                    hashedPassword,
                    phone: input.phone,
                    image: input.image,
                    SalesAgent: { create: {} },
                    userRoles: [input.agentType],
                },
                include: {
                    SalesAgent: true,
                },
            });

            return {
                user,
            };
        }),
    editSalesAgent: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
                image: z.string().optional(),
                email: z.string().email(),
                phone: z.string().optional(),
                agentType: z.enum([validUserRoles[2], validUserRoles[6]]),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, name, image, email, phone, agentType },
            }) => {
                if (!hasPermission(ctx.session.user, "users", "delete", { id })) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
                const updatedUser = await ctx.prisma.user.update({
                    where: {
                        id: id,
                    },
                    data: {
                        name,
                        email,
                        image,
                        phone,
                        userRoles: [agentType]
                    },
                    include: {
                        SalesAgent: true,
                    },
                });

                return { updatedUser };
            }
        ),
    deleteSalesAgent: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "users", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
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
