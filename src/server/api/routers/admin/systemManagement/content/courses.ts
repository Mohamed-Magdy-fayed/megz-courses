import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";

export const coursesRouter = createTRPCRouter({
  getLearningMenu: protectedProcedure
    .input(z.object({ courseSlug: z.string() }))
    .query(async ({ ctx, input: { courseSlug } }) => {
      const courseStatues = await ctx.prisma.courseStatus.findMany({
        where: {
          userId: ctx.session.user.id,
          course: { slug: courseSlug },
          level: { isNot: null },
          status: "Ongoing",
        },
        select: {
          id: true,
          course: { select: { id: true, name: true, slug: true,createdAt: true } },
          level: {
            select: {
              id: true, name: true, slug: true,
              materialItems: {
                select: {
                  id: true, title: true, slug: true,
                  systemForms: { select: { id: true } }
                }
              }
            }
          },
        }
      });

      if (!courseStatues) throw new TRPCError({ code: "BAD_REQUEST", message: "no courseStatues found" })

      return { courseStatues };
    }),
  getWaitingList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id }, ctx }) => {
      const watingUsers = await ctx.prisma.user.findMany({
        where: { courseStatus: { some: { courseId: id, status: "Waiting" } } },
        include: {
          orders: true,
          courseStatus: true,
        }
      })

      return { watingUsers };
    }),
  getLatest: publicProcedure
    .query(async ({ ctx }) => {
      const courses = await ctx.prisma.course.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
        include: {
          _count: {
            select: { levels: true }
          },
          productItems: { select: { product: { select: { _count: { select: { orders: true } } } } } },
        },
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
        include: {
          _count: {
            select: { levels: true }
          },
          productItems: { select: { product: { select: { _count: { select: { orders: true } } } } } },
        },
      });

      return { courses };
    }),
  getSimpleAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.course.findMany({ include: { courseStatus: { include: { user: true } } } });
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.prisma.course.findMany({
      include: {
        systemForms: true,
        levels: { include: { materialItems: true } },
        courseStatus: { include: { user: true } },
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
          placementTests: { include: { tester: true, writtenTest: true } },
          systemFormSubmissions: true,
          zoomGroups: { include: { zoomSessions: { include: { materialItem: true, zoomClient: { select: { isZoom: true } } } } } },
          courseStatus: { include: { level: true } },
        },
      });

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No user found" })

      const courses = await ctx.prisma.course.findMany({
        where: {
          id: {
            in: user.courseStatus.map(status => status.courseId),
          }
        },
        include: { levels: true, systemForms: true },
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
          zoomGroups: true,
          placementTests: {
            include: {
              student: true,
              tester: { include: { user: true } },
              writtenTest: { include: { items: true, submissions: true } },
              course: true,
            }
          },
          levels: { include: { materialItems: { include: { systemForms: true, zoomSessions: true } } } },
          systemForms: true,
          courseStatus: { where: { status: "Waiting" } }
        },
      });
      return { course };
    }),
  getBySlugSimple: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input: { slug } }) => await ctx.prisma.course.findUnique({ where: { slug }, include: { levels: true } })),
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
                  systemForms: { include: { googleClient: true, items: { include: { questions: { include: { options: true } } } }, materialItem: { include: { courseLevel: true } }, submissions: { include: { student: { include: { certificates: true } } } } } }
                },
                orderBy: { sessionOrder: "asc" }
              },
              systemForms: { include: { materialItem: true, items: { include: { questions: { include: { options: true } } } }, submissions: { include: { student: { include: { certificates: true } } } }, courseLevel: true } },
              course: true,
              zoomGroups: true,
            },
          },
          systemForms: {
            include: {
              googleClient: true,
              items: { include: { questions: { include: { options: true } } } },
              submissions: {
                include: {
                  student: { include: { certificates: true } },
                  systemForm: { include: { materialItem: { include: { courseLevel: true } }, courseLevel: true } }
                }
              },
              materialItem: true,
              courseLevel: true,
            }
          },
          zoomGroups: { include: { zoomSessions: true, courseLevel: true } },
          placementTests: {
            include: {
              student: { include: { courseStatus: { include: { level: true } } } },
              tester: { include: { user: true } },
              writtenTest: { include: { items: true, submissions: { include: { student: { include: { certificates: true } } } } } },
              course: { include: { levels: true } },
              zoomSessions: { include: { zoomClient: true } },
            }
          },
          courseStatus: { include: { user: { include: { orders: true } }, level: true } }
        },
      });
      return { course };
    }),
  getPreviewBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input: { slug } }) => {
      return await ctx.prisma.course.findUnique({ where: { slug }, include: { levels: { include: { materialItems: true, } } } })
    }),
  getCourseProduct: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input: { slug } }) => {
      return await ctx.prisma.product.findFirst({ where: { productItems: { some: { course: { slug } } } } })
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
      if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "no course found" })

      const level = await ctx.prisma.courseLevel.findUnique({
        where: {
          courseId_slug: { courseId: course?.id, slug: levelSlug },
        },
        include: {
          systemForms: true,
          materialItems: { include: { systemForms: true } }
        }
      })
      if (!course || !level) throw new TRPCError({ code: "BAD_REQUEST", message: "no level found" })

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
      if (!hasPermission(ctx.session.user, "courses", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
      if (!hasPermission(ctx.session.user, "courses", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
  importCourses: protectedProcedure
    .input(
      z.array(
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
    )
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.session.user, "courses", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

      const courses = await ctx.prisma.$transaction([
        ...input.map(({ description, groupPrice, image, instructorPrice, name, privatePrice, slug }) => ctx.prisma.course.create({
          data: {
            description,
            groupPrice,
            image,
            instructorPrice,
            name,
            privatePrice,
            slug,
          }
        }))
      ])

      return {
        courses,
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
      if (!hasPermission(ctx.session.user, "courses", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
      if (!hasPermission(ctx.session.user, "courses", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
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
