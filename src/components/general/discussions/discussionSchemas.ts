import { z } from "zod";
import { validDiscussionTypes } from "@/lib/enumsTypes";

export const DiscussionCreateSchema = z.object({
    type: z.enum(validDiscussionTypes),
    title: z.string().optional(),
    zoomGroupId: z.string().optional(),
    participantIds: z.array(z.string()),
    createdById: z.string(),
});

export const DiscussionUpdateSchema = z.object({
    id: z.string(),
    data: z.object({
        title: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const MessageCreateSchema = z.object({
    discussionId: z.string(),
    content: z.string(),
    attachments: z.array(z.string()).optional(),
});

export const MarkMessageReadSchema = z.object({
    messageId: z.string(),
    userId: z.string(),
});
