import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { pusherServer } from "@/lib/pusher";

export const chatRouter = createTRPCRouter({
    getMyChat: protectedProcedure
        .query(async ({ ctx }) => {
            const chat = await ctx.prisma.supportChat.findUnique({
                where: {
                    userId: ctx.session.user.id
                },
                include: {
                    user: true,
                    agent: {
                        include: {
                            user: true
                        }
                    },
                    messages: true
                },
            });

            return { chat };
        }),
    getChatById: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({ ctx, input: { id } }) => {
            const chat = await ctx.prisma.supportChat.findUnique({
                where: {
                    id
                },
                include: {
                    user: true,
                    agent: {
                        include: {
                            user: true
                        }
                    },
                    messages: true
                },
            });

            return { chat };
        }),
    getChats: protectedProcedure
        .query(async ({ ctx }) => {
            const chats = await ctx.prisma.supportChat.findMany({
                include: {
                    user: true,
                    messages: true,
                    agent: {
                        include: {
                            user: true,
                        }
                    },
                },
            });

            return { chats };
        }),
    sendMessage: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                message: z.string(),
            })
        )
        .mutation(async ({ input: { id, message }, ctx }) => {
            const user = ctx.session.user
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "not logged in!" })

            const newMessage = await ctx.prisma.message.create({
                data: {
                    sender: user.name || "you",
                    text: message,
                    supportChat: {
                        connect: {
                            id
                        }
                    }
                },
                include: {
                    supportChat: { include: { user: true } },
                }
            })

            pusherServer.trigger("SUPPORT_CHAT", id, newMessage)
            pusherServer.trigger("SUPPORT_CHAT", "ALL", newMessage)

            return { newMessage }
        }),
    createChat: protectedProcedure
        .input(
            z.object({
                message: z.string(),
            })
        )
        .mutation(async ({ input: { message }, ctx }) => {
            const user = ctx.session.user
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "not logged in!" })

            const chat = await ctx.prisma.supportChat.create({
                data: {
                    messages: {
                        createMany: {
                            data: [
                                {
                                    sender: "system",
                                    text: "Hello, how can we help?"
                                },
                                {
                                    sender: user.name || "you",
                                    text: message
                                }
                            ]
                        }
                    },
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                },
                include: {
                    messages: true
                }
            })
            pusherServer.trigger("CREATE_CHAT", "ALL", chat)

            return { chat }
        }),
    deleteMyChat: protectedProcedure
        .mutation(async ({ ctx }) => {
            const deletedChat = await ctx.prisma.supportChat.delete({
                where: {
                    userId: ctx.session.user.id
                },
            });

            pusherServer.trigger("DELETE_CHAT", deletedChat.id, deletedChat)
            pusherServer.trigger("DELETE_CHAT", "ALL", deletedChat)

            return { deletedChat };
        }),
    deleteChat: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input: { id } }) => {
            const deletedChat = await ctx.prisma.supportChat.delete({
                where: {
                    id
                },
            });

            pusherServer.trigger("DELETE_CHAT", id, deletedChat)
            pusherServer.trigger("DELETE_CHAT", "ALL", deletedChat)

            return { deletedChat };
        }),
});
