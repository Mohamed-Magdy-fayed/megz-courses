import { DiscussionCreateSchema, DiscussionUpdateSchema, MessageCreateSchema, MarkMessageReadSchema } from '@/components/general/discussions/discussionSchemas';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import * as discussionService from './discussionService';

export const discussionsRouter = createTRPCRouter({
  // CREATE
  create: protectedProcedure
    .input(DiscussionCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return discussionService.createDiscussion(ctx.prisma, input);
    }),

  // READ (get by groupId and studentId)
  getByGroupAndStudent: protectedProcedure
    .input(z.object({ groupId: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      return discussionService.getDiscussionByGroupAndStudent(ctx.prisma, input.groupId, input.studentId, ctx.session.user.id);
    }),

  // READ (get by groupId)
  getByGroupId: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      return discussionService.getDiscussionByGroupId(ctx.prisma, input.groupId, ctx.session.user.id);
    }),

  // READ (get by id)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return discussionService.getDiscussionById(ctx.prisma, input.id);
    }),

  // READ (get all for user)
  getAllForUser: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return await discussionService.getDiscussionsByUserId(ctx.prisma, (input.userId || ctx.session.user.id));
    }),

  // UPDATE
  update: protectedProcedure
    .input(DiscussionUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      return discussionService.updateDiscussion(ctx.prisma, input.id, input.data);
    }),

  // DELETE
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return discussionService.deleteDiscussion(ctx.prisma, input.id);
    }),

  // Add participant
  addParticipant: protectedProcedure
    .input(z.object({ discussionId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return discussionService.addParticipant(ctx.prisma, input.discussionId, input.userId);
    }),

  // Remove participant
  removeParticipant: protectedProcedure
    .input(z.object({ discussionParticipantId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return discussionService.removeParticipant(ctx.prisma, input.discussionParticipantId);
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(MessageCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return discussionService.sendMessage(ctx.prisma, { ...input, senderId: ctx.session.user.id });
    }),

  // Get messages for a discussion
  getMessages: protectedProcedure
    .input(z.object({ discussionId: z.string(), limit: z.number().optional(), cursor: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 20;
      const cursor = input.cursor ? { id: input.cursor } : undefined;
      const items = await discussionService.getMessages(ctx.prisma, input.discussionId, { cursor, limit });
      const hasMore = items.length > limit;
      return {
        items: hasMore ? items.slice(0, -1) : items,
        nextCursor: hasMore ? items[limit]?.id : undefined,
      };
    }),

  // Mark message as read
  markMessageRead: protectedProcedure
    .input(MarkMessageReadSchema)
    .mutation(async ({ input, ctx }) => {
      return discussionService.markMessageRead(ctx.prisma, input.messageId, input.userId);
    }),

  // Delete message
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return discussionService.deleteMessage(ctx.prisma, input.messageId);
    }),
});
