import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validMessageTemplateTypes } from "@/lib/enumsTypes";
import { extractVariables, setupDefaultMessageTemplates } from "@/lib/whatsApp";
import { MessageTemplateType } from "@prisma/client";
import { hasPermission } from "@/server/permissions";

export const whatsAppTemplatesRouter = createTRPCRouter({
    // Fetch all message templates
    getMessageTemplates: protectedProcedure.query(async ({ ctx }) => {
        if (!hasPermission(ctx.session.user, "messageTemplates", "view")) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to view message templates!" });
        }

        const messageTemplates = await ctx.prisma.messageTemplate.findMany({
            orderBy: { updatedAt: "desc" },
        });

        return { messageTemplates };
    }),

    // Create a new message template
    createMessageTemplate: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                body: z.string(),
            })
        )
        .mutation(async ({ input: { name, body }, ctx }) => {
            if (!hasPermission(ctx.session.user, "messageTemplates", "create")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create templates!" });
            }

            const placeholders = extractVariables(body);

            const newTemplate = await ctx.prisma.messageTemplate.create({
                data: {
                    name: 'Order Placed',
                    type: MessageTemplateType.OrderPlaced,
                    body: body,
                    placeholders: placeholders,
                },
            });

            // const messageTemplate = await ctx.prisma.messageTemplate.create({
            //     data: {
            //         name,
            //         body,
            //         type: "Custom",
            //         placeholders: [],
            //     },
            // });

            return { newTemplate };
        }),

    // reset to all default templates
    resetDefaultTemplates: protectedProcedure
        .mutation(async ({ ctx }) => {
            if (!hasPermission(ctx.session.user, "messageTemplates", "update")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to edit templates!" });
            }
            const createdTemplates = await setupDefaultMessageTemplates(ctx.prisma)
            return { createdTemplates };
        }),

    // Edit an existing message template
    editMessageTemplate: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
                body: z.string(),
            })
        )
        .mutation(async ({ input: { id, name, body }, ctx }) => {
            if (!hasPermission(ctx.session.user, "messageTemplates", "update")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to edit templates!" });
            }

            const updatedMessageTemplate = await ctx.prisma.messageTemplate.update({
                where: { id },
                data: {
                    name,
                    body,
                },
            });

            return { updatedMessageTemplate };
        }),

    // Delete message templates
    deleteMessageTemplates: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "messageTemplates", "delete")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to delete templates!" });
            }

            const deletedMessageTemplates = await ctx.prisma.messageTemplate.deleteMany({
                where: {
                    AND: {
                        id: { in: input },
                        type: { notIn: [...validMessageTemplateTypes] }
                    }
                },
            });

            return { deletedMessageTemplates };
        }),
});
