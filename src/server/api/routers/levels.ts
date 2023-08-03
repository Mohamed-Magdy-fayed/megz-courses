import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const levelsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const levels = await ctx.prisma.level.findMany({
      include: {
        lessons: true,
      },
    });

    return { levels };
  }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const level = await ctx.prisma.level.findUnique({
        where: { id },
        include: {
          lessons: {
            include: {
              materials: true,
            },
          },
        },
      });
      return { level };
    }),
  createLevel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        code: z.string(),
        courseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const level = await ctx.prisma.level.create({
        data: {
          name: input.name,
          code: input.code,
          courseId: input.courseId,
        },
        include: {
          lessons: true,
        },
      });

      return {
        level,
      };
    }),
  editLevel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        code: z.string(),
        courseId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { name, id, code, courseId } }) => {
      const updatedLevel = await ctx.prisma.level.update({
        where: {
          id,
        },
        data: {
          name,
          code,
          courseId,
        },
        include: {
          lessons: true,
        },
      });

      return { updatedLevel };
    }),
  deleteLevels: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const deletedLevels = await ctx.prisma.level.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });

      return { deletedLevels };
    }),
});
