import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validSupportTicketStatus } from "@/lib/enumsTypes";

export const ticketsRouter = createTRPCRouter({
    findOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input: { id } }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const ticket = await ctx.prisma.supportTicket.findUnique({
                where: { id }
            });

            return { ticket };
        }),
    findAll: protectedProcedure
        .query(async ({ ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const tickets = await ctx.prisma.supportTicket.findMany({ include: { createdBy: true } });

            return { tickets };
        }),
    createTicket: protectedProcedure
        .input(
            z.object({
                info: z.string(),
                subject: z.string(),
            })
        )
        .mutation(async ({ input: { info, subject }, ctx }) => {
            const ticket = await ctx.prisma.supportTicket.create({
                data: {
                    info,
                    status: "created",
                    subject,
                    createdBy: {
                        connect: {
                            id: ctx.session.user.id
                        }
                    },
                },
            });

            return {
                ticket,
            };
        }),
    addMessage: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                messageText: z.string(),
            })
        )
        .mutation(async ({ input: { id, messageText }, ctx }) => {
            const old = await ctx.prisma.supportTicket.findUnique({
                where: { id }
            })

            const ticket = await ctx.prisma.supportTicket.update({
                where: { id },
                data: {
                    messages: {
                        push: {
                            messageDate: new Date(),
                            messageText,
                            userEmail: ctx.session.user.email || "No Email",
                            userName: ctx.session.user.name || "No Name",
                        }
                    },
                    status: old?.status === "closed" ? "opened" : undefined
                },
            });

            return {
                ticket,
            };
        }),
    editTicketStatus: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum(validSupportTicketStatus),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, status },
            }) => {
                const updatedTicket = await ctx.prisma.supportTicket.update({
                    where: {
                        id: id,
                    },
                    data: {
                        status,
                    },
                });

                return { updatedTicket };
            }
        ),
    deleteTickets: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedTickets = await ctx.prisma.supportTicket.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedTickets };
        }),
});
