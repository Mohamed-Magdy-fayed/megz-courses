import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validCourseStatuses, validLevelTypes } from "@/lib/enumsTypes";

export const coursesRouter = createTRPCRouter({
  getUsersWithStatus: publicProcedure
    .input(z.object({ id: z.string(), status: z.enum(validCourseStatuses) }))
    .query(async ({ input: { id, status }, ctx }) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          id,
        },
        include: { orders: true }
      });

      const userIds = course?.orders.map(o => o.userId)

      const users = await ctx.prisma.user.findMany({
        where: { id: { in: userIds } },
        include: {
          orders: true,
        }
      })

      const usersWithStatus = users.filter(u => u.courseStatus.some(({ courseId, state }) => courseId === course?.id && state === status))

      return { usersWithStatus };
    }),
  getWaitingList: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          id,
        },
        include: { orders: true }
      });

      const userIds = course?.orders.map(o => o.userId)

      const users = await ctx.prisma.user.findMany({
        where: { id: { in: userIds } },
        include: {
          orders: true,
        }
      })

      const watingUsers = users.filter(u => u.courseStatus.some(({ courseId, state }) => courseId === course?.id && state === "waiting"))

      return { watingUsers };
    }),
  getWaitingLists: publicProcedure
    .query(async ({ ctx }) => {
      const courses = await ctx.prisma.course.findMany({
        include: { orders: true }
      });

      const coursesWaitingUsers = await Promise.all(courses.map(async (course) => {
        const userIds = course?.orders.map(order => order.userId)

        const users = await ctx.prisma.user.findMany({
          where: { id: { in: userIds } }
        })

        const watingUsers = users.filter(user => user.courseStatus.some(({ courseId, state }) => courseId === course?.id && state === "waiting"))
        return {
          courseId: course.id,
          waitingList: watingUsers.length,
        }
      }))


      return { coursesWaitingUsers };
    }),
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
          placementTests: { include: { oralTestTime: true, trainer: true, writtenTest: true } },
          evaluationFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: { include: { materialItem: true } } } }
        },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No user found" })

      const courses = await ctx.prisma.course.findMany({
        where: {
          id: {
            in: user.orders.flatMap(order => order.courseIds),
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
          materialItems: {
            include: {
              evaluationForms: true,
            },
          },
          evaluationForms: { include: { questions: true } },
          zoomGroup: true,
          orders: { include: { user: true } },
          placementTests: {
            include: {
              student: true,
              trainer: { include: { user: true } },
              oralTestTime: true,
              writtenTest: { include: { questions: true, submissions: true } }
            }
          }
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
        levels: z.array(z.enum(validLevelTypes)),
      })
    )
    .mutation(async ({ input: {
      name,
      image,
      description,
      groupPrice,
      privatePrice,
      instructorPrice,
      levels,
    }, ctx }) => {
      const course = await ctx.prisma.course.create({
        data: {
          name,
          image,
          description,
          groupPrice,
          privatePrice,
          instructorPrice,
          levels,
        },
      });

      return {
        course,
      };
    }),
  dublicateCourse: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const existingCourse = await ctx.prisma.course.findUnique({ where: { id } })
      if (!existingCourse) throw new TRPCError({ code: "BAD_REQUEST", message: "can't find course" })

      const course = await ctx.prisma.course.create({
        data: {
          name: existingCourse.name,
          image: existingCourse.image,
          description: existingCourse.description,
          groupPrice: existingCourse.groupPrice,
          privatePrice: existingCourse.privatePrice,
          instructorPrice: existingCourse.instructorPrice,
          levels: existingCourse.levels,
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
        image: z.string(),
        description: z.string(),
        groupPrice: z.number(),
        privatePrice: z.number(),
        instructorPrice: z.number(),
        levels: z.array(z.enum(validLevelTypes)),
      })
    )
    .mutation(async ({ ctx, input: { name, id, description, groupPrice, image, instructorPrice, levels, privatePrice } }) => {
      const updatedCourse = await ctx.prisma.course.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          groupPrice,
          privatePrice,
          levels,
          instructorPrice,
          image,
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
