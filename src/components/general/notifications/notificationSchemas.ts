import { z } from "zod";
import { validNotificationTypes, validNotificationChannels } from "@/lib/enumsTypes";

export const NotificationDataSchema = z.object({
    // Define the shape of your notification "data" field here
    link: z.string().url().optional(),
    extra: z.record(z.any()).optional(),
});

export const NotificationCreateSchema = z.object({
    userId: z.string(),
    type: z.enum(validNotificationTypes),
    title: z.string(),
    message: z.string(),
    isRead: z.boolean().optional(),
    data: NotificationDataSchema.optional(),
    channel: z.enum(validNotificationChannels).optional(),
    expiresAt: z.date().optional(),
    actorId: z.string().optional(),
});

export const NotificationUpdateSchema = z.object({
    id: z.string(),
    data: NotificationCreateSchema.partial().omit({ userId: true, type: true }),
});
