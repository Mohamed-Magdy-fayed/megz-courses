import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validLevelTypes } from "@/lib/enumsTypes";

export const coursesRouter = createTRPCRouter({
  getLatest: publicProcedure
    .query(async ({ ctx }) => {
      const courses = await ctx.prisma.course.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: { orders: true, materialItems: true }
      });

      return { courses };
    }),
  query: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input: { query } }) => {
      const courses = await ctx.prisma.course.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive"
          },
        },
      });

      return { courses };
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.prisma.course.findMany({
      include: { orders: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
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
          materialItems: true
        },
        orderBy: { createdAt: "desc" }
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
          materialItems: true,
          orders: { include: { user: true } },
          placementTests: { include: { student: true, trainer: { include: { user: true } } } }
        },
      });
      return { course };
    }),
  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string(),
        description: z.string(),
        groupPrice: z.number(),
        privatePrice: z.number(),
        instructorPrice: z.number(),
        form: z.string(),
        oralTest: z.string(),
        level: z.enum(validLevelTypes),
      })
    )
    .mutation(async ({ input: {
      form,
      name,
      image,
      description,
      oralTest,
      groupPrice,
      privatePrice,
      instructorPrice,
      level,
    }, ctx }) => {
      const course = await ctx.prisma.course.create({
        data: {
          name,
          image,
          description,
          groupPrice,
          privatePrice,
          instructorPrice,
          form,
          oralTest,
          level,
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
      });

      return { updatedCourse };
    }),
  deleteCourses: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
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
