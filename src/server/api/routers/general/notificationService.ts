import { PrismaClient, Prisma, NotificationChannel } from '@prisma/client';

// Create a notification
export async function createNotification(prisma: PrismaClient, data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
}

// Read (get) a notification by ID
export async function getNotificationById(prisma: PrismaClient, id: string) {
    return prisma.notification.findUnique({ where: { id } });
}

// Read (get) all notifications for a user
export async function getNotificationsByUserId(prisma: PrismaClient, userId: string, options: { cursor?: { id: string }; limit?: number } = { limit: 20 }) {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: options.limit! + 1,
        ...(options.cursor ? { cursor: options.cursor, skip: 1 } : {}),
    });
}

// Update a notification by ID
export async function updateNotification(prisma: PrismaClient, id: string, data: Prisma.NotificationUpdateInput) {
    return prisma.notification.update({ where: { id }, data });
}

// Delete a notification by ID
export async function deleteNotification(prisma: PrismaClient, id: string) {
    return prisma.notification.delete({ where: { id } });
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(prisma: PrismaClient, userId: string) {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
    });
}

// Get unread notifications count for a user
export async function getUnreadNotificationsCount(prisma: PrismaClient, userId: string) {
    return prisma.notification.count({ where: { AND: { userId, isRead: false } } });
}

// Delete all expired notifications (utility)
export async function deleteExpiredNotifications(prisma: PrismaClient) {
    return prisma.notification.deleteMany({
        where: { expiresAt: { lte: new Date() } },
    });
}

// Get notifications by channel for a user
export async function getNotificationsByChannel(prisma: PrismaClient, userId: string, channel: NotificationChannel | undefined, options: { cursor?: { id: string }; limit?: number } = { limit: 20 }) {
    return prisma.notification.findMany({
        where: { userId, channel },
        orderBy: { createdAt: 'desc' },
        take: options.limit! + 1,
        ...(options.cursor ? { cursor: options.cursor, skip: 1 } : {}),
    });
}
