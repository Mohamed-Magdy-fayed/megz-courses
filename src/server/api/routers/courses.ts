import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validCourseStatuses } from "@/lib/enumsTypes";

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
          courseStatus: true,
        }
      })

      const usersWithStatus = users.filter(u => u.courseStatus.some((courseStatus) => courseStatus.courseId === course?.id && courseStatus.status === status))

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
          courseStatus: true,
        }
      })

      const watingUsers = users.filter(u => u.courseStatus.some(({ courseId, status }) => courseId === course?.id && status === "waiting"))

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
          where: { id: { in: userIds } },
          include: { courseStatus: true }
        })

        const watingUsers = users.filter(user => user.courseStatus.some(({ courseId, status }) => courseId === course?.id && status === "waiting"))
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
        include: { orders: true, levels: true }
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
        include: { levels: true }
      });

      return { courses };
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.prisma.course.findMany({
      include: {
        orders: {
          include: {
            user: {
              include: { orders: true, courseStatus: true }
            }
          }
        },
        evaluationForms: true,
        levels: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return { courses };
  }),
  getStudentCourses: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          orders: true,
          placementTests: { include: { oralTestTime: true, trainer: true, writtenTest: true } },
          evaluationFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: { include: { materialItem: true } } } },
          courseStatus: { include: { level: true } },
        },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No user found" })

      const courses = await ctx.prisma.course.findMany({
        where: {
          id: {
            in: user.orders.flatMap(order => order.courseIds),
          }
        },
        include: { levels: true },
        orderBy: { createdAt: "desc" },
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
          evaluationForms: { include: { questions: true } },
          zoomGroups: true,
          orders: { include: { user: true } },
          placementTests: {
            include: {
              student: true,
              trainer: { include: { user: true } },
              oralTestTime: true,
              writtenTest: { include: { questions: true, submissions: true } },
              course: true,
            }
          },
          levels: { include: { materialItems: { include: { evaluationForms: true, zoomSessions: true } } } },
        },
      });
      return { course };
    }),
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input: { slug } }) => {
      const course = await ctx.prisma.course.findUnique({
        where: { slug },
        include: {
          levels: {
            include: {
              materialItems: {
                include: {
                  courseLevel: true,
                  evaluationForms: { include: { materialItem: { include: { courseLevel: true } }, questions: true, submissions: true } }
                }
              },
              evaluationForms: { include: { materialItem: true, questions: true, submissions: true, courseLevel: true } },
              course: true,
              zoomGroups: true,
            },
          },
          evaluationForms: {
            include: {
              questions: true,
              submissions: {
                include: {
                  student: { include: { certificates: true } },
                  evaluationForm: { include: { materialItem: { include: { courseLevel: true } }, courseLevel: true } }
                }
              },
              materialItem: true,
              courseLevel: true,
            }
          },
          zoomGroups: { include: { zoomSessions: true, courseLevel: true } },
          orders: { include: { user: true } },
          placementTests: {
            include: {
              student: { include: { courseStatus: { include: { level: true } } } },
              trainer: { include: { user: true } },
              oralTestTime: true,
              writtenTest: { include: { questions: true, submissions: true } },
              course: { include: { levels: true } },
            }
          },
          courseStatus: { include: { user: { include: { orders: true } }, level: true } }
        },
      });
      return { course };
    }),
  getLearningLayoutData: protectedProcedure
    .input(
      z.object({
        courseSlug: z.string(),
        levelSlug: z.string(),
      })
    )
    .query(async ({ ctx, input: { courseSlug, levelSlug } }) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          slug: courseSlug,
        },
        include: {

        }
      });

      const level = await ctx.prisma.courseLevel.findUnique({
        where: {
          slug: levelSlug,
        },
        include: {
          evaluationForms: true,
          materialItems: { include: { evaluationForms: true } }
        }
      })
      if (!course || !level) throw new TRPCError({ code: "BAD_REQUEST", message: "no course or level found" })

      return { course, level };
    }),
  createCourse: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        image: z.string(),
        description: z.string(),
        groupPrice: z.number(),
        privatePrice: z.number(),
        instructorPrice: z.number(),
      })
    )
    .mutation(async ({ input: {
      name,
      slug,
      image,
      description,
      groupPrice,
      privatePrice,
      instructorPrice,
    }, ctx }) => {
      const course = await ctx.prisma.course.create({
        data: {
          name,
          slug,
          image,
          description,
          groupPrice,
          privatePrice,
          instructorPrice,
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
      const existingCourse = await ctx.prisma.course.findUnique({ where: { id }, include: { levels: true } })
      if (!existingCourse) throw new TRPCError({ code: "BAD_REQUEST", message: "can't find course" })

      const randoSlug = Math.random().toString(36).substring(2, 4)
      const course = await ctx.prisma.course.create({
        data: {
          name: existingCourse.name,
          slug: `${existingCourse.slug}_${randoSlug}`,
          image: existingCourse.image,
          description: existingCourse.description,
          groupPrice: existingCourse.groupPrice,
          privatePrice: existingCourse.privatePrice,
          instructorPrice: existingCourse.instructorPrice,
          levels: {
            connect: existingCourse.levels.map(({ id }) => ({ id }))
          },
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
        slug: z.string(),
        image: z.string(),
        description: z.string(),
        groupPrice: z.number(),
        privatePrice: z.number(),
        instructorPrice: z.number(),
      })
    )
    .mutation(async ({ ctx, input: { name, slug, id, description, groupPrice, image, instructorPrice, privatePrice } }) => {
      const updatedCourse = await ctx.prisma.course.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
          description,
          groupPrice,
          privatePrice,
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
