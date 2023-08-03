import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
