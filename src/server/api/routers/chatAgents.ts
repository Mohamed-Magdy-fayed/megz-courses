import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";

export const chatAgentsRouter = createTRPCRouter({
    getChatAgents: protectedProcedure
        .query(async ({ ctx }) => {
            const chatAgents = await ctx.prisma.chatAgent.findMany({
                include: {
                    user: true,
                    chats: true,
                },
            });

            return { chatAgents };
        }),
    getChatAgentByUserId: protectedProcedure
        .query(async ({ ctx }) => {
            const chatAgent = await ctx.prisma.user.findUnique({
                where: { id: ctx.session.user.id },
                include: { chatAgent: { include: { chats: true } } },
            });
            return { chatAgent };
        }),
    getChatAgentById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const ChatAgent = await ctx.prisma.chatAgent.findUnique({
                where: { id },
                include: { user: true },
            });
            return { ChatAgent };
        }),
    createChatAgent: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                phone: z.string(),
                image: z.string().optional(),
                password: z.string(),
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

            const agent = await ctx.prisma.chatAgent.create({
                data: {
                    user: {
                        create: {
                            name: input.name,
                            email: input.email,
                            phone: input.phone,
                            emailVerified: new Date(),
                            hashedPassword,
                            image: input.image,
                            userRoles: ["ChatAgent"],
                        }
                    }
                },
                include: {
                    user: true,
                },
            });

            return {
                agent,
            };
        }),
    deleteChatAgent: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "users", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const deletedChatAgents = await ctx.prisma.user.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedChatAgents };
        }),
});
