import { validNoteTypes, validUserTypes } from "@/lib/enumsTypes";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const notesRouter = createTRPCRouter({
  createNote: protectedProcedure
    .input(z.object({
      text: z.string(),
      studentId: z.string(),
      noteType: z.enum(validNoteTypes),
      createdFor: z.enum(validUserTypes),
      mentions: z.array(z.string()),
      sla: z.string()
    }))
    .mutation(async ({ ctx, input: { createdFor, mentions, sla, text, studentId, noteType } }) => {
      const createdByUserId = ctx.session.user.id
      const note = await ctx.prisma.userNote.create({
        data: {
          text,
          sla: Number(sla),
          type: noteType,
          createdByUser: {
            connect: { id: createdByUserId }
          },
          createdFor,
          mentions: {
            connect: mentions.map(id => ({ id }))
          },
          createdForStudent: { connect: { id: studentId } }
        }
      })

      return {
        note,
      };
    }),
  editNote: protectedProcedure
    .input(z.object({
      text: z.string(),
      studentId: z.string(),
      noteType: z.enum(validNoteTypes),
      createdFor: z.enum(validUserTypes),
      mentions: z.array(z.string()),
      sla: z.string()
    }))
    .mutation(async ({ ctx, input: { createdFor, mentions, sla, text, studentId, noteType } }) => {
      const createdByUserId = ctx.session.user.id
      const note = await ctx.prisma.userNote.create({
        data: {
          text,
          sla: Number(sla),
          type: noteType,
          createdByUser: {
            connect: { id: createdByUserId }
          },
          createdFor,
          mentions: {
            connect: mentions.map(id => ({ id }))
          },
          createdForStudent: { connect: { id: studentId } }
        }
      })

      return {
        note,
      };
    }),
  deleteNotes: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input: { ids } }) => {
      const userType = ctx.session.user.userType
      if (userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action!" })
      const notes = await ctx.prisma.userNote.deleteMany({
        where: {
          id: {
            in: ids,
          }
        }
      })

      return {
        notes,
      };
    }),
  getUserNotes: protectedProcedure
    .input(z.object({
      userId: z.string().optional()
    }))
    .query(async ({ ctx, input: { userId } }) => {
      const notes = await ctx.prisma.userNote.findMany({
        where: userId ? { createdForStudentId: userId } : undefined,
        include: {
          createdByUser: true,
          createdForStudent: true,
          mentions: true,
        }
      })

      return {
        notes,
      };
    }),
  getAllNotes: protectedProcedure
    .query(async ({ ctx }) => {
      const notes = await ctx.prisma.userNote.findMany({
        include: {
          createdByUser: true,
          createdForStudent: true,
          mentions: true,
        }
      })

      return {
        notes,
      };
    }),
});
