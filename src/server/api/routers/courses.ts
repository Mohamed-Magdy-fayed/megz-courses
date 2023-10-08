import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const coursesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.prisma.course.findMany({
      include: {
        levels: true,
      },
    });

    return { courses };
  }),
  getStudentCourses: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input: { userId } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: true,
          placementTests: true,
        },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No user found" })

      const courses = await ctx.prisma.course.findMany({
        where: {
          id: {
            in: user.courseStatus.map(item => item.courseId),
          }
        },
        include: {
          levels: {
            include: {
              lessons: true,
            },
          },
        },
      });

      return { courses, user };
    }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input: { id } }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id },
        include: {
          levels: {
            include: {
              lessons: true,
            },
          },
        },
      });
      return { course };
    }),
  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        form: z.string(),
        oralTest: z.string(),
      })
    )
    .mutation(async ({ input: {
      form,
      name,
      oralTest,
      price
    }, ctx }) => {
      const course = await ctx.prisma.course.create({
        data: {
          name,
          price,
          form,
          oralTest,
        },
        include: {
          levels: true,
        },
      });

      return {
        course,
      };
    }),
  editCourse: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        form: z.string(),
        oralTest: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { name, id, form, oralTest } }) => {
      const updatedCourse = await ctx.prisma.course.update({
        where: {
          id,
        },
        data: {
          name,
          form,
          oralTest,
        },
        include: {
          levels: true,
        },
      });

      return { updatedCourse };
    }),
  deleteCourses: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const deletedCourses = await ctx.prisma.course.deleteMany({
        where: {
          id: {
            in: input,
          },
        },
      });

      return { deletedCourses };
    }),
});
