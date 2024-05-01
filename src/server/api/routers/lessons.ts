import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const lessonsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const lessons = await ctx.prisma.lesson.findMany({
      include: {
        materials: true,
      },
    });

    return { lessons };
  }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id },
        include: { materials: true },
      });
      return { lesson };
    }),
  getByLevelId: protectedProcedure
    .input(
      z.object({
        levelId: z.string(),
      })
    )
    .query(async ({ ctx, input: { levelId } }) => {
      const lessons = await ctx.prisma.lesson.findMany({
        where: { levelId },
        include: { materials: true },
      });
      return { lessons };
    }),
  createLesson: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        levelId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lesson = await ctx.prisma.lesson.create({
        data: {
          name: input.name,
          levelId: input.levelId,
        },
        include: {
          materials: true,
        },
      });

      return {
        lesson,
      };
    }),
  editLesson: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        levelId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { name, id, levelId } }) => {
      const updatedlesson = await ctx.prisma.lesson.update({
        where: {
          id,
        },
        data: {
          name,
          levelId,
        },
        include: {
          materials: true,
        },
      });

      return { updatedlesson };
    }),
  deleteLessons: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
      const deletedLessons = await ctx.prisma.lesson.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });

      return { deletedLessons };
    }),
});
