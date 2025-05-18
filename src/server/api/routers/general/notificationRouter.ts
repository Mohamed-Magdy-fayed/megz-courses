import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import * as notificationService from './notificationService';
import { NotificationCreateSchema, NotificationUpdateSchema } from '@/components/general/notifications/notificationSchemas';
import { validNotificationChannels } from '@/lib/enumsTypes';

export const notificationsRouter = createTRPCRouter({
    // CREATE
    create: protectedProcedure
        .input(NotificationCreateSchema)
        .mutation(async ({ input, ctx }) => {
            const { userId, actorId, ...rest } = input;
            return notificationService.createNotification(ctx.prisma, {
                ...rest,
                user: { connect: { id: userId } },
                ...(actorId ? { actor: { connect: { id: actorId } } } : {}),
            });
        }),

    // READ (get by id)
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            return notificationService.getNotificationById(ctx.prisma, input.id);
        }),

    // READ (get all for user)
    getAllForUser: protectedProcedure
        .input(z.object({ userId: z.string().optional(), cursor: z.string().optional(), limit: z.number().optional() }))
        .query(async ({ input, ctx }) => {
            const limit = input.limit ?? 20;
            const cursor = input.cursor ? { id: input.cursor } : undefined;
            const items = await notificationService.getNotificationsByUserId(ctx.prisma, (input.userId || ctx.session.user.id), { cursor, limit });
            const hasMore = items.length > limit;
            return {
                items: hasMore ? items.slice(0, -1) : items,
                nextCursor: hasMore ? items[limit]?.id : undefined,
            };
        }),

    // UPDATE
    update: protectedProcedure
        .input(NotificationUpdateSchema)
        .mutation(async ({ input, ctx }) => {
            return notificationService.updateNotification(ctx.prisma, input.id, input.data);
        }),

    // DELETE
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            return notificationService.deleteNotification(ctx.prisma, input.id);
        }),

    // Mark all as read
    markAllRead: protectedProcedure
        .input(z.object({ userId: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            return notificationService.markAllNotificationsRead(ctx.prisma, (input.userId || ctx.session.user.id));
        }),

    // Get unread count
    getUnreadCount: protectedProcedure
        .input(z.object({ userId: z.string().optional() }))
        .query(async ({ input, ctx }) => {
            return notificationService.getUnreadNotificationsCount(ctx.prisma, (input.userId || ctx.session.user.id));
        }),

    // Delete expired
    deleteExpired: protectedProcedure
        .mutation(async ({ ctx }) => {
            return notificationService.deleteExpiredNotifications(ctx.prisma);
        }),

    // Get by channel
    getByChannel: protectedProcedure
        .input(z.object({ userId: z.string().optional(), channel: z.enum(validNotificationChannels).optional(), cursor: z.string().optional(), limit: z.number().optional() }))
        .query(async ({ input, ctx }) => {
            const limit = input.limit ?? 20;
            const cursor = input.cursor ? { id: input.cursor } : undefined;
            const items = await notificationService.getNotificationsByChannel(ctx.prisma, (input.userId || ctx.session.user.id), input.channel, { cursor, limit });
            const hasMore = items.length > limit;
            return {
                items: hasMore ? items.slice(0, -1) : items,
                nextCursor: hasMore ? items[limit]?.id : undefined,
            };
        }),
});
