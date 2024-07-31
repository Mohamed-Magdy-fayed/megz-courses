import { validNoteStatus, validNoteTypes, validUserTypes } from "@/lib/enumsTypes";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const notesRouter = createTRPCRouter({
  createNote: protectedProcedure
    .input(z.object({
      title: z.string(),
      message: z.string(),
      studentId: z.string(),
      noteType: z.enum(validNoteTypes),
      mentions: z.array(z.string()),
      sla: z.string()
    }))
    .mutation(async ({ ctx, input: { title, mentions, sla, message, studentId, noteType } }) => {
      const createdByUserId = ctx.session.user.id
      const createdByUserEmail = ctx.session.user.email
      if (!createdByUserEmail) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authorized" })

      const note = await ctx.prisma.userNote.create({
        data: {
          title,
          messages: { message, updatedAt: new Date(), updatedBy: createdByUserEmail },
          sla: Number(sla),
          type: noteType,
          status: "Created",
          createdByUser: {
            connect: { id: createdByUserId }
          },
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
      id: z.string(),
      noteType: z.enum(validNoteTypes),
      status: z.enum(validNoteStatus),
      mentions: z.array(z.string()),
      sla: z.string()
    }))
    .mutation(async ({ ctx, input: { id, mentions, status, sla, noteType } }) => {
      const userEmail = ctx.session.user.email
      if (!userEmail) throw new TRPCError({ code: "BAD_REQUEST", message: "User not logged in!" })
      const oldNote = await ctx.prisma.userNote.findUnique({ where: { id } })
      if (!oldNote) throw new TRPCError({ code: "BAD_REQUEST", message: "Note doesn't exist" })

      await ctx.prisma.userNote.update({
        where: { id }, data: {
          mentions: { disconnect: oldNote.mentionsUserIds.map(id => ({ id })) }
        }
      })

      const note = await ctx.prisma.userNote.update({
        where: { id },
        data: {
          sla: Number(sla),
          type: noteType,
          status,
          mentions: {
            connect: mentions.map(id => ({ id }))
          },
        }
      })

      return {
        note,
      };
    }),
  addMessage: protectedProcedure
    .input(z.object({
      id: z.string(),
      message: z.string(),
      mentions: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input: { id, message, mentions } }) => {
      const userEmail = ctx.session.user.email
      if (!userEmail) throw new TRPCError({ code: "BAD_REQUEST", message: "User not logged in!" })

      const oldNote = await ctx.prisma.userNote.findUnique({ where: { id } })
      if (!oldNote) throw new TRPCError({ code: "BAD_REQUEST", message: "Note doesn't exist" })

      const note = await ctx.prisma.userNote.update({
        where: { id },
        data: {
          messages: {
            push: {
              message,
              updatedAt: new Date(),
              updatedBy: userEmail,
            }
          },
          mentions: {
            connect: mentions.filter(id => oldNote.mentionsUserIds.includes(id) ? false : true).map(id => ({ id }))
          },
        }
      })

      return {
        note,
      };
    }),
  editNoteStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(validNoteStatus),
    }))
    .mutation(async ({ ctx, input: { id, status } }) => {
      const userEmail = ctx.session.user.email
      if (!userEmail) throw new TRPCError({ code: "BAD_REQUEST", message: "User not logged in!" })
      const oldNote = await ctx.prisma.userNote.findUnique({ where: { id } })
      if (!oldNote) throw new TRPCError({ code: "BAD_REQUEST", message: "Note doesn't exist" })

      const note = await ctx.prisma.userNote.update({
        where: { id },
        data: {
          status,
          messages: {
            push: {
              message: `Status updated by ${userEmail} to ${status}`,
              updatedAt: new Date(),
              updatedBy: userEmail
            }
          }
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
      const id = ctx.session.user.id
      const isAdmin = ctx.session.user.userType === "admin"
      const notes = await ctx.prisma.userNote.findMany({
        where: isAdmin ? undefined : { mentionsUserIds: { has: id } },
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
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input: { id } }) => {
      const note = await ctx.prisma.userNote.findUnique({
        where: { id },
        include: {
          createdByUser: true,
          createdForStudent: true,
          mentions: true,
        }
      })

      return {
        note,
      }
    }),
});
